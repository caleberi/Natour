const { io } = require('socket.io-client');
const socket = io('http://localhost:3000');

// client-side
socket.on('connect', () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  console.log('sending event');
  socket.emit(
    'chatclient:message_in',
    { to: 'bot', from: { msg: 'Hi' } },
    (response) => {
      console.log(response);
    }
  );
});

socket.on('disconnect', () => {
  console.log(socket.id); // undefined
});
