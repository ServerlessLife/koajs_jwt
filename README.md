
# koajs_jwt

Sample Node.js app written in TypeScript, using Koa.js, JWT authentication and Jest tests.

**Prerequisite:**

    Node.js and Docker

**Setup:**

    npm i 

**Run local database server:**

    npm run start-mysql

**Create database tables:**

    npm run db-init

**How to log in to phpMyAdmin:**

The database runs in Docker assembled with admin tool phpMyAdmin. 
 - URL: [http://localhost:8183](http://localhost:8183)
 - Server: mysql
 - Username: root
 - Password: root

**Run tests:**

    npm test

**How tests works:**

With each run new temporary database named "user_evalutation_test" is created.

**Further improvements:**
- I really like dependency injection. For example with [Inversify](https://www.npmjs.com/package/inversify).
- I choose integration test with Jest that test server, data access logic and DB. Unit test with mocking would also be great especially if there is more complex logic.
- Logging should be an essential part of the system.