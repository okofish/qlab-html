#!/usr/bin/env node

var argv = require('commander');
var fs = require('fs');
var opn = require('opn');
var path = require('path');
var qlabHTML = require('./index.js');
var readPkg = require('read-pkg');

argv
  .description('Exports contents of the current QLab workspace to an HTML file')
  .option('-o, --output [filename]', 'File to save HTML/PDF to (defaults to <workspace name>.html; use - to echo to stdout)')
  .option('-O, --open', 'Open HTML file in default browser after saving')
  .option('-n, --show-notes', 'Show cue notes')
  .option('-d, --dark', 'Use dark theme')
  .option('-r, --break-after-cue-lists', 'Force a page break after each cue list/cart when the page is printed')
  .option('-b, --indicate-broken-cues', 'Indicate broken cues with a red X')
  .option('-s, --hide-status', 'Hide cue status')
  .option('-t, --truncate-cue-names', 'Truncate cue names instead of wrapping them (can cause issues with printing)')
  .option('--export-pdf', 'Render workspace to PDF instead of HTML (experimental; requires chrome-remote-interface and chrome-runner)')
  .option('--landscape', 'Render PDF in landscape mode instead of portrait')
  .version(readPkg.sync(__dirname).version)
  .parse(process.argv);

var options = argv.opts();
options.showStatus = !options.hideStatus;

if (options.output === '-') {
  qlabHTML.generateHTML(options, function(html) {
    if (options.exportPdf === true) {
      qlabHTML.convertHTMLtoPDF(html, options.landscape, function(pdf) {
        console.log(pdf.toString());
      });
    } else {
      console.log(html);
    }
  });
} else {
  qlabHTML.exportHTML(options.output, options, function(err, htmlPath, html) {
    if (!err) {
      if (options.exportPdf === true) {
        qlabHTML.convertHTMLtoPDF(html, options.landscape, function(pdf) {
          var pathObj = path.parse(htmlPath);
          pathObj.ext = '.pdf';
          pathObj.base = undefined;
          var pdfPath = path.format(pathObj);
          fs.unlinkSync(htmlPath);
          fs.writeFileSync(pdfPath, pdf);
          console.log(`Workspace in PDF saved to ${pdfPath}`);
          if (options.open === true) {
            opn(pdfPath, {
              wait: false
            });
          }
        });
      } else {
        console.log(`Workspace saved to ${htmlPath}`);
        if (options.open === true) {
          opn(filePath, {
            wait: false
          });
        }
      }
      
    } else {
      console.error('An error occurred while saving the HTML file.');
      console.error(err);
    }
  });
}