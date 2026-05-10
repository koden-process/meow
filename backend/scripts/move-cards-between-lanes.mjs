#!/usr/bin/env node

import { MongoClient, ObjectId } from 'mongodb';

const CARD_STATUS_DELETED = 'deleted';
const EVENT_TYPE_CARD_MOVED = 'card-moved';

const usage = `Usage:
  MONGODB_URI="mongodb+srv://..." node backend/scripts/move-cards-between-lanes.mjs \\
    --source-lane-id <oldLaneId> \\
    --target-lane-id <newLaneId>

  MONGODB_URI="mongodb+srv://..." node backend/scripts/move-cards-between-lanes.mjs \\
    --team-name "Unikalo" \\
    --source-lane-name "Not Qualified" \\
    --target-lane-name "Qualified" \\
    --execute

Options:
  --mongo-uri <uri>             MongoDB URI. Prefer MONGODB_URI env var.
  --team-id <id>                Restrict lane lookup to one team.
  --team-name <name>            Restrict lane lookup to one team by exact name.
  --board-id <id>               Restrict lane lookup to one board.
  --board-name <name>           Restrict lane lookup to one board by exact name.
  --source-lane-id <id>         Source lane ObjectId.
  --source-lane-name <name>     Source lane exact name.
  --target-lane-id <id>         Target lane ObjectId.
  --target-lane-name <name>     Target lane exact name.
  --include-deleted             Also move cards with status "deleted".
  --preserve-in-lane-since      Keep each card's existing inLaneSince value.
  --no-events                   Do not insert card-moved audit events.
  --execute                     Apply writes. Without this, dry-run only.
  --list-lanes                  List matching lanes and exit.
  --help                        Show this help.

Safety:
  - Dry-run is the default.
  - Source and target lanes must resolve to exactly one lane each.
  - Source and target lanes must belong to the same team and board.
  - User board layouts are cleaned so moved cards are removed from the old lane
    and appended to the target lane.
`;

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }

    const option = arg.slice(2);
    const equalIndex = option.indexOf('=');
    const rawKey = equalIndex === -1 ? option : option.slice(0, equalIndex);
    const inlineValue = equalIndex === -1 ? undefined : option.slice(equalIndex + 1);
    const key = rawKey.replaceAll('-', '_');

    if (
      [
        'execute',
        'include_deleted',
        'preserve_in_lane_since',
        'no_events',
        'list_lanes',
        'help',
      ].includes(key)
    ) {
      options[key] = true;
      continue;
    }

    const value = inlineValue ?? argv[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${rawKey}`);
    }

    options[key] = value;

    if (inlineValue === undefined) {
      index += 1;
    }
  }

  return options;
}

function toObjectId(value, label) {
  if (!ObjectId.isValid(value)) {
    throw new Error(`${label} is not a valid MongoDB ObjectId: ${value}`);
  }

  return new ObjectId(value);
}

function objectIdEquals(left, right) {
  return left?.toString() === right?.toString();
}

function asIdString(value) {
  return value?.toString();
}

function requireMongoUri(options) {
  const uri = options.mongo_uri ?? process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Missing MongoDB URI. Set MONGODB_URI or pass --mongo-uri.');
  }

  return uri;
}

async function resolveTeam(db, options) {
  if (options.team_id) {
    const team = await db.collection('Teams').findOne({ _id: toObjectId(options.team_id, 'team id') });

    if (!team) {
      throw new Error(`No team found with id ${options.team_id}`);
    }

    return team;
  }

  if (options.team_name) {
    const teams = await db.collection('Teams').find({ name: options.team_name }).toArray();

    if (teams.length !== 1) {
      throw new Error(
        `Team name "${options.team_name}" resolved to ${teams.length} teams. Use --team-id.`
      );
    }

    return teams[0];
  }

  return null;
}

async function resolveBoard(db, options, team) {
  const query = {};

  if (options.board_id) {
    query._id = toObjectId(options.board_id, 'board id');
  }

  if (options.board_name) {
    query.name = options.board_name;
  }

  if (team) {
    query.teamId = team._id;
  }

  if (!options.board_id && !options.board_name) {
    return null;
  }

  const boards = await db.collection('Boards').find(query).toArray();

  if (boards.length !== 1) {
    throw new Error(`Board lookup resolved to ${boards.length} boards. Use --board-id.`);
  }

  return boards[0];
}

function buildLaneQuery({ id, name, team, board }) {
  const query = {};

  if (id) {
    query._id = toObjectId(id, 'lane id');
  }

  if (name) {
    query.name = name;
  }

  if (team) {
    query.teamId = team._id;
  }

  if (board) {
    query.boardId = board._id;
  }

  return query;
}

async function resolveLane(db, { id, name, label, team, board }) {
  if (!id && !name) {
    throw new Error(`Missing ${label} lane. Pass --${label}-lane-id or --${label}-lane-name.`);
  }

  const lanes = await db
    .collection('Lanes')
    .find(buildLaneQuery({ id, name, team, board }))
    .sort({ teamId: 1, boardId: 1, index: 1, name: 1 })
    .toArray();

  if (lanes.length !== 1) {
    const candidates = lanes
      .slice(0, 20)
      .map(
        (lane) =>
          `- ${lane.name} laneId=${lane._id} teamId=${lane.teamId} boardId=${lane.boardId} index=${lane.index}`
      )
      .join('\n');

    throw new Error(
      `${label} lane lookup resolved to ${lanes.length} lanes. Use lane id or add team/board scope.\n${candidates}`
    );
  }

  return lanes[0];
}

async function listLanes(db, team, board) {
  const query = {};

  if (team) {
    query.teamId = team._id;
  }

  if (board) {
    query.boardId = board._id;
  }

  const lanes = await db
    .collection('Lanes')
    .find(query)
    .sort({ teamId: 1, boardId: 1, index: 1, name: 1 })
    .toArray();

  console.log(`Found ${lanes.length} lanes`);

  for (const lane of lanes) {
    console.log(
      `${lane.name} | laneId=${lane._id} | teamId=${lane.teamId} | boardId=${lane.boardId} | index=${lane.index}`
    );
  }
}

function cardFilter(sourceLane, options) {
  const filter = {
    teamId: sourceLane.teamId,
    laneId: sourceLane._id,
  };

  if (!options.include_deleted) {
    filter.status = { $ne: CARD_STATUS_DELETED };
  }

  return filter;
}

function orderMovedCardIdsForUser(user, movedCardIdsForUser, fallbackOrder) {
  const movedSet = new Set(movedCardIdsForUser);
  const board = user.board ?? {};
  const boardOrder = [];

  for (const laneCardIds of Object.values(board)) {
    if (!Array.isArray(laneCardIds)) {
      continue;
    }

    for (const cardId of laneCardIds.map(String)) {
      if (movedSet.has(cardId) && !boardOrder.includes(cardId)) {
        boardOrder.push(cardId);
      }
    }
  }

  const remaining = fallbackOrder.filter(
    (cardId) => movedSet.has(cardId) && !boardOrder.includes(cardId)
  );

  return [...boardOrder, ...remaining];
}

function buildUpdatedBoard(user, cardsForUser, sourceLaneId, targetLaneId) {
  const movedIds = cardsForUser.map((card) => asIdString(card._id));
  const movedSet = new Set(movedIds);
  const board = { ...(user.board ?? {}) };
  const orderedMovedIds = orderMovedCardIdsForUser(user, movedIds, movedIds);

  for (const [laneId, cardIds] of Object.entries(board)) {
    if (!Array.isArray(cardIds)) {
      continue;
    }

    board[laneId] = cardIds.map(String).filter((cardId) => !movedSet.has(cardId));
  }

  const targetIds = Array.isArray(board[targetLaneId]) ? board[targetLaneId].map(String) : [];
  const targetSet = new Set(targetIds);

  for (const cardId of orderedMovedIds) {
    if (!targetSet.has(cardId)) {
      targetIds.push(cardId);
      targetSet.add(cardId);
    }
  }

  board[targetLaneId] = targetIds;

  if (Array.isArray(board[sourceLaneId]) && board[sourceLaneId].length === 0) {
    delete board[sourceLaneId];
  }

  return board;
}

function groupCardsByUser(cards) {
  const byUser = new Map();

  for (const card of cards) {
    const userId = asIdString(card.userId);
    const list = byUser.get(userId) ?? [];
    list.push(card);
    byUser.set(userId, list);
  }

  return byUser;
}

function buildMoveEvents(cards, sourceLane, targetLane, now) {
  return cards.map((card) => ({
    teamId: card.teamId,
    cardId: card._id,
    userId: card.userId,
    type: EVENT_TYPE_CARD_MOVED,
    body: {
      from: sourceLane._id,
      to: targetLane._id,
      inLaneSince: card.inLaneSince,
    },
    createdAt: now,
    updatedAt: now,
  }));
}

async function printPlan(db, sourceLane, targetLane, cards) {
  console.log('Migration plan');
  console.log(`Source lane: ${sourceLane.name} (${sourceLane._id})`);
  console.log(`Target lane: ${targetLane.name} (${targetLane._id})`);
  console.log(`Team: ${sourceLane.teamId}`);
  console.log(`Board: ${sourceLane.boardId}`);
  console.log(`Cards to move: ${cards.length}`);

  if (cards.length === 0) {
    return;
  }

  const byUser = groupCardsByUser(cards);
  const users = await db
    .collection('Users')
    .find({ _id: { $in: [...byUser.keys()].map((id) => new ObjectId(id)) } })
    .project({ name: 1 })
    .toArray();
  const userNames = new Map(users.map((user) => [asIdString(user._id), user.name]));

  for (const [userId, userCards] of byUser) {
    const total = userCards.reduce((sum, card) => sum + (Number(card.amount) || 0), 0);
    console.log(`- ${userNames.get(userId) ?? userId}: ${userCards.length} cards, amount=${total}`);
  }

  console.log('First cards:');
  for (const card of cards.slice(0, 20)) {
    console.log(`- ${card.name} | cardId=${card._id} | amount=${card.amount} | userId=${card.userId}`);
  }
}

async function executeMigration(db, sourceLane, targetLane, cards, options) {
  const now = new Date();
  const sourceLaneId = asIdString(sourceLane._id);
  const targetLaneId = asIdString(targetLane._id);
  const cardIds = cards.map((card) => card._id);
  const byUser = groupCardsByUser(cards);

  const cardUpdate = {
    laneId: targetLane._id,
    updatedAt: now,
  };

  if (!options.preserve_in_lane_since) {
    cardUpdate.inLaneSince = now;
  }

  const cardResult = await db.collection('Cards').updateMany(
    {
      _id: { $in: cardIds },
      laneId: sourceLane._id,
      teamId: sourceLane.teamId,
    },
    { $set: cardUpdate }
  );

  let updatedBoards = 0;

  const users = await db
    .collection('Users')
    .find({ _id: { $in: [...byUser.keys()].map((id) => new ObjectId(id)) } })
    .toArray();

  for (const user of users) {
    const cardsForUser = byUser.get(asIdString(user._id)) ?? [];
    const board = buildUpdatedBoard(user, cardsForUser, sourceLaneId, targetLaneId);

    const result = await db
      .collection('Users')
      .updateOne({ _id: user._id }, { $set: { board, updatedAt: now } });

    updatedBoards += result.modifiedCount;
  }

  let insertedEvents = 0;

  if (!options.no_events && cards.length > 0) {
    const events = buildMoveEvents(cards, sourceLane, targetLane, now);
    const eventResult = await db.collection('Events').insertMany(events, { ordered: true });
    insertedEvents = eventResult.insertedCount;
  }

  return {
    matchedCards: cardResult.matchedCount,
    modifiedCards: cardResult.modifiedCount,
    updatedBoards,
    insertedEvents,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage);
    return;
  }

  const uri = requireMongoUri(options);
  const client = new MongoClient(uri);

  await client.connect();

  try {
    const db = client.db();
    const team = await resolveTeam(db, options);
    const board = await resolveBoard(db, options, team);

    if (options.list_lanes) {
      await listLanes(db, team, board);
      return;
    }

    const sourceLane = await resolveLane(db, {
      id: options.source_lane_id,
      name: options.source_lane_name,
      label: 'source',
      team,
      board,
    });

    const targetLane = await resolveLane(db, {
      id: options.target_lane_id,
      name: options.target_lane_name,
      label: 'target',
      team,
      board,
    });

    if (objectIdEquals(sourceLane._id, targetLane._id)) {
      throw new Error('Source lane and target lane are identical.');
    }

    if (!objectIdEquals(sourceLane.teamId, targetLane.teamId)) {
      throw new Error('Source lane and target lane are not on the same team.');
    }

    if (!objectIdEquals(sourceLane.boardId, targetLane.boardId)) {
      throw new Error('Source lane and target lane are not on the same board.');
    }

    const cards = await db
      .collection('Cards')
      .find(cardFilter(sourceLane, options))
      .sort({ userId: 1, createdAt: 1, _id: 1 })
      .toArray();

    await printPlan(db, sourceLane, targetLane, cards);

    if (!options.execute) {
      console.log('\nDry-run only. Re-run with --execute to apply this migration.');
      return;
    }

    if (cards.length === 0) {
      console.log('Nothing to move.');
      return;
    }

    const result = await executeMigration(db, sourceLane, targetLane, cards, options);

    console.log('\nMigration applied');
    console.log(`Matched cards: ${result.matchedCards}`);
    console.log(`Modified cards: ${result.modifiedCards}`);
    console.log(`Updated user boards: ${result.updatedBoards}`);
    console.log(`Inserted card-moved events: ${result.insertedEvents}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
