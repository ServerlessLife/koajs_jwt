import { server } from './server';
import { config } from './config';

server.listen(config.port);

console.log(`Server running on port ${config.port}`);