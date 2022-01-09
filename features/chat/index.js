const express = require('express');
const { messages, codes } = require('../../helpers/constants');
const { AppError } = require('../../helpers/error');
const { eventType } = require('./utils/constants');
const _ = require('lodash');
const { verify } = require('jsonwebtoken');
const config = require('../../config');
const userDB = require('../../model/userModel');
const handler = require('./handlers/index');
const router = express.Router({
  mergeParams: true,
  caseSensitive: true,
});

const middlewares = [
  async function authorize(socket, next) {
    const token = socket.auth.authToken;
    const deserializedToken = verify(token, config.JWT_SECRET);
    const user = await userDB.findById(deserializedToken.id);
    if (!user) {
      return next(new AppError(messages.NOT_FOUND_ID, codes.NOT_FOUND, false));
    }
    socket.user = {
      id: user._id,
      username: user.name,
    };
    next();
  },
];

function registerIOMiddleware(io) {
  _.forEach(middlewares, (fn) => io.use(fn));
}

const initializeIO = function (io) {
  io.on(eventType.CHAT_CONNECTED, (socket) => {
    console.log(`${socket.id} just connected ...`);
    registerIOHandlers(socket);
    socket.onAny((event, ...args) => {
      console.log('EVENT:: ', event, args);
    });
  });
  io.on(eventType.CHAT_DISCONNECTED, (socket) => {
    console.log(`${socket.id} just disconnected ...`);
  });

  //   io.on(eventType.CHAT_CONNECT_ERROR, (err) => {
  //     // prints the message associated with the error
  //     console.log('SOCKET_ERROR:: %s', err.message);
  //     io.emit(eventType.CHAT_SERVER_MESSAGE_OUT);
  //   });
};

const registerIOHandlers = function (io) {
  // registerIOMiddleware(io);
  handler.chatHandler(io);
};

module.exports = (io) => {
  initializeIO(io);
  return router;
};
