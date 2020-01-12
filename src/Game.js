import io from "socket.io-client";
import Player from "./Player";

export default class Game {
  constructor() {
    this.checkWallCollisionPlayer = (
      x,
      y,
      diffX,
      diffY,
      windowWidth,
      windowHeight
    ) => {
      if (!this.map) return;
      
      const r = 25;
      // playerXLeft += 10;
      // playerYTop += 10;
      let playerXRight = x + r;
      let playerYBot = y + r;
      const playerXLeft = x - r;
      const playerYTop = y - r;
      let blockXL = Math.floor((playerXLeft + diffX) / (windowWidth / 16));
      let blockYT = Math.floor((playerYTop + diffY) / (windowHeight / 9));
      let blockXR = Math.floor((playerXRight + diffX) / (windowWidth / 16));
      let blockYB = Math.floor((playerYBot + diffX) / (windowHeight / 9));

      if (playerXRight > windowWidth - 50) {
        return false;
      }

      if (blockXL < 0 || blockYT < 0 || blockXR > 19 || blockYB > 19)
        return true;
      if (diffY != 0 || diffX != 0) {
        if (
          this.map[blockXL][blockYT] ||
          this.map[blockXR][blockYT] ||
          this.map[blockXL][blockYB] ||
          this.map[blockXR][blockYB]
        ) {
          return true;
        }
      }
      return false;
    };
  }

  async init() {
    const socket = await this.connect();

    this.players = [new Player(socket)];
    this.players[0].allPlayers = this.players;
  }

  async connect() {
    const socket = io();

    socket.on("map", (mapObject, x, y) => {
      this.map = mapObject;
      this.x = x;
      this.y = y;
 
      for (let player of this.players) {
        player.iMap = mapObject;
      }
    });

    await new Promise((resolve, reject) => {
      socket.on("connect", () => {
        resolve();
      });
    });

    socket.on("dead", (id) => {
      if (id === socket.id) { 
        window.location.reload();
      }
    })

    socket.on("gameData", data => {
      const allowedServerDivergencePx = 100;

      const receivedIds = data.map(({ id }) => id);
      this.players = this.players.filter(({ id }) => receivedIds.includes(id));

      for (const player of data) {
        const playerObj = this.players.find(({ id }) => id === player.id);

        if (playerObj && playerObj.me) {
          playerObj.colour = player.colour;
          continue;
        }

        if (playerObj) {
          const { dx, dy } = player;
          const serverDiffX = playerObj.x - player.x;
          const serverDiffY = playerObj.y - player.y;

          // Store last movement
          playerObj.lastMovement = {
            horizontal: Math.sign(dx),
            vertical: Math.sign(dy)
          };

          if (
            Math.sqrt(serverDiffX ** 2 + serverDiffY ** 2) >
            allowedServerDivergencePx
          ) {
            playerObj.x = player.x;
            playerObj.y = player.y;
          }

          continue;
        }

        this.players.push(
          new Player(null, player.id, player.x, player.y, player.colour)
        );
        this.players[0].allPlayers = this.players;
      }
    });

    return socket;
  }

  drawMap(p, windowWidth, windowHeight) {
    p.fill(0, 0);
    p.strokeWeight(8);
    p.stroke("white");

    let gridXLength = windowWidth / 16;
    let gridYLength = windowHeight / 9;

    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[0].length; j++) {
        if (this.map[i][j] === 1) {
          p.rect(i * gridXLength, j * gridYLength, gridXLength, gridYLength);
        }
      }
    }
  }

  draw(p, windowWidth, windowHeight) {
    p.background(40);

    if (this.map) {
      this.drawMap(p, windowWidth, windowHeight);
    }

    const r = 30;
    p.stroke("blue");
    p.strokeWeight(1);
    p.noCursor();
    p.fill(0, 0);
    p.ellipse(p.mouseX, p.mouseY, r, r);
    p.line(p.mouseX, p.mouseY + r / 2, p.mouseX, p.mouseY - r / 2);
    p.line(p.mouseX - r / 2, p.mouseY, p.mouseX + r / 2, p.mouseY);

    p.strokeWeight(6);

    this.players.forEach(player => {
      player.draw(p, this);
      // let pos = player.shoot(p);
      // if (pos) {
      //   console.log(pos);

      //   p.line(pos.x, pos.y, p.mouseX, p.mouseY);
      // }
    });

  }
}
