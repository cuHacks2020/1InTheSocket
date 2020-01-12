import io from "socket.io-client";
import Player from "./Player";

export default class Game {
  async init() {
    const socket = await this.connect();

    this.players = [new Player(socket)];
  }

  async connect() {
    const socket = io();
    socket.on("map", (mapObject, x, y) => {
      this.map = mapObject;
      this.x = x;
      this.y = y;
    });

    await new Promise((resolve, reject) => {
      socket.on("connect", () => {
        resolve();
      });
    });

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
      }
    });

    return socket;
  }

  // Checks if there is wall between two set of points
  // Player position and given x y
  checkWallCollisionBullet(playerX, playerY, X, Y) {
    playerX = playerX / 20;
    playerY = playerY / 20;
    X = X / 20;
    Y = Y / 20;
    let angleDegrees = (Math.atan2(Y - playerY, X - playerX) * 180) / Math.PI;
    while (playerX != X && playerY != Y) {
      playerX += Math.sin(angleDegrees);
      playerY += Math.cos(angleDegrees);
      if (this.map[Math.floor(playerY)][Math.floor(playerX)] == "1") {
        return true;
      }
    }
    return false;
  }

  checkWallCollisionPlayer(playerX, playerY, differenceX, differenceY) {
    if (
      (differenceY != 0 &&
        this.map[Math.floor((playerY + differenceY) / 20)][
          Math.floor(playerX / 20)
        ]) ||
      (differenceX != 0 &&
        this.map[Math.floor(playerY / 20)][
          Math.floor((playerX + differenceX) / 20)
        ])
    ) {
      return true;
    }
    return false;
  }

  drawMap(p, windowWidth, windowHeight) {
    p.fill(0, 0);
    p.strokeWeight(8);
    p.stroke("white");

    let gridXLength = windowWidth / 16;
    let gridYLength = windowHeight / 9;
    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[0].length; j++) {
        if (this.map[i][j] == "1") {
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
    p.fill(0, 0);
    p.ellipse(p.mouseX, p.mouseY, r, r);
    p.line(p.mouseX, p.mouseY + r / 2, p.mouseX, p.mouseY - r / 2);
    p.line(p.mouseX - r / 2, p.mouseY, p.mouseX + r / 2, p.mouseY);

    p.strokeWeight(6);

    this.players.forEach(player => {
      player.draw(p);
    });
  }
}
