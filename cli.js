#!/usr/bin/env node

var argv = require('commander');
var opn = require('opn');
var qlabPdf = require('./index.js');
var readPkg = require('read-pkg');

argv
  .description('Exports contents of the current QLab workspace to an HTML file')
  .option('-o, --output [filename]', 'File to save HTML to (defaults to <workspace name>.html; use - to echo to stdout)')
  .option('-O, --open', 'Open HTML file in default browser after saving')
  .option('-n, --show-notes', 'Show cue notes')
  .option('-d, --dark', 'Use dark theme')
  .option('-r, --break-after-cue-lists', 'Force a page break after each cue list/cart when the page is printed')
  .option('-b, --indicate-broken-cues', 'Indicate broken cues with a red X')
  .option('-s, --hide-status', 'Hide cue status')
  .option('-t, --truncate-cue-names', 'Truncate cue names instead of wrapping them (can cause issues with printing)')
  .version(readPkg.sync().version)
  .parse(process.argv);

var options = argv.opts();
options.showStatus = !options.hideStatus;

if (options.output === '-') {
  qlabPdf.generateHTML(options, console.log);
} else {
  qlabPdf.exportHTML(options.output, options, function(err, path) {
    if (!err) {
      console.log(`Workspace saved to ${path}`);
      if (options.open === true) {
        opn(path, {
          wait: false
        });
      }
    } else {
      console.error('An error occurred while saving the HTML file.');
      console.error(err);
    }
  });
}