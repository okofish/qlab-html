var fs = require('fs');
var path = require('path');
var qlabHTML = require('../index.js');

var samples = [{
  filename: 'light.html',
}, {
  filename: 'light-portrait.pdf',
  pdf: true,
  landscape: false
}, {
  filename: 'light-landscape.pdf',
  pdf: true,
  landscape: true
}, {
  filename: 'light-notes.html',
  showNotes: true
}, {
  filename: 'light-portrait-notes.pdf',
  showNotes: true,
  pdf: true,
  landscape: false
}, {
  filename: 'light-landscape-notes.pdf',
  showNotes: true,
  pdf: true,
  landscape: true
}, {
  filename: 'dark.html',
  dark: true
}, {
  filename: 'dark-notes.html',
  dark: true,
  showNotes: true
}];

samples.forEach(generate);

function generate(sample) {
  qlabHTML.exportHTML(path.join('../samples', sample.filename), sample, function(err, htmlPath, html) {
    if (!err) {
      if (sample.pdf === true) {
        qlabHTML.convertHTMLtoPDF(html, sample.landscape, function(pdf) {
          var pathObj = path.parse(htmlPath);
          pathObj.ext = '.pdf';
          pathObj.base = undefined;
          var pdfPath = path.format(pathObj);
          fs.unlinkSync(htmlPath);
          fs.writeFileSync(pdfPath, pdf);
          console.log(`Workspace in PDF saved to ${pdfPath}`);
        });
      } else {
        console.log(`Workspace saved to ${htmlPath}`);
      }

    } else {
      console.error(err);
    }
  });
}
