import io from "socket.io-client";
import Player from "./Player";

const blockHeight = window.innerHeight / 9;
const blockWidth = window.innerWidth / 16;

const State = {
  Playing: "Playing",
  Spectating: "Spectating",
  Starting: "Starting",
  Waiting: "Waiting"
};

export default class Game {
  constructor() {
    this.me = null;
    this.state = State.Waiting;
    this.countdown = 0;

    this.leaderboard = [];

    this.checkWallCollisionPlayer = (x, y, r, windowWidth, windowHeight) => {
      if (!this.map) return;

      let playerXRight = x + r;
      let playerYBot = y + r;
      const playerXLeft = x - r;
      const playerYTop = y - r;

      let blockXL = Math.floor(playerXLeft / (windowWidth / 16));
      let blockYT = Math.floor(playerYTop / (windowHeight / 9));
      let blockXR = Math.floor(playerXRight / (windowWidth / 16));
      let blockYB = Math.floor(playerYBot / (windowHeight / 9));

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

    this.players = {};
    this.players[socket.id] = new Player(socket);
    this.me = this.players[socket.id];
    this.me.iMap = this.map;
    this.me.me = true;
    this.me.allPlayers = this.players;
  }

  async connect() {
    const socket = io();

    await new Promise(resolve => {
      let connections = Array(4);
      const check = () => {
        if (
          connections[0] &&
          connections[1] &&
          connections[2] &&
          connections[3]
        ) {
          resolve();
        }
      };

      socket.on("connect", () => {
        connections[0] = true;
        check();
      });

      socket.on("map", (mapObject, x, y) => {
        this.map = mapObject;
        if (this.me) {
          this.me.iMap = mapObject;
        }
        
        this.x = x;
        this.y = y;

        connections[1] = true;
        check();
      });

      socket.on("state", (state, countdown) => {
        this.state = state;
        this.winner = undefined;

        if (countdown) {
          this.countdown = countdown;
        }

        connections[2] = true;
        check();
      });

      socket.on("leaderboard", leaderboard => {
        this.leaderboard = leaderboard.sort(function(a, b) {
          return b.score - a.score;
        });

        connections[3] = true;
        check();
      });
    });

    socket.on("startingPos", ({ x, y }) => {
      for (const [_, player] of Object.entries(this.players)) {
        if (player.me) {
          player.x = x * blockWidth;
          player.y = y * blockHeight;
          break;
        }

        player.lastMovement = { horizontal: 0, vertical: 0 };
      }

      this.state = State.Playing;
    });

    socket.on("dead", id => {
      if (id === socket.id) {
        this.state = State.Spectating;
      }
    });

    socket.on("gameData", data => {
      const allowedServerDivergencePx = 0.5;

      const newIds = Object.keys(data);

      // Remove disconnected players
      for (const id of Object.keys(this.players)) {
        if (!newIds.includes(id)) {
          delete this.players[id];
        }
      }

      for (const playerId of newIds) {
        const newPlayerData = data[playerId];
        const currentPlayer = this.players[playerId];

        if (currentPlayer && currentPlayer.me) {
          continue;
        }

        if (currentPlayer) {
          const { dx, dy, y, x, dead } = newPlayerData;

          currentPlayer.dead = dead;

          const serverDiffX = currentPlayer.x - x;
          const serverDiffY = currentPlayer.y - y;

          // Store last movement
          currentPlayer.lastMovement = {
            horizontal: Math.sign(dx),
            vertical: Math.sign(dy)
          };

          if (
            Math.sqrt(serverDiffX ** 2 + serverDiffY ** 2) >
            allowedServerDivergencePx
          ) {
            currentPlayer.x = x * blockWidth;
            currentPlayer.y = y * blockHeight;
          }

          currentPlayer.colour = newPlayerData.colour;
          currentPlayer.username = newPlayerData.username;
          continue;
        }

        this.players[playerId] = new Player(
          null,
          playerId,
          newPlayerData.x * blockWidth,
          newPlayerData.y * blockHeight,
          newPlayerData.username
        );
        this.players[playerId].colour = newPlayerData.colour;
        this.players[playerId].iMap = this.map;
        this.players[playerId].allPlayers = this.players;
      }
    });

    socket.on("fire", ({ player, oldWidth, oldHeight }) => {
      const playerObj = this.players[player.id];

      playerObj.shot = {
        x1: (player.shot.x1 * window.innerWidth) / oldWidth,
        x2: (player.shot.x2 * window.innerWidth) / oldWidth,
        y1: (player.shot.y1 * window.innerHeight) / oldHeight,
        y2: (player.shot.y2 * window.innerHeight) / oldHeight,
        alpha: player.shot.alpha
      };
    });

    socket.on("disconnect", () => {
      alert("Disconnected for being idle.");
    });

    socket.on("winner", player => {
      this.winner = player;
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

    // Draw cursor
    // const r = 30;
    // p.stroke("white");
    // p.strokeWeight(1);
    // p.noCursor();
    // p.fill(0, 0);
    // p.ellipse(p.mouseX, p.mouseY, r, r);
    // p.line(p.mouseX, p.mouseY + r / 2, p.mouseX, p.mouseY - r / 2);
    // p.line(p.mouseX - r / 2, p.mouseY, p.mouseX + r / 2, p.mouseY);

    if (this.state === State.Playing || this.state === State.Spectating) {
      for (const [_, player] of Object.entries(this.players)) {
        if (player.dead || (player.me && this.state !== State.Playing)) {
          continue;
        }

        player.draw(p, this, pg, this.state);
      }
    }

    if (this.state === State.Playing) {
      const aspect = window.innerWidth / window.innerHeight;
      const portHeight = 425;
      const portWidth = portHeight * aspect;
      p.image(
        pg,
        0,
        0,
        windowWidth,
        windowHeight,
        this.me.x - portWidth / 2,
        this.me.y - portHeight / 2,
        portWidth,
        portHeight
      );
    } else {
      p.image(pg, 0, 0, windowWidth, windowHeight);
    }
    this.drawGameState(p);
    this.drawLeaderboard(p, window.innerWidth, window.innerHeight);
  }

  drawGameState(p) {
    p.textSize(80);
    p.textAlign(p.CENTER, p.CENTER);

    switch (this.state) {
      case State.Spectating:
        p.fill("rgba(25, 161, 191, 0.20)");
        p.text("Spectating", window.innerWidth / 2, blockHeight / 2);
        break;
      case State.Waiting:
        p.fill("rgba(25, 161, 191, 0.5)");
        p.text(
          "Waiting for players...",
          window.innerWidth / 2,
          blockHeight / 2
        );
        break;
      case State.Starting:
        p.textSize(120);
        p.fill("rgba(191, 25, 25, 0.9)");
        p.text(
          `Starting in`,
          window.innerWidth / 2,
          window.innerHeight / 2 - 60
        );
        p.text(
          this.countdown || "wtf",
          window.innerWidth / 2,
          window.innerHeight / 2 + 60
        );
        break;
    }

    if (!this.winner) return;
    p.textSize(120);
    p.fill(
      `rgba(${this.winner.colour.r}, ${this.winner.colour.g}, ${this.winner.colour.b}, 0.9)`
    );
    p.text(
      `${this.winner.username} wins!`,
      window.innerWidth / 2,
      window.innerHeight / 2 - 130
    );
  }

  drawLeaderboard(p, windowWidth, windowHeight) {
    p.fill(100, 255, 127, 50);
    p.rect(
      windowWidth - windowWidth / 5 - 20,
      0,
      windowWidth / 5 + 20,
      windowHeight / 3
    );
    p.textSize(windowWidth / 40);
    p.fill(0, 0, 0, 175);
    p.text(
      "Leaderboard",
      windowWidth - (windowWidth / 40) * 4,
      windowWidth / 40
    );
    p.textSize(windowWidth / 60);
    let i = 1;
    for (let player of this.leaderboard) {
      if (i === 6) {
        break;
      }
      if (!this.players[player.id]) continue;

      const colour = this.players[player.id].colour;
      if (colour) p.fill(`rgb(${colour.r}, ${colour.g}, ${colour.b})`);
      p.text(
        player.username + ": " + player.score,
        windowWidth - (windowWidth / 40) * 4,
        windowWidth / 40 + (i * windowWidth) / 40
      );
      i++;
    }
  }
}
