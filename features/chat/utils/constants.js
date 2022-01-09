exports.eventType = {
  CHATSERVER_SENT_MESSAGE: 'chatserver:sent:message',
  CHATSERVER_RESOLVE_ACTION: 'chatserver:resolve:action',
  CHATCLIENT_SENT_MESSAGE: 'chatclient:sent:message',
  CHAT_CONNECTED: 'connection',
  CHAT_DISCONNECTED: 'disconnecting',
  CHAT_CONNECT_ERROR: 'connect_error',
};

const ioServerErrorType = {
  UNKNOWN_TRANSPORT: 'Transport unknown',
  UNKNOWN_SESSION_ID: 'Session ID unknown',
  BAD_HANDSHAKE_METHOD: 'Bad handshake method',
  BAD_REQUEST: 'Bad request',
  FORBIDDEN: 'Forbidden',
  UNSUPPORTED_PROTOCOL_VERSION: 'Unsupported protocol version',
};

exports.ioServerErrorCode = {
  0: ioServerErrorType.UNKNOWN_TRANSPORT,
  1: ioServerErrorType.UNKNOWN_SESSION_ID,
  2: ioServerErrorType.BAD_HANDSHAKE_METHOD,
  3: ioServerErrorType.BAD_REQUEST,
  4: ioServerErrorType.FORBIDDEN,
  5: ioServerErrorType.UNSUPPORTED_PROTOCOL_VERSION,
};

exports.Message = (to, from) => ({
  to,
  from,
});

exports.ioMessageStatus = {
  ACK: 'Ack',
  NACK: 'Nack',
};
