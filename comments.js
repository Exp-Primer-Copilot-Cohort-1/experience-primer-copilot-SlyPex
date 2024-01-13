// Create web server

// Run: node comments.js
//
// See: http://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http
//
// Note: This is an example only.  Not for production use.
//
// See also:
// https://www.npmjs.com/package/node-static
//
// Usage:
// http://localhost:8080
// http://localhost:8080/hello.html
// http://localhost:8080/README.md
// http://localhost:8080/README.md?foo=bar
// http://localhost:8080/README.md?foo=bar&baz=quux
// http://localhost:8080/README.md?foo=bar&baz=quux#xyzzy
// http://localhost:8080/README.md?foo=bar&baz=quux#xyzzy?foo=bar&baz=quux

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var port = 8080;

http.createServer(function (request, response) {

    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), uri);

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write('404 Not Found\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.write(err + '\n');
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, 'binary');
            response.end();
        });
    });
}).listen(port);

console.log('Server running at http://localhost:' + port + '/');

=======
Suggestion 3

const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

// Create express app
const app = express();

// Parse body of request
app.use(bodyParser.json());
app.use(cors());

// Create comments object
const commentsByPostId = {};

// Get comments by post id
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Create comment
app.post('/posts/:id/comments', async (req, res) => {
  // Generate random id
  const commentId = randomBytes(4).toString('hex');

  // Get comment data from request
  const { content } = req.body;

  // Get comments for post
  const comments = commentsByPostId[req.params.id] || [];

  // Add comment to comments array
  comments.push({ id: commentId, content, status: 'pending' });

  // Update comments for post
  commentsByPostId[req.params.id] = comments;

  // Emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { id: commentId, content, postId: req.params.id, status: 'pending' }
  });

  // Send response
  res.status(201).send(comments);
});

// Receive event from event bus
app.post('/events', async (req, res) => {
  console.log('Received event', req.body.type);

  // Get event data
  const { type, data } = req.body;

  // Check event type
  if (type === 'CommentModerated') {
    // Get comments for post
    const comments = commentsByPostId[data.postId];

    // Get comment to update
    const comment = comments.find(comment => {
      return comment.id === data.id;
    });

    // Update comment status
    comment.status = data.status;

    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { id: data.id, content: data.content, postId: data.postId, status: data.status }
    });
  }
