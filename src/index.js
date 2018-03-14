'use strict';

const assert = require('assert');

// lambdaSdk:         an aws-sdk lambdaSdk object
// lambdaArn:         the ARN of the lambdaSdk to modify
// changedVariables:  the environment variables to change (string properties)
function environmentVariables({lambdaSdk, lambdaArn, changedVariables}) {
  assert(lambdaSdk !== null && typeof lambdaSdk === 'object', 'lambdaSdk must be an AWS SDK object.');
  assert(typeof lambdaArn === 'string', 'lambdaArn param must be a string.');
  assert(changedVariables !== null && typeof changedVariables === 'object', 'changedVariables param must be an object.');

  const getParams = {
    FunctionName: lambdaArn
  };
  return lambdaSdk.getFunctionConfiguration(getParams).promise().then(result => {
    const envars = result.Environment.Variables;
    let isChanged = false;
    for(let key in changedVariables) {
      if(!envars[key] || envars[key] !== String(changedVariables[key])) {
        isChanged = true;
        break;
      }
    }

    if(isChanged) {
      const setParams = {
        FunctionName: lambdaArn,
        Environment: {
          Variables: Object.assign({}, envars, changedVariables)
        }
      };
      return lambdaSdk.updateFunctionConfiguration(setParams).promise();
    }
    return null;
  });
  // don't catch; allow reject to bubble up
}

module.exports = {
  environmentVariables
};
