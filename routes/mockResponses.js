const express = require('express');
const router = express.Router();
const {
  addMockResponse,
  getMockResponsesForTestCases,
  markTestCaseStatusAsGold,
  deleteMockResponsesForTestCases,
} = require('../controllers/mockResponses');

router
  .route('/')
  .get(getMockResponsesForTestCases)
  .post(addMockResponse)
  .delete(deleteMockResponsesForTestCases);

router.route('/markStatus').post(markTestCaseStatusAsGold);

module.exports = router;
