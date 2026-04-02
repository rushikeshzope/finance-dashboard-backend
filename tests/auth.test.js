import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Auth API integration tests', () => {
  const testUser = {
    email: 'integration@test.com',
    password: 'password123',
    name: 'Integration User'
  };

  it('should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('email', testUser.email);
    expect(res.body.data.user).toHaveProperty('role', 'VIEWER');
  });

  it('should return 422 if email is missing or malformed', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Invalid User'
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });

  it('should successfully login an existing user', async () => {
    // Because of setup.js beforeEach wiping the DB, we create the user first
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should return 401 for invalid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
