var assert = require('assert');
var BowerLocation = require('../bower');
var bower = new BowerLocation();
var rimraf = require('rimraf');

var fail = function(){
  assert.fail();
};

describe('BowerLocation', function(){
  it('Contains a degree of 1', function(){
    assert.equal(bower.degree, 1);
  });
});

describe('getVersions', function(){
  it('Returns versions for a repo', function(done){
   bower.getVersions('jquery', function(versions){
      var keys = Object.keys(versions);

      assert.ok(keys.length);
      assert.notEqual(versions.master, undefined);
      done();
    }, fail);
  });

  it('Returns undefined for non-existing repo', function(done){
    bower.getVersions('jqueryfake', function(versions){
      assert.equal(versions, undefined);
      done();
    }, fail);
  });
});
