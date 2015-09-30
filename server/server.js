/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');

var optionSpec = {
  options: [
    { option: 'dest', alias: 'd', type: 'String',  description: "destination directory", required: true },
    { option: 'port', alias: 'p', type: 'Int',     description: "port to serve on", default: "8080", },
    { option: 'host',             type: 'String',  description: "host to serve on. Use 0.0.0.0 to publically serve", default: "localhost", },
    { option: 'help', alias: 'h', type: 'Boolean', description: 'displays help'},
  ],
  prepend: [
    "usage: image-save-server base-folder [options]",
    "",
  ],
  helpStyle: {
    typeSeparator: '=',
    descriptionSeparator: ' : ',
    initialIndent: 4,
  },
};

var optionator = require('optionator')(optionSpec);

function init(options) {
  var app = express();

  var baseDir = options._[0] || process.cwd();
  var destDir = options.dest;

  app.use(bodyParser.json({ limit: '1gb' }));
  app.post('/saveDataURL', saveDataURLToFile);
  app.use("/image-save-server", express.static(path.join(__dirname, "..", "api")));
  app.use(express.static(baseDir));

  var server = http.createServer(app);
  server.on('error', serverErrorHandler);
  server.on('listening', serverListeningHandler);
  tryToStartServer();

  function serverListeningHandler() {
    console.log("Go To http://" + options.host + ":" + options.port);
  };

  function serverErrorHandler() {
    ++options.port;
    tryToStartServer();
  };

  function tryToStartServer() {
    server.listen(options.port, options.host);
  }

  var safeRE = /^[a-zA-Z0-9_. -]+$/;
  var dataURLHeaderRE = /^data:(.*?),/;
  function saveDataURLToFile(req, res) {
    var filename = req.body.filename;
    var dataURL  = req.body.dataURL;
    if (!safeRE.test(filename)) {
      return sendResponse("bad filename, only 'a-zA-Z0-9_.' - are allowed");
    }

    filename = path.join(destDir, filename);

    var match = dataURLHeaderRE.exec(dataURL);
    if (!match) {
      return sendResponse("bad dataURL: Does not start with 'data:...,'");
    }
    var spec = match[1].split(";");
    if (spec.length === 1) {
      spec.unshift("");
    }

    var header   = match[0];
    var mimeTime = spec[0];
    var encoding = spec[1];

    fs.writeFile(
        filename,
        dataURL.substr(header.length),
        encoding, function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log('saved: ' + filename);
      }
      sendResponse(err);
    });

    function sendResponse(err) {
      var response = { };
      if (err) {
        response.err = err.toString();
      }
      res.type('application/json').send(response);
    }
  }
}

try {
  var args = optionator.parse(process.argv);
} catch (e) {
  console.error(e);
  console.log(optionator.generateHelp());
  process.exit(1);  // eslint-disable-line
}

var printHelp = function() {
  console.log(optionator.generateHelp());
  process.exit(0);  // eslint-disable-line
};

if (args.help) {
  printHelp();
}

init(args);

