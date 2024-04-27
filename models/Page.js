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
        'Por avaliar',
        'Em avaliação',
        'Conforme',
        'Não conforme',
        'Erro na avaliação',
      ],
      default: 'Por avaliar',
    },
    lastEvaluated: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'pages',
  },
);

module.exports = Page = mongoose.model('Page', PageSchema);
