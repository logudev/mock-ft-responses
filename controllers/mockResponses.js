const mongoose = require('mongoose');
const { MockResponseTestCaseModel } = require('../models/mockResponse');
const { formatUnhandledErrors } = require('./util');

// @desc    Get all testCase objects - if both testCaseName and serviceName are not provided
// @desc    Get a single testCase object - if testCaseName alone is provided
// @desc    Get a single serviceName object of a testCase - if both testCaseName and serviceName are provided
// @route   GET /api/mockResponses
exports.getMockResponsesForTestCases = async (req, res, next) => {
  try {
    const { testCaseName, serviceName } = req.query;
    let queryString = undefined;
    // if testCaseName is provided, only that will be queried. Else all testCase objects will be queried
    if (testCaseName) {
      queryString = { testCaseName };
    }
    const mockResponses = await MockResponseTestCaseModel.find(queryString);
    // If serviceName is not provided, return all results for the testCaseName
    if (!serviceName) {
      return res.status(200).json({
        success: true,
        count: mockResponses.length,
        data: mockResponses,
      });
    }
    // If serviceName is provided with testCaseName, query results for that serviceName
    else {
      const mockResponseForServiceName = mockResponses[0].mockResponses.find(
        (res) => res.serviceName === serviceName
      );
      return res.status(200).json({
        success: true,
        data: mockResponseForServiceName,
      });
    }
  } catch (err) {
    // Any error caught here will be treated as server error
    formatUnhandledErrors(err);
  }
};

// @desc    Creates a new testCaseName object and adds serviceName object to it with serviceResponse - if testCaseName is not present
// @desc    Adds a serviceName object to testCaseName object, if testCaseName is present, but serviceName is not present
// @desc    Updates serviceName object with passed serviceResponse, if serviceName is already present
// @route   POST /api/mockResponses
exports.addMockResponse = async (req, res, next) => {
  const { testCaseName, serviceName, serviceResponse } = req.body;
  // Checking if testCaseName is already available
  try {
    const mockResponseObject = await MockResponseTestCaseModel.findOne({
      testCaseName,
    });
    // Already existing testCaseName
    if (mockResponseObject) {
      const mockResponsesForTestCase = mockResponseObject.mockResponses;
      let isServiceNameAlreadyPresent = false;
      // Iterating through serviceNames of testCaseName object to see if it is already present.
      // If present, modifying the serviceResponse, status, createdAt attibutes with latest values
      mockResponsesForTestCase.forEach((service) => {
        if (service.serviceName === serviceName) {
          service.serviceResponse = serviceResponse;
          service.status = 'SILVER';
          service.createdAt = Date.now();
          isServiceNameAlreadyPresent = true;
        }
      });
      // If not present, fresh object with latest serviceResponse, status, createdAt values are pushed to testCaseName object
      if (!isServiceNameAlreadyPresent) {
        mockResponsesForTestCase.push({
          serviceName,
          serviceResponse,
          status: 'SILVER',
          createdAt: Date.now(),
        });
      }
      const savedMockResponseObject = await mockResponseObject.save();
      return res.status(201).json({
        success: true,
        data: savedMockResponseObject,
      });
    }
    // Not an existing testCaseName, create new testCaseName obj with serviceName obj
    else {
      const newTestCaseNameObject = await MockResponseTestCaseModel.create({
        testCaseName,
        mockResponses: [
          {
            serviceName,
            serviceResponse,
            status: 'SILVER',
          },
        ],
      });
      return res.status(201).json({
        success: true,
        data: newTestCaseNameObject,
      });
    }
  } catch (err) {
    // Any error caught here will be treated as server error
    formatUnhandledErrors(err);
  }
};

// @desc  Mark status of all serviceNames as GOLD in a testCase object - if testCaseName queryParam is provided
// @route POST /api/mockResponses/markStatus
exports.markTestCaseStatusAsGold = async (req, res) => {
  const { testCaseName } = req.body;
  // If testCaseName is provided, all serviceNames in it will be marked with status as GOLD
  if (testCaseName) {
    try {
      const mockResponseObject = await MockResponseTestCaseModel.findOne({
        testCaseName,
      });
      // Matching object was found for given testCaseName
      if (mockResponseObject) {
        // Marking status of all serviceNames as GOLD
        mockResponseObject.mockResponses.forEach((resp) => {
          resp.status = 'GOLD';
        });
        // Committing the updated object to DB
        const updatedMockResponseObject = await mockResponseObject.save();
        return res.status(200).json({
          success: true,
          data: updatedMockResponseObject,
        });
      }
      // No matching object was found for given testCaseName
      else {
        return res.status(400).json({
          success: false,
          message: `No testCase found with given testCaseName : ${testCaseName}`,
        });
      }
    } catch (err) {
      // Any error caught here will be treated as server error
      formatUnhandledErrors(err);
    }
  }
  // No testCaseName was provided
  else {
    return res.status(400).json({
      success: false,
      message: 'No testCaseName was provided',
    });
  }
};

// @desc    Delete a testCase object - if testCaseName queryParam is provided
// @desc    Delete all testCase objects - if testCaseName queryParam is not provided
// @route   DELETE /api/mockResponses
exports.deleteMockResponsesForTestCases = async (req, res, next) => {
  const { testCaseName } = req.query;
  try {
    if (testCaseName) {
      // testCaseName present, will be deleting a single testCase object
      const mockResponseObject = await MockResponseTestCaseModel.deleteOne({
        testCaseName,
      });
      // if deletedCount is 0, no matching object was found
      if (mockResponseObject.deletedCount === 0) {
        return res.status(400).json({
          success: false,
          message: `No testCase found with given testCaseName : ${testCaseName}`,
        });
      }
      // delete operation successful
      else {
        return res.status(200).json({
          success: true,
          message: `Deleted testCase : ${testCaseName}`,
        });
      }
    } else {
      // if testCaseName not present, all testCase objects will be deleted
      await MockResponseTestCaseModel.deleteMany();
      return res.status(200).json({
        success: true,
      });
    }
  } catch (err) {
    // Any error caught here will be treated as server error
    formatUnhandledErrors(err);
  }
};
