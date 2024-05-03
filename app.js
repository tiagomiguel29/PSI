const express = require('express');
const http = require('http');
const app = express();
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

if (
  !(process.env.NODE_ENV === 'production') &&
  !(process.env.NODE_ENV === 'staging')
) {
  require('dotenv').config();
}

/* MONGODB CONNECTION */

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB', error.message);
  });

/* LOAD MONOGOOSE MODELS */

require('./models/Website');
require('./models/Page');
require('./models/PageEvaluation');

/* EXPRESS MIDDLEWARE */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* API ROUTES */

app.use('/api', require('./routes/api'));

/* ERROR HANDLING */

/* SERVER START */

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

require('./services/sockets').init(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
