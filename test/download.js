var assert = require('assert');
var BowerLocation = require('../bower');
var bower = new BowerLocation({
  tmpDir: 'tmp/tmp'                            
});
var fs = require('fs');
var rimraf = require('rimraf');

var fail = function(err){
  console.error('Test error!', err);
  assert.fail();
};

var dir = 'tmp/bower/jquery';

describe('download', function(){
  it('Saves the latest version to the tmp dir', function(done){
    rimraf(dir, function(){
      bower.download('jquery', 'master', null, dir, function(){
        // Directory created
        assert.ok(fs.existsSync(dir));
        done();
      }, fail);
    });
  });

  it('Returns a package containing main and version', function(done){
    rimraf(dir, function(){
      bower.download('jquery', 'master', null, dir, function(pkg){
        // Package contains a main and version
        assert.notEqual(pkg, undefined);
        assert.equal(typeof pkg.main, 'string');
        assert.equal(typeof pkg.version, 'string');
        done();
      });
    });
  });

  it('Returns a package for a specific version', function(done){
    var version = '1.9.1';
    rimraf(dir, function(){
      bower.download('jquery', version, version, dir, function(pkg){
        assert.notEqual(pkg, undefined);
        assert.equal(pkg.version, version);
        done();
      });
    });
  });

  it('Returns a package with dependencies', function(done){
    var expected = {
      'jquery': 'bower:jquery@master'
    };
    bower.download('bootstrap', '3.0.3', '3.0.3', dir, function(pkg){
      var deps = pkg.map;

      assert.equal(pkg.main, './dist/js/bootstrap.js');
      assert.notEqual(deps, undefined);
      assert.equal(Object.keys(deps).length, 1);
      assert.deepEqual(deps, expected);
      done();
    });
  });
});
