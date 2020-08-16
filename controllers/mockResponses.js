const mongoose = require('mongoose');
const { MockResponseTestCaseModel } = require('../models/mockResponse');

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
    console.error(err.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

exports.addMockResponse = async (req, res, next) => {
  const { testCaseName, serviceName, serviceResponse } = req.body;
  // Checking if testCaseName is already available
  MockResponseTestCaseModel.findOne({ testCaseName }).then(
    (mockResponseObject) => {
      if (mockResponseObject) {
        const mockResponsesForTestCase = mockResponseObject.mockResponses;
        let isServiceNameAlreadyPresent = false;
        mockResponsesForTestCase.forEach((service) => {
          if (service.serviceName === serviceName) {
            service.serviceResponse = serviceResponse;
            (service.status = 'SILVER'), (service.createdAt = Date.now());
            isServiceNameAlreadyPresent = true;
          }
        });
        if (!isServiceNameAlreadyPresent) {
          mockResponsesForTestCase.push({
            serviceName,
            serviceResponse,
            status: 'SILVER',
            createdAt: Date.now(),
          });
        }
        mockResponseObject
          .save()
          .then((savedMockResponseObject) => {
            return res.status(201).json({
              success: true,
              data: savedMockResponseObject,
            });
          })
          .catch((err) => {
            console.log(err.errors);
          });
      }
      // Not an existing testCaseName
      else {
        const check = MockResponseTestCaseModel.create({
          testCaseName,
          mockResponses: [
            {
              serviceName,
              serviceResponse,
              status: 'SILVER',
            },
          ],
        }).then((obj) => {
          return res.status(201).json({
            success: true,
            data: obj,
          });
        });
      }
    }
  );
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
      console.error(err.message);
      return res.status(500).json({
        success: false,
        error: 'Server Error',
      });
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
    console.error(err.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
