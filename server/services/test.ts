import { server } from '../server';
import * as dbService from './dbService';
import * as fs from 'fs';
import { authenticationTests } from './authenticationService.test';
import { userEvaluationTests } from './userEvaluationService.test';

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
  /****************************************************************************************** 
  **************** Uncomment if you want to drop temporary databaser after tests ************
  *******************************************************************************************
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

let serverInstance = server.callback()

authenticationTests(serverInstance);
userEvaluationTests(serverInstance);
