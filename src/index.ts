import { App } from './infrastructure/server/app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const server = new App(PORT);
server.start();