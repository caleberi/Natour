const { isFunction } = require('lodash');
const { ioMessageStatus, eventType, Message } = require('../utils/constants');
const { trainAI } = require('../utils/train');
module.exports = (io) => {
  async function getUserChatResponse(payload, callback) {
    if (!isFunction(callback)) return io.disconnect();
    try {
      const { to, from } = payload;
      const msg = from.msg ? from.msg : '';
      const action = from.msg.search('/action') >= 0 ? true : false;
      if (action)
        return io.emit(
          eventType.CHAT_SERVER_ACTION_RESPONSE,
          payload,
          (response) => {
            io.emit(eventType.CHAT_SERVER_ACTION_RESPONSE, payload);
          }
        );
      const aiResponse = await trainAI(msg);
      console.log(JSON.stringify(aiResponse));
      return callback({
        status: ioMessageStatus.ACK,
        msg: Message({ ai_response: aiResponse }, { sender: 'bot' }),
      });
    } catch (err) {
      console.log(err);
      return callback({
        status: ioMessageStatus.NACK,
        err,
      });
    }
  }
  async function getActionResolution(payload, callback) {
    if (!isFunction(callback)) return io.disconnect();
    try {
      const { to, from } = payload;
      const msg = from.msg ? from.msg : '';
      const aiResponse = await trainAI(msg);
      return callback({
        status: ioMessageStatus.ACK,
        msg: Message({ ai_response: aiResponse }, { sender: 'bot' }),
      });
    } catch (err) {
      return callback({
        status: ioMessageStatus.NACK,
        err,
      });
    }
  }
  io.on(eventType.CHAT_CLIENT_MESSAGE_IN, getUserChatResponse);
  io.on(eventType.CHAT_CLIENT_ACTION_REQUEST, getActionResolution);
};
