var fs = require('fs');
var importer = require('../src/workspace-import');
var generator = require('../src/html-generate');

importer.import(function(cueLists) {
  var html = generator.generate(cueLists, {
    showNotes: false,
    showStatus: true,
    indicateBrokenCues: false,
    breakAfterCueLists: false,
    truncateCueNames: false,
    dark: true
  });
  fs.writeFileSync('test.html', html);
});