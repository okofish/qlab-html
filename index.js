var fs = require('fs');
var importer = require('./src/workspace-import');
var generator = require('./src/html-generate');

function importAndGenerate(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  importer.import(function(cueLists) {
    var html = generator.generate(cueLists, options);
    cb(html);
  });
}

module.exports.generateHTML = importAndGenerate;
module.exports.exportHTML = function(path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  importer.import(function(cueLists) {
    var html = generator.generate(cueLists, options);
    if (!path) {
      path = `${cueLists.workspaceName}.html`;
    }
    fs.writeFile(path, html, function(err) {
      if (cb) {
        cb(err, path);
      }
    });
  });
}
