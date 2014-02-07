var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var rimraf = require('rimraf');
var bower = require('bower');

var has = Object.prototype.hasOwnProperty;
var exactVersionRegEx = /^(\d+)(\.\d+)(\.\d+)?$/;

/*
 * Clear out and prepare a directory for files to be copied in.
 */
var prepareDir = function(dir, callback, errback) {
  if (!fs.existsSync(dir)) {
    return mkdirp(dir, callback);
  }

  rimraf(dir, function(err) {
    if (err)
      return errback(err);
    mkdirp(dir, callback);
  });
};

var getPkg = function(outDir, possibles){
  if(!possibles) {
    // Support the legacy component.json
    possibles = [ 'bower.json', 'component.json' ];
  }
  var filename = possibles.shift();

  var pkgfile = path.resolve(outDir, filename);
  try {
    var data = fs.readFileSync(pkgfile, 'utf8');
    return JSON.parse(data);
  } catch(err) {
    if(possibles.length) {
      return getPkg(outDir, possibles);
    }
    return {};
  }
};

module.exports = BowerLocation;

function BowerLocation(options) {
  options = options || {};
  this.log = options.log !== false;
  this.username = options.username;
  this.password = options.password;
  this.baseDir = options.baseDir;
  this.tmpDir = options.tmpDir;
}

BowerLocation.prototype = {
  constructor: BowerLocation,

  degree: 1,

  download: function(repo, version, hash, outDir, callback, errback){
    var pkg = version === 'master' ? repo : repo + '#' + version;

    rimraf(this.tmpDir, function(){
      bower.commands.install([pkg], {}, { 'directory': this.tmpDir })
        .on('error', function(err){
          if(err.code === 'ENOTFOUND') {
            return callback();
          }
          errback(err);
        })
        .on('end', function(results){
          var nrepo = Object.keys(results)[0];
          var tmpDir = results[nrepo].canonicalDir;
  
          prepareDir(outDir, function(){
            fs.rename(tmpDir, outDir, function(err){
              if(err) return errback(err);

              var p = getPkg(outDir);
              p.main = Array.isArray(p.main) ? p.main[0] : p.main;
              
              p.registry = 'bower';

              callback(p);
            });
          }, errback);
        });
    }.bind(this));
  },

  getVersions: function(repo, callback, errback){
    bower.commands.info(repo)
      .on('error', function(err){
        if(err.code === 'ENOTFOUND') {
          return callback();
        }
        errback(err);
      })
      .on('end', function(results){
        var versions = {};
        var latest = results.latest;

        results.versions.forEach(function(v){
          versions[v] = v;
        });
        versions.master = latest.version;
        callback(versions);
      });
  }
};
