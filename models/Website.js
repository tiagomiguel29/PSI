const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    rootPage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
    },
    status: {
      type: String,
      enum: [
        'Pending evaluation',
        'Evaluating',
        'Evaluated',
        'Evaluation error',
      ],
      default: 'Pending evaluation',
    },
    lastEvaluated: {
      type: Date,
      default: null,
    },
    previewImage: {
      type: String,
      default: null,
      trim: true,
    },
    previewImageStatus: {
      type: String,
      enum: ['Not captured', 'Capturing', 'Captured', 'Error'],
      default: 'Not captured',
    },
    stats: {
      pagesWithoutErrors: Number,
      pagesWithErrors: Number,
      pagesWithAErrors: Number,
      pagesWithAAErrors: Number,
      pagesWithAAAErrors: Number,
      evaluatedPages: Number,
      topErrors: [
        {
          code: String,
          description: String,
          count: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: 'websites',
  },
);

module.exports = Website = mongoose.model('Website', WebsiteSchema);
