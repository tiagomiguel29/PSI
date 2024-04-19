const express = require('express');
const app = express();
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

/* EXPRESS MIDDLEWARE */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* API ROUTES */

app.use('/api', require('./routes/api'));

/* ERROR HANDLING */

/* SERVER START */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
