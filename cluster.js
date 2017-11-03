
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const url = require('url');
var fs = require('fs');


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
  var app = http.createServer(function(req, res) {
    var url_parts = url.parse(req.url)
    // switch(url_parts.pathname) {
    //   case '/':
    //     console.log('start chat room');
    //     res.end("Hello world");
    //     break;
    // }
    console.log(url_parts.pathname);
  });
  app.listen(8000);

  var io = require('socket.io')(app);

  io.on('connection', function (socket) {
    
    socket.on('post status', function (data) {
      console.log(data);
      // saveData(data);
      socket.emit('broadcast', {"status": data});
    });
  });

  console.log(`Worker ${process.pid} started`);
}

function saveData(data) {
  console.log("Save data to db");
}
