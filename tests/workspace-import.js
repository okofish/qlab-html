var fs = require('fs');
var importer = require('../src/workspace-import');

importer.import(function(cueLists) {
  fs.writeFileSync(`${cueLists.workspaceName}.json`, JSON.stringify(cueLists, null, 2));
  console.log(`Saved cue lists for workspace ${cueLists.workspaceName}`)
});