import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as json from 'koa-json';
import * as userEvaluationService from './services/userEvaluationService';
import * as authenticationService from './services/authenticationService';
import * as jwt from 'koa-jwt';
import { config } from './config';

const server = new Koa();
server.use(json());
server.use(bodyParser());

const routerUnprotected = new Router();
const routerProtected = new Router();

//Sign up to the system (username, password)
routerUnprotected.post('/signup', async (ctx) => {
    ctx.body = await authenticationService.signup(ctx.request.body);
});

//Logs in an existing user with a password
routerUnprotected.post('/login', async (ctx) => {
    ctx.body = await authenticationService.login(ctx.request.body);
});

//Get the currently logged in user information
routerProtected.get('/me', async (ctx) => {
    let user = ctx.state.user.data;
    ctx.body = await authenticationService.getUserData(user.username);
});

//Update the current users password
routerProtected.post('/me/update-password', async (ctx) => {
    let user = ctx.state.user.data;
    ctx.body = await authenticationService.updatePassword({ username: user.username, ...ctx.request.body });
});

//List username & number of likes of a user
routerUnprotected.get('/user/:id', async (ctx) => {
    ctx.body = await userEvaluationService.userData(ctx.params.id);
});

//Like a user
routerProtected.put('/user/:id/like', async (ctx) => {
    let user = ctx.state.user.data;
    ctx.body = await userEvaluationService.like({
        username: user.username,
        likeUsername: ctx.params.id
    });
});

//Un-Like a user
routerProtected.put('/user/:id/unlike', async (ctx) => {
    let user = ctx.state.user.data;
    ctx.body = await userEvaluationService.unlike({
        username: user.username,
        likeUsername: ctx.params.id
    });
});

//List users in a most liked to least liked
routerUnprotected.get('/most-liked', async (ctx) => {
    ctx.body = await userEvaluationService.mostLiked();
});

server.use(routerUnprotected.routes()).use(routerUnprotected.allowedMethods());

server.use(jwt({ secret: config.jwtSecret }));

server.use(routerProtected.routes()).use(routerProtected.allowedMethods());

export { server   } ;
