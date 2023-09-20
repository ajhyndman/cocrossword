import { Log } from './log';

const actions = new Log<string>();

const server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response('Upgrade failed :(', { status: 500 });
  },
  websocket: {
    message(ws, message) {
      console.log(message);
      actions.push(message);
    }, // a message is received
    open(ws) {
      console.log('connection opened');
      console.log(actions.length);
      actions.subscribe((action) => {
        ws.send(action);
      });
    }, // a socket is opened
    close(ws, code, message) {}, // a socket is closed
    drain(ws) {}, // the socket is ready to receive more data
  },
});

console.log(`Listening on localhost:${server.port}`);
