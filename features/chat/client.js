const { io } = require('socket.io-client');
const { eventType } = require('./utils/constants');
const socket = io('http://localhost:3000');

// client-side
socket.on('connect', () => {
  let array = [
    'hi',
    'good to see you',
    'say about you',
    '/action/difficulty:easy',
  ];
  for (let idx = 0; idx < array.length; idx++) {
    const element = array[idx];
    setTimeout(() => {
      socket.emit(
        eventType.CHATCLIENT_SENT_MESSAGE,
        { to: 'bot', from: { msg: element } },
        (response) => {
          console.log(response);
        }
      );
    }, 1000);
  }

  socket.on(eventType.CHATSERVER_SENT_MESSAGE, (response) => {
    let parsed = response.msg.to.docs;
    for (let doc of parsed) {
      console.log(doc.name);
    }
  });
});

socket.on('disconnect', () => {
  console.log(socket.id); // undefined
});
