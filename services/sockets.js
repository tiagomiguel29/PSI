let ioInstance;

function init(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('view_website', (websiteId) => {
      socket.join(websiteId);
    });

    socket.on('disconnect', () => {});
  });
}

function notifyWebsiteUpdate(websiteId) {
  ioInstance.to(websiteId).emit('website_updated');
}

function notifyPageUpdate(websiteId, websiteStatus, pageId, newStatus, date) {
  ioInstance
    .to(websiteId)
    .emit('page_updated', { pageId, newStatus, date, websiteStatus });
}

module.exports = { init, notifyWebsiteUpdate, notifyPageUpdate };
