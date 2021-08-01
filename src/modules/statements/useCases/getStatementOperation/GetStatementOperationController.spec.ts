import { app } from "../../../../app";
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { hash } from 'bcryptjs';
import { v4 as uuidV4 } from 'uuid';
import { connect } from "superagent";
import { userProfileRouter } from "../../../../routes/userProfile.routes";
import { response } from "express";

let connection: Connection;

describe('Get Statement Operation', () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  beforeEach(async () => {
    await connection.runMigrations();

    const id = uuidV4();

    const password = await hash('1234', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'user', 'user@test.com.br', '${password}', 'now()', 'now()')
    `,
    );
  })

  afterEach(async () => {
    await connection.dropDatabase();
  })

  afterAll(async () => {
    
    await connection.close();
  })

  it('should be able to get a statement operation info', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 10,
	      description: 'Pagamento'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .set({
        Authorization: `Baerer ${token}`
      })

    expect(response.body).toHaveProperty('type')
    expect(response.body).toHaveProperty('id')
    expect(response.body.type).toBe(deposit.body.type)
    expect(response.body.id).toBe(deposit.body.id)
    expect(response.body.user_id).toBe(deposit.body.user_id)
  })

  it('should not be able to get a statement operation info to a non-existing user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'false@user.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 10,
	      description: 'Pagamento'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .set({
        Authorization: `Baerer ${token}`
      })

    expect(response.status).toBe(401)
  })

  it('should not be able to get a statement operation info to a non-existing statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 10,
	      description: 'Pagamento'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    const falseStatementId = '0e16fd21-21cb-41c6-b8c5-5f9642a8820a'

    const response = await request(app)
      .get(`/api/v1/statements/${falseStatementId}`)
      .set({
        Authorization: `Baerer ${token}`
      })

    expect(response.body.message).toBe('Statement not found')
    expect(response.status).toBe(404)
  })
})