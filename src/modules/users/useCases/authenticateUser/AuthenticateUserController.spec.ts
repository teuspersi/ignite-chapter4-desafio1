import { app } from "../../../../app";
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { hash } from 'bcryptjs';
import { v4 as uuidV4 } from 'uuid';
import { connect } from "superagent";
import { userProfileRouter } from "../../../../routes/userProfile.routes";
import { response } from "express";

let connection: Connection;

describe('Authenticate User', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuidV4();

    const password = await hash('1234', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'user', 'user@test.com.br', '${password}', 'now()', 'now()')
    `,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
  it('should be able to authenticate an user', async () => {
    const response = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: '1234'
      });

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
  })

  it('should not be able to authenticate a non-existing user', async () => {
    const response = await request(app).post('/api/v1/sessions')
      .send({
        email: 'false@user.com',
        password: '1234'
      });

    expect(response.status).toBe(401)
  })

  it('should not be able to authenticate with incorrect password', async () => {
    const response = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401)
  })
})