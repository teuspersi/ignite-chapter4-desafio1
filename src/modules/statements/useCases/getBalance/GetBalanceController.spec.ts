import { app } from "../../../../app";
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { hash } from 'bcryptjs';
import { v4 as uuidV4 } from 'uuid';
import { connect } from "superagent";
import { userProfileRouter } from "../../../../routes/userProfile.routes";
import { response } from "express";

let connection: Connection;

describe('Get Balance', () => {
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

  it('should be able to get user balance', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Baerer ${token}`
      })

      expect(response.body).toHaveProperty('balance')
      expect(response.body).toHaveProperty('statement')
  })

  it('should not be able to get a non-existing user balance', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'false@user.com',
        password: '1234'
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Baerer ${token}`
      })

    expect(response.status).toBe(401)
  })
})