const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Pending evaluation',
        'Evaluating',
        'Compliant',
        'Not compliant',
        'Evaluation error',
      ],
      default: 'Pending evaluation',
    },
    lastEvaluated: {
      type: Date,
      default: null,
    },
    stats: {
      hasAAAErrors: Boolean,
      hasAAErrors: Boolean,
      hasAErrors: Boolean,
      hasNoErrors: Boolean,
    },
  },
  {
    timestamps: true,
    collection: 'pages',
  },
);

PageSchema.index({ url: 1, website: 1 }, { unique: true });

module.exports = Page = mongoose.model('Page', PageSchema);
