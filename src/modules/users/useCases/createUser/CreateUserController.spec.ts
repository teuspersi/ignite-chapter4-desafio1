import { app } from "../../../../app";
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;

describe('Create an User', () => {
  beforeAll(async () => {
    connection = await createConnection()
  });

  beforeEach(async () => {
    await connection.runMigrations();
  })

  afterEach(async () => {
    await connection.dropDatabase();
  })

  afterAll(async () => {
    await connection.close();
  })

  it('should be able to create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'User Test',
        email: 'user@test.com',
        password: '1234'
      })

    expect(response.status).toBe(201)
  })

  it('should not be able to create a already existing user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'User Test',
        email: 'user@test.com',
        password: '1234'
      })

    const response = await request(app)
    .post('/api/v1/users')
    .send({
      name: 'User Test',
      email: 'user@test.com',
      password: '1234'
    })
    
    expect(response.status).toBe(400)
  })
})