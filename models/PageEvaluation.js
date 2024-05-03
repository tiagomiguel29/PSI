const mongoose = require('mongoose');

const PageEvaluationSchema = new mongoose.Schema(
  {
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
    },
    result: {
      type: String,
      enum: ['Compliant', 'Not compliant', 'Evaluation error'],
    },
    passed: Number,
    warning: Number,
    failed: Number,
    inapplicable: Number,
    actRules: {
      passed: Number,
      warning: Number,
      failed: Number,
      inapplicable: Number,
      assertions: Object,
    },
    wcagTechniques: {
      passed: Number,
      warning: Number,
      failed: Number,
      inapplicable: Number,
      assertions: Object,
    },
    bestPractices: {
      passed: Number,
      warning: Number,
      failed: Number,
      inapplicable: Number,
      assertions: Object,
    },
  },
  {
    timestamps: true,
    collection: 'pageEvaluations',
  },
);

module.exports = PageEvaluation = mongoose.model(
  'PageEvaluation',
  PageEvaluationSchema,
);
