// Create web server
// 1. Load the http module
var http = require('http');
var url = require('url');
var fs = require('fs');
var comments = require('./comments');
var qs = require('querystring');
var path = require('path');
var mime = require('mime');
var cache = {};

// 2. Create an HTTP server to handle responses
var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var realPath = 'assets' + pathname;
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('This request URL ' + realPath + ' was not found on this server.');
            response.end();
        } else {
            var contentType = mime.lookup(ext);
            response.setHeader('Content-Type', contentType);
            if (cache[realPath]) {
                response.writeHead(200, {
                    'Content-Type': contentType
                });
                response.write(cache[realPath]);
                response.end();
            } else {
                fs.readFile(realPath, 'binary', function (err, file) {
                    if (err) {
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.end(err);
                    } else {
                        cache[realPath] = file;
                        response.writeHead(200, {
                            'Content-Type': contentType
                        });
                        response.write(file, 'binary');
                        response.end();
                    }
                });
            }
        }
    });
});

server.listen(3000);
console.log('Server is running at http://