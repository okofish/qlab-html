var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var leftPad = require('left-pad');
var mime = require('mime-types');

function includeCSS($, filePath) {
  var cssText = fs.readFileSync(path.join(__dirname, filePath), {
    encoding: 'utf8'
  });

  cssText = cssText.replace(/url\((?:'|")(.+?)(?:'|")\)/g, function(string, filePath) {
    var file = fs.readFileSync(path.join(__dirname, 'assets', filePath));

    var mimeType = mime.lookup(path.extname(filePath));
    var base64 = file.toString('base64');
    var dataURI = `url(data:${mimeType}/;base64,${base64})`;
    return dataURI
  });

  $('head').append($('<style>').attr('media', 'all').html(cssText));
}

function recursiveLast(cue) {
  if (!cue.hasOwnProperty('cues') || cue.cues.length === 0) {
    return cue
  } else {
    return recursiveLast(cue.cues[cue.cues.length - 1])
  }
}

function addCuesFromList($, table, cues, options, parentGroups) {
  var parentGroups = parentGroups || [];

  function durationCell(duration, isWait) {
    var cell = $('<td>').addClass('is-small');
    if (isWait) {
      cell.addClass('is-wait');
    }
    if (options.ms === true) {
      cell.addClass('is-ms');
    }
    if (duration > 0) {
      var centiseconds = leftPad(Math.round((duration - Math.floor(duration)) * 100), 2, 0);
      var milliseconds = leftPad(Math.round((duration - Math.floor(duration)) * 1000), 3, 0);
      var seconds = leftPad(Math.floor(duration) % 60, 2, 0);
      var minutes = leftPad(Math.floor(duration / 60), 2, 0);
      cell.text(`${minutes}:${seconds}.${options.ms === true ? milliseconds : centiseconds}`);
    }
    return cell
  }

  function styleGroup(group, cue) {
    var left = (1.5 * cue.depth) - (cue.depth > 0 ? 1 : .5);
    if (cue.depth > 1) {
      left -= .5 * (cue.depth - 1);
    }
    var width = 20.5 - left;

    group.css({
      width: `calc(100% - ${left}rem - .5rem)`,
      'margin-left': `${left}rem`
    });
  }

  cues.forEach(function(cue) {
    var row = $('<tr>').addClass('cue-row');
    if (cue.colorName !== 'none') {
      row.addClass(cue.colorName);
    }

    if (options.showStatus !== false) {
      var status = $('<td>');
      if (cue.isBroken && options.indicateBrokenCues === true) {
        status.addClass('icon status_broken');
      } else if (cue.flagged) {
        status.addClass('icon status_flagged');
      }
      if (cue.armed === false) {
        row.addClass('disarmed');
      }
      row.append(status);
    }

    var typeClass = 'cue_' + cue.type.toLowerCase().replace(' ', '_');
    row.append($('<td>').addClass('icon').addClass(typeClass));

    row.append($('<td>').addClass('table-number-column truncate').text(cue.number));

    var name = $('<td>').addClass(`table-q-column cue-name-${cue.uniqueID}`);
    var nameText = $('<span>').addClass('cue-name-text');
    if (options.truncateCueNames === true) {
      nameText.addClass('truncate');
    }
    nameText.css({
      'margin-left': `${cue.depth}rem`
    });
    nameText.text(cue.listName);
    name.append(nameText);

    // group cue box
    if (cue.cues) {
      var groupFrame = $('<div>').addClass('group first').addClass(cue.colorName);
      if (cue.hasOwnProperty('mode')) {
        groupFrame.addClass(`mode-${cue.mode}`);
      }
      if (cue.cues.length === 0) {
        groupFrame.addClass('last');
      }

      styleGroup(groupFrame, cue);
      name.append(groupFrame);
    }
    // extending any parent groups
    parentGroups.forEach(function(group) {
      var groupFrame = $('<div>').addClass('group').addClass(group.colorName);
      if (group.hasOwnProperty('mode')) {
        groupFrame.addClass(`mode-${group.mode}`);
      }

      if (recursiveLast(group).uniqueID === cue.uniqueID && (!cue.cues || cue.cues.length === 0)) {
        groupFrame.addClass('last');
      }

      styleGroup(groupFrame, group);
      name.append(groupFrame);
    });

    row.append(name);

    var target = $('<td>').addClass('is-small');
    if (cue.cueTargetNumber) {
      target.text(cue.cueTargetNumber)
    }
    row.append(target);

    row.append(durationCell(cue.preWait, true));
    row.append(durationCell(cue.duration));
    row.append(durationCell(cue.postWait, true));


    var continueMode = $('<td>');
    if (cue.continueMode === 1) {
      continueMode.addClass('icon auto_continue')
    } else if (cue.continueMode === 2) {
      continueMode.addClass('icon auto_follow')
    }
    row.append(continueMode);
    
    if (options.showNotes === true) {
      var notes = $('<td>').addClass('notes is-small');
      notes.text(cue.notes);
      row.append(notes);
    }

    table.append(row);

    if (cue.cues) {
      addCuesFromList($, table, cue.cues, options, parentGroups.concat([cue]));
    }
  });
}

function addCart($, page, cart, options) {
  var table = $('<table>')
    .attr('id', `table_${cart.uniqueID}`)
    .addClass('cue-cart-table');

  for (var row = 1; row <= cart.cartRows; row++) {
    var tr = $('<tr>')
      .attr('id', `cart_${cart.uniqueID}_row_${row}`)
      .addClass('cue-cart-row')
      .addClass(`rows-${cart.cartRows}`)
      .addClass(`columns-${cart.cartColumns}`);
    for (var column = 1; column <= cart.cartColumns; column++) {
      var cell = $('<td>')
        .attr('id', `cart_${cart.uniqueID}_cell_${row}_${column}`)
        .addClass('cue-cart-cell');
      if (options.truncateCueNames === true) {
        cell.addClass('truncate');
      }
      tr.append(cell);
    }
    table.append(tr);
  }

  page.append(table);

  cart.cues.forEach(function(cue) {
    var name = cue.listName || `(Untitled ${cue.type} Cue)`;
    var text = `${cue.number}\u2009\u00B7\u2009${name}`;
    if (cue.number.length === 0) {
      text = name
    }
    var cell = page.find(`#cart_${cart.uniqueID}_cell_${cue.cartPosition[0]}_${cue.cartPosition[1]}`);
    cell
      .addClass('filled')
      .text(text);

    if (cue.colorName !== 'none') {
      cell.addClass(cue.colorName)
    }
    if (options.showStatus !== false && cue.armed === false) {
      cell.addClass('disarmed');
    }
  });
}

module.exports.generate = function(workspaceData, options) {
  var $ = cheerio.load('');
  var options = options || {};
  
  $('head').append('<meta charset="utf-8"/>');
  $('head').append($('<title>').text(workspaceData.workspaceName));

  includeCSS($, 'assets/icons.css');
  includeCSS($, 'assets/source-sans-pro.css');
  includeCSS($, 'assets/main.css');
  
  if (options.dark === true) {
    $('body').addClass('is-dark');
  }
  
  $('body').append($('<h1>').text(workspaceData.workspaceName));

  workspaceData.forEach(function(cueList) {
    var page = $('<section>').attr('id', `page_${cueList.uniqueID}`);
    if (options.breakAfterCueLists === true) {
      page.addClass('break-after');
    }
    page.append($('<h1>').text(cueList.listName));

    if (cueList.type === 'Cue List') {
      page.addClass('cue-list');
      var header = $('<tr>')
        .addClass('table-header');

      if (options.showStatus !== false) {
        header.append($('<th>').addClass('status-column'));
      }

      header.append($('<th>'));
      header.append($('<th>')
        .text('#')
        .addClass('table-number-column'));
      header.append($('<th>')
        .text('Q')
        .addClass('table-q-column'));
      header.append($('<th>').text('Target'));
      header.append($('<th>').text('Pre Wait'));
      header.append($('<th>').text('Action'));
      header.append($('<th>').text('Post Wait'));
      

      header.append($('<th>').addClass('icon auto_continue_stubby'));

      if (options.showNotes === true) {
        header.append($('<th>').text('Notes'));
      }

      var table = $('<table>')
        .attr('id', `table_${cueList.uniqueID}`)
        .addClass('cue-list-table')
        .append(header);

      addCuesFromList($, table, cueList.cues, options);

      page.append(table);
    } else if (cueList.type === 'Cart') {
      page.addClass('cue-cart');
      addCart($, page, cueList, options);
    }

    $('body').append(page);
  });

  return $.html();
}
