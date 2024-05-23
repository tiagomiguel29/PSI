const { any } = require('joi');
const mongoose = require('mongoose');

const PageEvaluationSchema = new mongoose.Schema(
  {
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
    },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
    },
    result: {
      type: String,
      enum: ['Compliant', 'Not compliant', 'Evaluation error'],
    },
    total: Number,
    passed: Number,
    warning: Number,
    failed: Number,
    inapplicable: Number,
    actRules: {
      passed: Number,
      warning: Number,
      failed: Number,
      inapplicable: Number,
      assertions: [
        {
          name: String,
          code: String,
          mapping: String,
          description: String,
          metadata: {
            'success-criteria': Array,
            passed: Number,
            warning: Number,
            failed: Number,
            inapplicable: Number,
            outcome: String,
            description: String,
          },
        },
      ],
    },
    wcagTechniques: {
      passed: Number,
      warning: Number,
      failed: Number,
      inapplicable: Number,
      assertions: [
        {
          name: String,
          code: String,
          mapping: String,
          description: String,
          metadata: {
            'success-criteria': Array,
            passed: Number,
            warning: Number,
            failed: Number,
            inapplicable: Number,
            outcome: String,
            description: String,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: 'pageEvaluations',
  },
);

PageEvaluationSchema.pre('save', function (next) {
  this.total =
    (this.passed || 0) +
    (this.warning || 0) +
    (this.failed || 0) +
    (this.inapplicable || 0);
  next();
});

PageEvaluationSchema.pre('findOneAndUpdate', function (next) {
  this._update.total =
    (this._update.passed || 0) +
    (this._update.warning || 0) +
    (this._update.failed || 0) +
    (this._update.inapplicable || 0);
  next();
});

module.exports = PageEvaluation = mongoose.model(
  'PageEvaluation',
  PageEvaluationSchema,
);
