var app = require("express")();
const express = require("express");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var path = require("path");
const width = 9;
const height = 16;
const blocks = [
  [
    [0, 1, 0],
    [0, 0, 0],
    [1, 1, 1]
  ],
  [
    [0, 0, 1],
    [1, 0, 0],
    [1, 1, 0]
  ],
  [
    [1, 1, 1],
    [0, 0, 0],
    [1, 0, 1]
  ],
  [
    [1, 1, 1],
    [0, 0, 0],
    [1, 1, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 0, 1],
    [0, 0, 0],
    [1, 0, 1]
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ]
];
var map = generateMap();

let players = [];

const PORT = process.env.PORT || 80;
server.listen(PORT);

console.log("Go to http://localhost:80");

const public = path.join(__dirname, "..", "public");

app.use(express.static(public));

io.on("connection", function(socket) {
  let x, y;

  socket.emit("map", map);

  while (!x || map[x][y] === 1) {
    x = Math.floor(Math.random() * height);
    y = Math.floor(Math.random() * width);
  }

  x = x + 0.5;
  y = y + 0.5;

  players.push({
    id: socket.id,
    x,
    y,
    dx: 0,
    dy: 0,
    shot: { x1: 0, x2: 100, y1: 0, y2: 100, alpha: 0 }
  });

  socket.emit("startingPos", { x, y });

  console.log(`New connection: ${players.length} players now connected.`);

  let buffer = 0;
  socket.on("move", (data) => {
    const {x, y} = data;
    const player = players.find(({id}) => id === socket.id);

    if (!player) return;

    player.dx = x - player.x;
    player.dy = y - player.y;
    player.x = x;
    player.y = y;

    // simulate lag
    // setTimeout(() => socket.emit("gameData", players), 5000); 
    buffer++;
    if (buffer > 2) {
      io.emit("gameData", players);
    }
  })

  socket.on("fire", ({ shot, oldHeight, oldWidth }) => {
    const player = players.find(({ id }) => id === socket.id);
    player.shot = shot;
    socket.broadcast.emit("fire", {
      player: player,
      oldHeight: oldHeight,
      oldWidth: oldWidth
    });
  });

  socket.on("kill", id => {
    io.emit("dead", id);
    const player = players.find((player) => player.id === id);
    if (player) {
      player.dead = true;
    }
  })

  socket.on("disconnect", data => {
    console.log("Disconnect");
    players = players.filter(({ id }) => id !== socket.id);
    console.log(`Disconnection: ${players.length} players now connected.`);
  });
});

// < ----- Map Generation ----- >

function generateMap() {
  let map = new Array();

  // populate
  for (let j = 0; j < height; j++) {
    map.push([]);
    for (let i = 0; i < width; i++) {
      map[j].push(0);
    }
  }

  // add blocks
  for (let j = 0; j < height; j += 4) {
    let i = 0;
    while (i < width) {
      if (map[j][i] === 0) {
        let block = blocks[Math.floor(Math.random() * blocks.length)];
        let rotations = Math.floor(Math.random() * 3);
        for (let r = 0; r < rotations; r++) block = rotateBlock(block);
        insertBlock(map, i, j, block);
      }
      i += 4;
    }
  }
  return map;
}

function insertBlock(map, x, y, block) {
  for (let j = 0; j < block.length; j++) {
    for (let i = 0; i < block[0].length; i++) {
      map[y + j][x + i] = block[j][i];
    }
  }
  return true;
}

function rotateBlock(block) {
  rotated = [];
  for (let j = 0; j < block.length; j++) {
    rotated.push([]);
    for (let i = 0; i < block[0].length; i++) {
      rotated[j].push(block[block.length - i - 1][j]);
    }
  }
  return rotated;
}
