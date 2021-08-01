import { app } from "../../../../app";
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { hash } from 'bcryptjs';
import { v4 as uuidV4 } from 'uuid';
import { connect } from "superagent";
import { userProfileRouter } from "../../../../routes/userProfile.routes";
import { response } from "express";

let connection: Connection;

describe('Create Statement', () => {
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

  it('should be able to make a deposit', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 10,
	      description: 'Pagamento'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('amount')
    expect(response.body.type).toBe('deposit') 
    expect(response.body.description).toBe('Pagamento')
  })

  it('should not be able to make a deposit to a non-existing user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'false@user.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 10,
	      description: 'Pagamento'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    expect(response.status).toBe(401)
  })

  it('should be able to make a withdraw', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 20,
	      description: 'Pagamento'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .send({
      amount: 10,
      description: 'Sorvete'
    })
    .set({
      Authorization: `Baerer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('amount')
    expect(response.body.type).toBe('withdraw') 
    expect(response.body.description).toBe('Sorvete')
  })

  it('should not be able to make a withdraw to a non-existing user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'false@user.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 10,
	      description: 'Sorvete'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    expect(response.status).toBe(401)
  })

  it('should not be able to make a withdraw with insufficient funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: '1234'
      });

    const { token } = responseToken.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 5,
	      description: 'Pagamento'
      })
      .set({
        Authorization: `Baerer ${token}`
      })

    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .send({
      amount: 100,
      description: 'Sorvete'
    })
    .set({
      Authorization: `Baerer ${token}`
    })

    expect(response.body.message).toBe('Insufficient funds')
    expect(response.status).toBe(400)
  })
})