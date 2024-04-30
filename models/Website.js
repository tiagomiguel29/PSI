const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['Por avaliar', 'Em avaliação', 'Avaliado', 'Erro na avaliação'],
      default: 'Por avaliar',
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
  },
  {
    timestamps: true,
    collection: 'websites',
  },
);

module.exports = Website = mongoose.model('Website', WebsiteSchema);
