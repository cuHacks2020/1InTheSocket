import io from "socket.io-client";
import Player from "./Player";

const blockHeight = window.innerHeight / 9; 
const blockWidth = window.innerWidth / 16;

export default class Game {
  constructor() {
    this.checkWallCollisionPlayer = (
      x,
      y,
      r,
      windowWidth,
      windowHeight
    ) => {
      if (!this.map) return;

      let playerXRight = x + r;
      let playerYBot = y + r;
      const playerXLeft = x - r;
      const playerYTop = y - r;
      
      let blockXL = Math.floor((playerXLeft) / (windowWidth / 16));
      let blockYT = Math.floor((playerYTop) / (windowHeight / 9));
      let blockXR = Math.floor((playerXRight) / (windowWidth / 16));
      let blockYB = Math.floor((playerYBot) / (windowHeight / 9));

      if (blockXL < 0 || blockYT < 0 || blockXR > 15 || blockYB > 8)
        return true;

      if (
        this.map[blockXL][blockYT] ||
        this.map[blockXR][blockYT] ||
        this.map[blockXL][blockYB] ||
        this.map[blockXR][blockYB]
      ) {
        return true;
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

    await new Promise((resolve) => {
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
      const allowedServerDivergencePx = 30;

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
            playerObj.x = player.x * blockWidth;
            playerObj.y = player.y * blockHeight;
          }

          continue;
        }

        this.players.push(
          new Player(null, player.id, player.x * blockWidth, player.y * blockHeight)
        );
        this.players[0].allPlayers = this.players;
      }
    });

    return socket;
  }

  drawMap(p, windowWidth, windowHeight, pg) {
    pg.fill(0, 0);
    pg.strokeWeight(1);
    pg.stroke("white");

    let gridXLength = windowWidth / 16;
    let gridYLength = windowHeight / 9;

    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[0].length; j++) {
        if (this.map[i][j] === 1) {
          pg.rect(i * gridXLength, j * gridYLength, gridXLength, gridYLength);
        }
      }
    }
  }

  draw(p, windowWidth, windowHeight, pg) {
    pg.background(40);
    p.background(0);

    if (this.map) {
      this.drawMap(p, windowWidth, windowHeight, pg);
    }

    // const r = 30;
    // p.stroke("white");
    // p.strokeWeight(1);
    // p.noCursor();
    // p.fill(0, 0);
    // p.ellipse(p.mouseX, p.mouseY, r, r);
    // p.line(p.mouseX, p.mouseY + r / 2, p.mouseX, p.mouseY - r / 2);
    // p.line(p.mouseX - r / 2, p.mouseY, p.mouseX + r / 2, p.mouseY);


    let me = null;
    this.players.forEach(player => {
      player.draw(p, this, pg); 
      if (player.me) me = player;
    });

    const aspect = window.innerWidth / window.innerHeight;
    const portHeight = 350;
    const portWidth = portHeight * aspect;
    p.image(pg, 0, 0, windowWidth, windowHeight, me.x - portWidth / 2, me.y - portHeight / 2, portWidth, portHeight);
  }
}
