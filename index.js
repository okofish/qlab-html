var fs = require('fs');
var generator = require('./src/html-generate');
var importer = require('./src/workspace-import');
var path = require('path');

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
module.exports.exportHTML = function(htmlPath, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  importer.import(function(cueLists) {
    var html = generator.generate(cueLists, options);
    if (!htmlPath) {
      htmlPath = `${cueLists.workspaceName}.html`;
    } else {
      var pathObj = path.parse(htmlPath);
      pathObj.ext = '.html';
      pathObj.base = undefined;
      htmlPath = path.format(pathObj);
      console.log(htmlPath)
    }
    fs.writeFile(htmlPath, html, function(err) {
      if (cb) {
        cb(err, htmlPath, html);
      }
    });
  });
}
module.exports.convertHTMLtoPDF = function(html, landscape, cb) {
  try {
    var CDP = require('chrome-remote-interface');
  } catch (err) {
    CDP = null;
  }
  try {
    var chromeRunner = require('chrome-runner');
  } catch (err) {
    chromeRunner = null;
  }

  if (!CDP) {
    console.error('chrome-remote-interface not installed, please run `npm install chrome-remote-interface`');
  } else if (!chromeRunner) {
    console.error('chrome-runner not installed, please run `npm install chrome-runner`');
  } else {
    chromeRunner.launchWithHeadless().then(function(runner) {
      CDP({
        port: runner.port
      }, function(client) {
        var Network = client.Network;
        var Page = client.Page;

        // enable events then start!
        Promise.all([
          Page.enable()
        ]).then(function() {
          return Page.navigate({
            url: 'about:blank'
          })
        }).then(function(results) {
          var frameId = results.frameId;
          return Page.setDocumentContent({
            frameId: frameId,
            html: html
          })
        }).then(function() {
          return Page.printToPDF({
            landscape: landscape || false,
            displayHeaderFooter: false,
            printBackground: true/*,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0*/
          })
        }).then(function(pdf) {
          cb(Buffer.from(pdf.data, 'base64'));
          client.close();
          runner.kill();
        }).catch(function(err) {
          console.error(err);
          client.close();
        });
      }).on('error', function(err) {
        console.error(err);
      });
    });

  }
}