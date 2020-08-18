
## About:

* Node-Express-Mongo Service to store mock responses for FT framework with testCaseName and serviceName

## Tech:

* Runtime: Node
* Framework: Express 
* Data Modelling: Mongoose
* DB: Mongo DB
* PAAS: GCP - Ubuntu within PayPal Network - 10.176.20.197
* Server Monitor - Forever - https://www.npmjs.com/package/forever

## Mongo Connection URI:
* mongodb://logd:stage2%40qa@10.176.20.197:27017/mockResponses?authSource=mockResponses&readPreference=primary&ssl=false

## MongoDB Client:
* **MongoDB Compass**
* https://www.mongodb.com/products/compass

## Supported Operations:

**GET:**
* URI: http://10.176.20.197:5000/api/mockResponses/
1) Get all testCase objects with its underlying service response objects
queryParam: None
2) Get single testCase object with its underlying service response objects
queryParam: testCaseName
3) Get single service response of a testCase object
queryParam: testCaseName, serviceName

**POST:**
* URI: http://10.176.20.197:5000/api/mockResponses/
1) Adds the serviceResponse to its corresponding serviceName in corresponding testCaseName
Sample Body:
```
{   
"testCaseName": "happy_path_single_fi_in_in",
"serviceName": "ec-token",
"serviceResponse": {
  "token": {
     "foo": "bar"
  }
 }
}
```
* If testCaseName is not already present, it will create newly.
* If serviceName already has a serviceResponse, it will override with new serviceResponse passed
* Will use current time as createdAt for the serviceName
* By default, status of serviceName will be set to SILVER

* URI: http://10.176.20.197:5000/api/mockResponses/markStatus
2) Marks the status of all serviceNames in a testCaseName object as GOLD.
Sample Body:
```
{
	"testCaseName": "happy_path_single_fi_br_br"
}
```

**DELETE:**
* URI: http://10.176.20.197:5000/api/mockResponses/
1) Deletes a single testCaseName object and its service responses
queryParam: testCaseName
* **DANGER**
2) Deletes all testCaseName objects - Equivalent to wiping out the DB
queryParam: none

