//https://github.com/DarthOstrich/koa-tut
//https://codeburst.io/lets-build-a-rest-api-with-koa-js-and-test-with-jest-2634c14394d3
//https://medium.com/scrum-ai/4-testing-koa-server-with-jest-week-5-8e980cd30527
//https://www.valentinog.com/blog/testing-api-koa-jest/
import { server } from '../server/server';
import * as request from 'supertest';
import * as dbService from '../server/services/dbService';
import * as fs from 'fs';

beforeAll(async () => {
  const connection = await dbService.getSingleConnection({ multipleStatements: true });
  try {
    //synchronus blocking file read is OK in test
    const create_db_sql = fs.readFileSync("create_db.sql")

    await connection.query(
      `
      DROP DATABASE IF EXISTS user_evalutation_test;
      CREATE DATABASE user_evalutation_test;
      USE user_evalutation_test;
      ` + create_db_sql
    );
  }
  finally {
    try { connection.end() } catch (err) { }
  }
});

afterAll(async () => {
  const connection = await dbService.getSingleConnection({ multipleStatements: true });
  try {
    await connection.query(
      `
      DROP DATABASE user_evalutation_test;
      `
    );
  }
  finally {
    try { connection.end() } catch (err) { }
  }

  dbService.closePool();
});

describe('basic route tests', () => {
  test('get home route  GET /', async () => {
    const response = await request(server.callback()).get('/most-liked');
    expect(response.status).toEqual(200);

    //expect(response.text).toContain('Hello World!');
  });
});
