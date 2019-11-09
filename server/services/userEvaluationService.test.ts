import * as request from 'supertest';
import { commonTestData } from './commonTestData';

export function userEvaluationTests(serverInstance) {
  describe('User evaluation service', () => {
    test('Like fails, because of missing authentication', async () => {
      const response = await request(serverInstance).post(`/user/${commonTestData.userToniBaloni.username}/like`);
      expect(response.status).toEqual(401);
    });

    test('Like fails, because of an unexisting user', async () => {
      const response = await request(serverInstance).post(`/user/xxx/like`).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("User does not exists.");
    });

    test('Like fails, because the user can not like himself.', async () => {
      const response = await request(serverInstance).post(`/user/${commonTestData.userJohnDoe.username}/like`).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
      expect(response.body.message).toEqual("User can not like himslef.");
      expect(response.status).toEqual(400);
    });

    test('Like', async () => {
      const response = await request(serverInstance).post(`/user/${commonTestData.userToniBaloni.username}/like`).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
      expect(response.status).toEqual(204);
    });

    test('Like fails, because of duplicate', async () => {
      const response = await request(serverInstance).post(`/user/${commonTestData.userToniBaloni.username}/like`).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
      expect(response.status).toEqual(409);
      expect(response.body.message).toEqual('User is already liked.');
    });

    test('Unlike fails, because of missing authentication', async () => {
      const response = await request(serverInstance).delete(`/user/${commonTestData.userToniBaloni.username}/unlike`);
      expect(response.status).toEqual(401);
    });

    test('Unlike fails, because the user can not like himself.', async () => {
      const response = await request(serverInstance).delete(`/user/${commonTestData.userJohnDoe.username}/unlike`).set("Authorization", "Bearer " + commonTestData.userJohnDoeToken.token);
      expect(response.body.message).toEqual("User can not unlike himslef.");
      expect(response.status).toEqual(400);
    });

    test('Unlike fails, because like does not exists', async () => {
      const response = await request(serverInstance).delete(`/user/${commonTestData.userJohnDoe.username}/unlike`).set("Authorization", "Bearer " + commonTestData.userToniBaloniToken.token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('There is no like to remove.');
    });

    test('Like & unlike', async () => {
      let response = await request(serverInstance).post(`/user/${commonTestData.userJohnDoe.username}/like`).set("Authorization", "Bearer " + commonTestData.userToniBaloniToken.token);
      expect(response.status).toEqual(204);
      response = await request(serverInstance).delete(`/user/${commonTestData.userJohnDoe.username}/unlike`).set("Authorization", "Bearer " + commonTestData.userToniBaloniToken.token);
      expect(response.status).toEqual(204);
    });

    test('Get user likes fails, because of an unexisting user', async () => {
      const response = await request(serverInstance).get('/user/' + commonTestData.userToniBaloni.username);
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        username: commonTestData.userToniBaloni.username,
        likesNo: 1,
      });
    });

    test('Get user likes', async () => {
      const response = await request(serverInstance).get('/user/' + commonTestData.userToniBaloni.username);
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        username: commonTestData.userToniBaloni.username,
        likesNo: 1,
      });
    });

    test('Most liked', async () => {
      const response = await request(serverInstance).get('/most-liked');
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject([
        {
          "likesNo": 1,
          "name": "Toni",
          "surname": "Baloni",
          "username": "tonibaloni"
        },
        {
          "likesNo": 0,
          "name": "John",
          "surname": "Doe",
          "username": "jonhdoe"
        }
      ]);
    });
  });
}

