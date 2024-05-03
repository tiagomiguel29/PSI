let ioInstance;

function init(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    socket.on('view_website', (websiteId) => {
      socket.join(websiteId);
      console.log('User joined room: ', websiteId);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
}

function notifyWebsiteUpdate(websiteId) {
  console.log('Notifying website update: ', websiteId);
  ioInstance.to(websiteId).emit('website_updated');
}

module.exports = { init, notifyWebsiteUpdate };
