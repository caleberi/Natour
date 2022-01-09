const { isFunction } = require('lodash');
const { ioMessageStatus, eventType, Message } = require('../utils/constants');
const { trainAI } = require('../utils/train');
const tour = require('../../../model/tourModel');
module.exports = (io) => {
  async function getUserChatResponse(payload, callback) {
    if (!isFunction(callback)) return io.disconnect();
    try {
      const { to, from } = payload;

      const msg = from.msg ? from.msg : '';
      const action = from.msg.startsWith('/action');
      if (action) {
        let [_, difficulty] = from.msg.split('/').slice(1);
        let filter = {
          difficulty: difficulty.split(':')[1],
        };
        getActionResolution(filter, (response) => {
          io.emit(eventType.CHATSERVER_SENT_MESSAGE, response); // send to client
        });
        return;
      }
      const aiResponse = await trainAI(msg);
      return callback({
        status: ioMessageStatus.ACK,
        msg: Message({ ai_response: aiResponse.answer }, { sender: 'bot' }),
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
      const docs = await tour.find(payload); //.select('');
      return callback({
        status: ioMessageStatus.ACK,
        msg: Message({ docs }, { sender: 'bot' }),
      });
    } catch (err) {
      return callback({
        status: ioMessageStatus.NACK,
        err,
      });
    }
  }
  io.on(eventType.CHATCLIENT_SENT_MESSAGE, getUserChatResponse);
  io.on(eventType.CHATSERVER_RESOLVE_ACTION, getActionResolution);
};
