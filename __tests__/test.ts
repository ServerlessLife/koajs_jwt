//https://github.com/DarthOstrich/koa-tut
//https://codeburst.io/lets-build-a-rest-api-with-koa-js-and-test-with-jest-2634c14394d3
//https://medium.com/scrum-ai/4-testing-koa-server-with-jest-week-5-8e980cd30527
//https://www.valentinog.com/blog/testing-api-koa-jest/
import { server } from '../server/server';
import * as request from 'supertest';
import * as dbService from '../server/services/dbService';
import * as fs from 'fs';
import { config } from '../server/config';

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

    dbService.setDatabase("user_evalutation_test");
  }
  finally {
    try { connection.end() } catch (err) { }
  }
});

afterAll(async () => {
  /*
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
*/
  dbService.closePool();
});

let userJohnDoe = {
  username: "jonhdoe",
  name: "John",
  surname: "Doe",
  email: "jonh.doe@gmail.com",
  password: "jonhdoe_pass"
}

describe('Authetnication tests', () => {
  test('Singup shoud fail, because of missing data', async () => {
    let user = {
      ...userJohnDoe,
      username: undefined
    }

    let response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      name: undefined
    }

    response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      surname: undefined
    }

    response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      email: undefined
    }

    response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      password: undefined
    }

    response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");
  });

  test('Singup shoud fail, because of too long string', async () => {
    let user = {
      ...userJohnDoe,
      username: 'x'.repeat(500)
    }

    let response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      name: 'x'.repeat(500)
    }

    response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      surname: 'x'.repeat(500)
    }

    response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      email: 'x'.repeat(500)
    }

    response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");

    user = {
      ...userJohnDoe,
      password: 'x'.repeat(500)
    }
  });

  test('Singup user John Doe should return token', async () => {
    const response = await request(server.callback()).post('/signup').send(userJohnDoe);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("token");
  });

  test('Singup user Toni Baloni should return token', async () => {
    let user = {
      username: "tonibaloni",
      name: "Toni",
      surname: "Baloni",
      email: "toni.baloni@gmail.com",
      password: "tonibaloni_pass"
    }

    const response = await request(server.callback()).post('/signup').send(user);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("token");

  });

  test('Login should fail because of wrong password', async () => {
    const response = await request(server.callback()).post('/login').send({
      username: userJohnDoe.username,
      password: 'xxxx'
    });
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty("message");
  });

  let userJohnDoeToken;

  test('Login user John Doe', async () => {
    const response = await request(server.callback()).post('/login').send({
      username: userJohnDoe.username,
      password: userJohnDoe.password
    });

    userJohnDoeToken = response.body;

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("token");

  });

  test('Fail read my (John Doe) data becouse of missing authentication', async () => {
    let response = await request(server.callback()).get('/me').set(
      "Authorization", "Bearer " + 'xxx'
    );

    expect(response.status).toEqual(401);

    response = await request(server.callback()).get('/me');
    expect(response.status).toEqual(401);
  });

  test('Read my (John Doe) data', async () => {
    const response = await request(server.callback()).get('/me').set(
      "Authorization", "Bearer " + userJohnDoeToken.token
    );

    expect(response.status).toEqual(200);
    let expectedResponse = { ...userJohnDoe };
    delete expectedResponse.password;
    expect(response.body).toMatchObject(expectedResponse);
  });


  test('Change password fail because of missing data', async () => {
    let response = await request(server.callback()).post('/me/update-password').send({
      oldPassword: userJohnDoe.password,
    }).set(
      "Authorization", "Bearer " + userJohnDoeToken.token
    );

    expect(response.status).toEqual(400);

    response = await request(server.callback()).post('/me/update-password').send({
      newPassword: 'newPassword'
    }).set(
      "Authorization", "Bearer " + userJohnDoeToken.token
    );

    expect(response.status).toEqual(400);

    response = await request(server.callback()).post('/me/update-password').set(
      "Authorization", "Bearer " + userJohnDoeToken.token
    );

    expect(response.status).toEqual(400);
  });

  test('Change password fail because of becouse of missing authentication', async () => {
    const response = await request(server.callback()).post('/me/update-password').send({
      oldPassword: userJohnDoe.password,
      newPassword: 'newPassword'
    });

    expect(response.status).toEqual(401);
  });

  test('Change password', async () => {
    const response = await request(server.callback()).post('/me/update-password').send({
      oldPassword: userJohnDoe.password,
      newPassword: 'newPassword'
    }).set(
      "Authorization", "Bearer " + userJohnDoeToken.token
    );

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("token");
  });
});

describe('Like tests', () => {
  test('get home route  GET /', async () => {
    const response = await request(server.callback()).get('/most-liked');
    expect(response.status).toEqual(200);

    //expect(response.text).toContain('Hello World!');
  });
});
