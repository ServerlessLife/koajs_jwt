import * as request from 'supertest';
import { commonTestData } from './commonTestData';

export function authenticationTests(serverInstance) {
    describe('Authentication', () => {
        test('Sing up fails, because of missing data', async () => {
            let user = {
                ...commonTestData.userJohnDoe,
                username: undefined
            };
            let response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                name: undefined
            };
            response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                surname: undefined
            };
            response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                email: undefined
            };
            response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                password: undefined
            };
            response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test('Sing up fails, because of too long string', async () => {
            let user = {
                ...commonTestData.userJohnDoe,
                username: 'x'.repeat(500)
            };
            let response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                name: 'x'.repeat(500)
            };
            response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                surname: 'x'.repeat(500)
            };
            response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                email: 'x'.repeat(500)
            };
            response = await request(serverInstance).post('/signup').send(user);
            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
            user = {
                ...commonTestData.userJohnDoe,
                password: 'x'.repeat(500)
            };
        });

        test('Sing up user John Doe returns token', async () => {
            const response = await request(serverInstance).post('/signup').send(commonTestData.userJohnDoe);
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("token");
        });

        test('Sing up user Toni Baloni returns token', async () => {
            const response = await request(serverInstance).post('/signup').send(commonTestData.userToniBaloni);
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("token");
        });

        test('Login fails, because of wrong password', async () => {
            const response = await request(serverInstance).post('/login').send({
                username: commonTestData.userJohnDoe.username,
                password: 'xxxx'
            });
            expect(response.status).toEqual(401);
            expect(response.body).toHaveProperty("message");
        });

        test('Login user John Doe', async () => {
            const response = await request(serverInstance).post('/login').send({
                username: commonTestData.userJohnDoe.username,
                password: commonTestData.userJohnDoe.password
            });
            commonTestData.userJohnDoeToken = response.body;
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("token");
        });

        test('Fail read my (John Doe) data because of missing authentication', async () => {
            let response = await request(serverInstance).get('/me').set("Authorization", "Bearer " + 'xxx');
            expect(response.status).toEqual(401);
            response = await request(serverInstance).get('/me');
            expect(response.status).toEqual(401);
        });

        test('Read my (John Doe) data', async () => {
            let response = await request(serverInstance).get('/me').set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
            expect(response.status).toEqual(200);
            let expectedResponse = { ...commonTestData.userJohnDoe };
            delete expectedResponse.password;
            expect(response.body).toMatchObject(expectedResponse);
            //login
            response = await request(serverInstance).post('/login').send({
                username: commonTestData.userToniBaloni.username,
                password: commonTestData.userToniBaloni.password
            });
            commonTestData.userToniBaloniToken = response.body;
        });

        test('Change password fail because of missing data', async () => {
            let response = await request(serverInstance).patch('/me/update-password').send({
                oldPassword: commonTestData.userJohnDoe.password,
            }).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
            expect(response.status).toEqual(400);
            response = await request(serverInstance).patch('/me/update-password').send({
                newPassword: 'newPassword'
            }).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
            expect(response.status).toEqual(400);
            response = await request(serverInstance).patch('/me/update-password').set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
            expect(response.status).toEqual(400);
        });

        test('Change password fail because of missing authentication', async () => {
            const response = await request(serverInstance).patch('/me/update-password').send({
                oldPassword: commonTestData.userJohnDoe.password,
                newPassword: 'newPassword'
            });
            expect(response.status).toEqual(401);
        });

        test('Change password', async () => {
            const response = await request(serverInstance).patch('/me/update-password').send({
                oldPassword: commonTestData.userJohnDoe.password,
                newPassword: 'newPassword'
            }).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("token");
        });
    });
}

