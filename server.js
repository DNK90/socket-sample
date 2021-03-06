var cluster = require('cluster');
var MongoClient = require('mongodb').MongoClient
var numCPUs = require('os').cpus().length;
var fs = require('fs');
var assert = require('assert');

PORT = 8000;
MONGO_HOST = 'mongo'; 
MONGO_PORT = 27017;
REDIS_HOST = 'redis';
REDIS_PORT = 6379;

TABLE = 'status';
var url = `mongodb://${MONGO_HOST}:${MONGO_PORT}/myproject`;


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

MongoClient.connect(url, function(err, db) {

  assert.equal(null, err);
  console.log("Connected correctly to mongodb server");

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (var i = 0; i < 2; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } 

  if (cluster.isWorker) {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    var server = require('http').createServer(handler);

    var io = require('socket.io').listen(server);
    var redis = require('socket.io-redis');

    io.adapter(redis({host: REDIS_HOST, port: REDIS_PORT}));

    io.on('connection', function (socket) {

      socket.on('get status', function(data) {
        getStatuses(db, function(docs) {
          socket.emit('statuses', docs);
        })
      });
      
      socket.on('post status', function (data) {
        status = {status: data, time: new Date().getTime()};
        console.log(status);
        insertStatus(db, status, function(result) {
          console.log(result);
        });
        socket.broadcast.emit('broadcast', status);
        socket.emit('broadcast', status);
      });
    });

    server.listen(PORT);
    console.log(`Worker ${process.pid} started`);
  }
});

var insertStatus = function(db, data, callback) {
  // Get the documents collection
  var collection = db.collection(TABLE);
  var now = new Date().getTime();
  // Insert some documents
  collection.insertOne(
    data, 
    function(err, result) {
      console.log(`Inserted ${data}`);
      callback(result);
    }
  );
}

var getStatuses = function(db, callback) {
  var collection = db.collection(TABLE);
  collection.find({}).sort({time: -1}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
}
