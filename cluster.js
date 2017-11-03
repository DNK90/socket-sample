
const fs = require('fs');
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  app = http.createServer(handler);
  app.listen(8000);

  var io = require('socket.io')(app);

  io.on('connection', function (socket) {
    socket.emit('news', { hello: `${process.pid}` });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

  console.log(`Worker ${process.pid} started`);
}
