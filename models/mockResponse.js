const mongoose = require('mongoose');

const MockResponseServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['SILVER', 'GOLD'],
    required: true,
  },
  serviceResponse: {
    type: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MockResponseTestCaseSchema = new mongoose.Schema({
  testCaseName: {
    type: String,
    required: true,
    unique: true,
  },
  mockResponses: {
    type: [MockResponseServiceSchema],
    default: [],
  },
});

const MockResponseTestCaseModel = mongoose.model(
  'MockResponseTestCase',
  MockResponseTestCaseSchema
);

module.exports = {
  MockResponseTestCaseModel,
};
