import test from 'ava';
import request from 'supertest';
import { Helper } from './helpers/helper.js';
import { TransferStatus } from '../entities/OpportunityTransfer.js';

const URL = process.env.URL!;

// Test context for two users in different teams
const senderContext = { token: '', user: Helper.createRandomUser(), teamId: '', cardId: '' };
const receiverContext = { token: '', user: Helper.createRandomUser(), teamId: '' };

test.serial('Setup: Register sender user and login', async (t) => {
  // Register sender
  const registerRes = await request(URL)
    .post('/public/register')
    .set('Content-Type', 'application/json')
    .send({
      name: senderContext.user.name,
      password: senderContext.user.password,
    });
  
  t.is(registerRes.statusCode, 201);

  // Login sender
  const loginRes = await request(URL)
    .post('/public/login')
    .set('Content-Type', 'application/json')
    .send({
      name: senderContext.user.name,
      password: senderContext.user.password,
    });

  t.is(loginRes.statusCode, 200);
  senderContext.token = loginRes.body.token;
  senderContext.teamId = loginRes.body.user.teamId;
});

test.serial('Setup: Register receiver user and login', async (t) => {
  // Register receiver
  const registerRes = await request(URL)
    .post('/public/register')
    .set('Content-Type', 'application/json')
    .send({
      name: receiverContext.user.name,
      password: receiverContext.user.password,
    });
  
  t.is(registerRes.statusCode, 201);

  // Login receiver
  const loginRes = await request(URL)
    .post('/public/login')
    .set('Content-Type', 'application/json')
    .send({
      name: receiverContext.user.name,
      password: receiverContext.user.password,
    });

  t.is(loginRes.statusCode, 200);
  receiverContext.token = loginRes.body.token;
  receiverContext.teamId = loginRes.body.user.teamId;
});

test.serial('Setup: Create a card for transfer testing', async (t) => {
  // First get lanes for the sender
  const lanesRes = await request(URL)
    .get('/api/lanes')
    .set('Authorization', `Bearer ${senderContext.token}`);

  t.is(lanesRes.statusCode, 200);
  t.true(lanesRes.body.length > 0);
  
  const firstLane = lanesRes.body[0];

  // Create a card
  const cardRes = await request(URL)
    .post('/api/cards')
    .set('Authorization', `Bearer ${senderContext.token}`)
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test Opportunity for Transfer',
      amount: 10000,
      laneId: firstLane._id,
    });

  t.is(cardRes.statusCode, 201);
  senderContext.cardId = cardRes.body._id;
});

test.serial('POST /api/opportunity-transfers creates a transfer request', async (t) => {
  const res = await request(URL)
    .post('/api/opportunity-transfers')
    .set('Authorization', `Bearer ${senderContext.token}`)
    .set('Content-Type', 'application/json')
    .send({
      cardId: senderContext.cardId,
      toTeamId: receiverContext.teamId,
      message: 'This opportunity is in your territory, can you handle it?',
    });

  t.is(res.statusCode, 201);
  t.is(res.body.status, TransferStatus.Pending);
  t.is(res.body.fromTeamId, senderContext.teamId);
  t.is(res.body.toTeamId, receiverContext.teamId);
  t.is(res.body.cardId, senderContext.cardId);
});

test.serial('GET /api/opportunity-transfers?type=sent returns sent transfers', async (t) => {
  const res = await request(URL)
    .get('/api/opportunity-transfers?type=sent')
    .set('Authorization', `Bearer ${senderContext.token}`);

  t.is(res.statusCode, 200);
  t.true(res.body.length >= 1);
  
  const transfer = res.body.find((t: any) => t.cardId === senderContext.cardId);
  t.truthy(transfer);
  t.is(transfer.status, TransferStatus.Pending);
});

test.serial('GET /api/opportunity-transfers?type=received returns received transfers', async (t) => {
  const res = await request(URL)
    .get('/api/opportunity-transfers?type=received')
    .set('Authorization', `Bearer ${receiverContext.token}`);

  t.is(res.statusCode, 200);
  t.true(res.body.length >= 1);
  
  const transfer = res.body.find((t: any) => t.cardId === senderContext.cardId);
  t.truthy(transfer);
  t.is(transfer.status, TransferStatus.Pending);
});

test.serial('POST /api/opportunity-transfers/:id/accept accepts a transfer', async (t) => {
  // First get the transfer
  const listRes = await request(URL)
    .get('/api/opportunity-transfers?type=received')
    .set('Authorization', `Bearer ${receiverContext.token}`);

  const transfer = listRes.body.find((t: any) => t.cardId === senderContext.cardId);
  t.truthy(transfer);

  // Accept the transfer
  const res = await request(URL)
    .post(`/api/opportunity-transfers/${transfer._id}/accept`)
    .set('Authorization', `Bearer ${receiverContext.token}`)
    .set('Content-Type', 'application/json')
    .send({
      responseMessage: 'I will take care of this opportunity',
    });

  t.is(res.statusCode, 200);
  t.is(res.body.status, TransferStatus.Accepted);
  t.truthy(res.body.respondedBy);
  t.truthy(res.body.respondedAt);

  // Verify the card was transferred
  const cardRes = await request(URL)
    .get(`/api/cards/${senderContext.cardId}`)
    .set('Authorization', `Bearer ${receiverContext.token}`);

  t.is(cardRes.statusCode, 200);
  t.is(cardRes.body.teamId, receiverContext.teamId);
});

test.serial('POST /api/opportunity-transfers fails when trying to transfer to same team', async (t) => {
  // Create another card for this test
  const lanesRes = await request(URL)
    .get('/api/lanes')
    .set('Authorization', `Bearer ${senderContext.token}`);

  const firstLane = lanesRes.body[0];

  const cardRes = await request(URL)
    .post('/api/cards')
    .set('Authorization', `Bearer ${senderContext.token}`)
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test Opportunity Same Team',
      amount: 5000,
      laneId: firstLane._id,
    });

  // Try to transfer to same team
  const res = await request(URL)
    .post('/api/opportunity-transfers')
    .set('Authorization', `Bearer ${senderContext.token}`)
    .set('Content-Type', 'application/json')
    .send({
      cardId: cardRes.body._id,
      toTeamId: senderContext.teamId,
      message: 'This should fail',
    });

  t.is(res.statusCode, 400);
});