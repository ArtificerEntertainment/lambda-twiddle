# lambda-twiddle
Simple interface for modifying lambda environment variables.

```js
//Example usage
const AWS = require('aws-sdk');
const lambdaSdk = new AWS.Lambda({apiVersion: '2015-03-31'});
const lambdaArn = 'arn:aws:lambda:us-east-1:123456789012:function:ProcessRecords';
const variableChanges = {
  environmentVariable1: 'string value 1',
  environmentVariable1: 'string value 2'
};

const lambdaTwiddle = require('lambda-twiddle');
return lambdaTwiddle.environmentVariables({lambdaSdk, lambdaArn, variableChanges});
```

The `environmentVariables` function returns:
* A promise resolving to `null` if no call to `AWS.Lambda.updateFunctionConfiguration(...)` is required.
* The promise returned by [`AWS.Lambda.updateFunctionConfiguration(...).promise()`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#updateFunctionConfiguration-property)
