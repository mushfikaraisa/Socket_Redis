const express = require("express");
const socket = require("socket.io");
const redis = require("redis")
// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

const client = redis.createClient();

// Socket setup
const io = socket(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});

io.on("connection", function (socket) {
  console.log("Made socket connection");
  socket.on("new user", function (user) {
    console.log(user, "user");
    socket.userId = user;
    client.get(`userData`, (err, result) => {
      console.log(result,"result",err);
      if (result && result.length > 0) {
        const existingData = JSON.parse(result).data;
        console.log("existingData",existingData)
        const newData = [...existingData, user]
        console.log(newData, "newData");
        client.setex(`userData`, 3600, JSON.stringify({ source: 'Redis Cache', data: newData }));
        io.emit("new user", newData);
      }
      else {
        client.setex(`userData`, 3600, JSON.stringify({ source: 'Redis Cache', data: [user] }));
        io.emit("new user", [user]);
        console.log("new user added", [user]);
      }
    });
  });
});

app.get('/api', (req, res) => {
  client.setex(`userData`, 3600, JSON.stringify({ source: 'Redis Cache', data: [] }));
  return res.status(200).json({ success: true, data: [] });
});
