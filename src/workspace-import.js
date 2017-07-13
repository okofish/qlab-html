var fs = require('fs');
var osc = require('osc');

function recursiveLastCue(cue) {
  if (Array.isArray(cue)) {
    cue = {
      cues: cue
    };
  }
  
  if (cue.hasOwnProperty('cues') && cue.cues.length > 0) {
    var cues = cue.cues;
    var lastCue = cues[cues.length - 1];

    return recursiveLastCue(lastCue);
  } else {
    return cue
  }
}

module.exports.import = function(workspace, cb) {
  if (typeof workspace === 'function') {
    var cb = workspace;
    var workspace = undefined;
  }

  var workspaceData = {};
  var flatCues = {};
  var lastCueId;
  
  function returnData() {
    cb.apply(this, arguments);
    tcpPort.close();
  }

  function recursiveGetParent(cueId) {
    var parent = flatCues[cueId].parent;
    if (parent === '[root group of cue lists]') {
      return [cueId]
    } else {
      return recursiveGetParent(parent).concat([cueId])
    }
  }

  var tcpPort = new osc.TCPSocketPort({
    address: '127.0.0.1',
    port: 53000,
    localPort: 53000
  });

  tcpPort.on('message', function(msg) {
    var json = JSON.parse(msg.args[0]);
    if (json.status = 'ok') {
      var data = json.data;
      var workspaceId = json.workspace_id;
      if (msg.address.match(/\/reply\/workspace\/.+\/cueLists/)) {
        workspaceData = data;
        workspaceData.workspaceId = workspaceId;

        lastCueId = recursiveLastCue(data).uniqueID;

        tcpPort.send({
          address: '/workspaces'
        });
      } else if (msg.address.match(/\/reply\/workspaces/)) {
        var workspace = data.filter(function(workspace) {
          return workspace.uniqueID === workspaceData.workspaceId;
        });
        if (workspace.length > 0) {
          workspaceData.workspaceName = workspace[0].displayName;
        } else {
          workspaceData.workspaceName = 'Untitled Workspace';
        }
        
        if (workspaceData.length > 0) {
          tcpPort.send({
            address: '/cue/*/valuesForKeys',
            args: [
              JSON.stringify(['cueTargetNumber', 'preWait', 'duration', 'postWait', 'continueMode', 'mode', 'uniqueID', 'isBroken', 'notes', 'parent', 'cartPosition', 'cartColumns', 'cartRows'])
            ]
          });
        } else {
          returnData(workspaceData);
        }
      } else if (msg.address.match(/\/cue(_id)?\/.+\/valuesForKeys/)) {
        flatCues[data.uniqueID] = data;
        if (data.uniqueID === lastCueId) {
          for (var id in flatCues) {
            var cueData = flatCues[id];
            var ancestors = recursiveGetParent(id);
            var cue = ancestors.reduce(function(generation, nextId) {
              if (!Array.isArray(generation)) {
                generation = generation.cues
              }
              var nextCue = generation.filter(function(cue) {
                return cue.uniqueID === nextId;
              })[0];

              return nextCue
            }, workspaceData);
            
            for (var key in cueData) {
              var value = cueData[key];
              if (['parent'].indexOf(key) === -1) {
                cue[key] = value;
              }
            }
            
            // subtracting 2 so top level cues in a cue list end up with depth 0, and cue lists have depth -1
            cue.depth = ancestors.length - 2;
          }

          returnData(workspaceData);
        }
      } else {
        //console.log(json);
      }
    } else {
      console.error(`Request ${json.address} to workspace ${json.workspace_id} failed.`)
    }
  });

  tcpPort.on('ready', function() {
    tcpPort.send({
      address: typeof workspace === 'string' ? `/workspace/${workspace}/cueLists` : '/cueLists',
      args: []
    });
  });

  tcpPort.open();
}
