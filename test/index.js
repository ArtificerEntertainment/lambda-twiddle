'use strict';

const sinon = require('sinon');
const assert = require('assert');
const lambdaTwiddle = require('../src/index.js');
const AWS = require('aws-sdk');

const testArn = 'arn:lambda:test';
const testVars = {
  var1: 'val1',
  var2: 'val2'
};
const getFunctionConfigurationResolve = {
  promise: () => Promise.resolve({
    Environment: {
      Variables: testVars
    }
  })
};
const updateFunctionConfigurationResolve = {
  promise: () => Promise.resolve()
};

function objectify(lambdaSdk, lambdaArn, changedVariables) {
  return {
    lambdaSdk,
    lambdaArn,
    changedVariables
  };
}

describe('lambdaTwiddle', function() {
  let sandbox, lambda, lambdaMock;
  before(function() {
    sandbox = sinon.sandbox.create();
    lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
    lambdaMock = sandbox.mock(lambda);
  });

  afterEach(function() {
    sandbox.verifyAndRestore();
  });

  it('asserts lambda param is an object', function() {
    assert.throws(() => {
      lambdaTwiddle.environmentVariables(objectify(null, '', {}));
    }, /lambdaSdk must be an AWS SDK object/);
  });

  it('asserts arn param is a string', function() {
    assert.throws(() => {
      lambdaTwiddle.environmentVariables(objectify({}, null, {}));
    }, /lambdaArn param must be a string/);
  });

  it('asserts that changedVariables is an object', function() {
    assert.throws(() => {
      lambdaTwiddle.environmentVariables(objectify({}, '', null));
    }, /changedVariables param must be an object/);
  });

  it('skips lambda change when changedVariables contains no changes', function() {
    lambdaMock.expects('getFunctionConfiguration')
      .withExactArgs({
        FunctionName: testArn
      }).returns(getFunctionConfigurationResolve).once();
    lambdaMock.expects('updateFunctionConfiguration').never();

    lambdaTwiddle.environmentVariables(objectify(lambda, testArn, {}));
  });

  it('skips lambda change when changedVariables contains redundant changes', function() {
    lambdaMock.expects('getFunctionConfiguration')
      .withExactArgs({
        FunctionName: testArn
      }).returns(getFunctionConfigurationResolve).once();
    lambdaMock.expects('updateFunctionConfiguration').never();

    lambdaTwiddle.environmentVariables(objectify(lambda, testArn, {var2: 'val2'}));
  });

  it('makes lambda change when changedVariables contains changed values', function() {
    const newVar = {
      var2: 'newval2'
    };
    lambdaMock.expects('getFunctionConfiguration')
      .withExactArgs({
        FunctionName: testArn
      }).returns(getFunctionConfigurationResolve).once();
    lambdaMock.expects('updateFunctionConfiguration')
      .withExactArgs({
        FunctionName: testArn,
        Environment: {
          Variables: Object.assign({}, testVars, newVar)
        }
      }).returns(updateFunctionConfigurationResolve).once();

    lambdaTwiddle.environmentVariables(objectify(lambda, testArn, newVar));
  });

  it('makes lambda change when changedVariables contains additional values', function() {
    const addVars = {
      var3: 'val3',
      var4: 'val4'
    };
    lambdaMock.expects('getFunctionConfiguration')
      .withExactArgs({
        FunctionName: testArn
      }).returns(getFunctionConfigurationResolve).once();
    lambdaMock.expects('updateFunctionConfiguration')
      .withExactArgs({
        FunctionName: testArn,
        Environment: {
          Variables: Object.assign({}, testVars, addVars)
        }
      }).returns(updateFunctionConfigurationResolve).once();

    lambdaTwiddle.environmentVariables(objectify(lambda, testArn, addVars));
  });
});
