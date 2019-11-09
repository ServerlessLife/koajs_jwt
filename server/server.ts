import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as json from 'koa-json';
import { MyHttpError } from './services/myHttpError';
import { createRoutes } from './routers';

const server = new Koa();
server.use(json());
server.use(bodyParser());

server.use(async (ctx, next) => {
    try {
        await next();
    }
    catch (err) {                   
        if (err instanceof MyHttpError) {
            //my custom error
            ctx.status = err.status;
            ctx.body = { message: err.message };
        }
        else {
            throw err;
        }
    }
});

createRoutes(server);

export { server };
