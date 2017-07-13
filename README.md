# qlab-html

**qlab-html** is a Node.js module and CLI that renders [QLab](http://figure53.com/qlab/) workspaces as self-contained HTML documents, which can then be printed or saved to PDF from your browser.

qlab-html works by importing the frontmost open workspace's data over OSC with [osc.js](https://github.com/colinbdclark/osc.js) and dynamically generating HTML with [Cheerio](https://github.com/cheeriojs/cheerio).

The design of qlab-html's rendered pages is heavily inspired by Josh Langman's [QLab 3 font](https://figure53.hostedwiki.co/pages/QLab%203%20Font) and particularly the associated [font specimen](https://docs.google.com/viewer?a=v&pid=forums&srcid=MDg0ODgyOTc2Mzg5ODkzNDEyMDEBMTQwMDAyMzgwMjE0MTQ5OTYzOTEBQlVaLW9sU0V2TGdKATAuMgEBdjI).

## Examples

- [Light theme, HTML](https://rawgit.com/okofish/qlab-html/master/samples/light.html)
- [Light theme with notes, HTML](https://rawgit.com/okofish/qlab-html/master/samples/light-notes.html)
- [Light theme, portrait PDF](https://rawgit.com/okofish/qlab-html/master/samples/light-portrait.pdf)
- [Light theme with notes, portrait PDF](https://rawgit.com/okofish/qlab-html/master/samples/light-portrait-notes.pdf)
- [Light theme, landscape PDF](https://rawgit.com/okofish/qlab-html/master/samples/light-landscape.pdf)
- [Light theme with notes, landscape PDF](https://rawgit.com/okofish/qlab-html/master/samples/light-landscape-notes.pdf)
- [Dark theme, HTML](https://rawgit.com/okofish/qlab-html/master/samples/dark.html)
- [Dark theme with notes, HTML](https://rawgit.com/okofish/qlab-html/master/samples/dark-notes.html)

## Use

1. Install the qlab-html CLI with `npm install -g qlab-html`.
2. Open the QLab workspace you want to export - it doesn't have to be focused, but it must be the frontmost open workspace.
3. Run `qlab-html -O` to export the workspace to `<workspace name>.html` and open the file in your default browser.
4. Run `qlab-html -h` for full CLI options.

## Known bugs/issues

- Non-ASCII cue names do not render properly
- Cues generated with the --truncate-cue-names option do not resize to fit the window/printed page
- Cue cart cues generated with the --truncate-cue-names option do not wrap to fill the cell
- There is no support for rendering collapsed group cues as such (this data is not available from QLab over OSC)
- Cue cart cue hotkeys do not display within the cue's cell (this data is not available from QLab over OSC)