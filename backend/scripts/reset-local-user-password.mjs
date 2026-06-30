import { emitKeypressEvents } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hash } from 'bcrypt';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is required.');
}

const client = new MongoClient(uri);

function readHidden(question) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('A TTY is required to enter the local password securely.');
  }

  emitKeypressEvents(stdin);
  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = '';

    const finish = (error) => {
      stdin.off('keypress', onKeypress);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');

      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    };

    const onKeypress = (character, key) => {
      if (key?.ctrl && key.name === 'c') {
        finish(new Error('Password entry cancelled.'));
        return;
      }

      if (key?.name === 'return' || key?.name === 'enter') {
        finish();
        return;
      }

      if (key?.name === 'backspace') {
        value = Array.from(value).slice(0, -1).join('');
        return;
      }

      if (character && !key?.ctrl && !key?.meta) {
        value += character;
      }
    };

    stdin.on('keypress', onKeypress);
  });
}

try {
  await client.connect();
  const database = client.db();

  const teamTotals = await database.collection('Cards').aggregate([
    { $match: { teamId: { $exists: true, $ne: null } } },
    { $group: { _id: '$teamId', cards: { $sum: 1 } } },
    { $sort: { cards: -1, _id: 1 } },
    { $limit: 1 },
  ]).toArray();

  if (teamTotals.length === 0) {
    throw new Error('No team with opportunities was found.');
  }

  const teamId = teamTotals[0]._id;
  const team = await database.collection('Teams').findOne(
    { _id: teamId },
    { projection: { name: 1 } }
  );
  const users = await database.collection('Users')
    .find(
      { teamId, status: 'enabled' },
      { projection: { name: 1 } }
    )
    .sort({ name: 1, _id: 1 })
    .toArray();

  if (users.length === 0) {
    throw new Error('No enabled user was found in the team with the most opportunities.');
  }

  console.log(
    `Team with the most opportunities: ${team?.name ?? teamId.toString()} `
      + `(${teamTotals[0].cards} opportunities)`
  );
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name}`);
  });

  const prompt = createInterface({ input: stdin, output: stdout });
  const answer = await prompt.question('Select the local login account by number: ');
  prompt.close();
  const selectedIndex = Number.parseInt(answer.trim(), 10) - 1;

  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= users.length) {
    throw new Error('Invalid user selection.');
  }

  let password;
  while (true) {
    password = await readHidden('Local password (minimum 3 characters): ');
    const confirmation = await readHidden('Confirm local password: ');

    if (password.length < 3) {
      console.log('Password is too short.');
      continue;
    }

    if (password !== confirmation) {
      console.log('Passwords do not match.');
      continue;
    }

    break;
  }

  const selectedUser = users[selectedIndex];
  const passwordHash = await hash(password, 10);
  const result = await database.collection('Users').updateOne(
    { _id: selectedUser._id, teamId, status: 'enabled' },
    {
      $set: {
        'authentication.local.password': passwordHash,
      },
    }
  );

  if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
    throw new Error('The selected user could not be updated.');
  }

  console.log(`Local login ready for: ${selectedUser.name}`);
} finally {
  await client.close();
}
