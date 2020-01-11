import io from 'socket.io-client';
import Player from './Player';

export default class Game {
  async init() {
    const socket = await this.connect();

    this.players = [new Player(socket)]
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
    })

    socket.on("gameData", (data) => {
      const receivedIds = data.map(({id}) => id);
      this.players = this.players.filter(({id}) => receivedIds.includes(id));

      for (const player of data) {
        const playerObj = this.players.find(({id}) => id === player.id);

        if (playerObj) {
          playerObj.x = player.x;
          playerObj.y = player.y;

          continue;
        }

        this.players.push(new Player(null, player.id, player.x, player.y));
      }
    });

    return socket;
  }

  drawMap(p, windowWidth, windowHeight) {
    let gridXLength = windowWidth / 20;
    let gridYLength = windowHeight / 20;
    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[0].length; j++) {
        if (this.map[i][j] == "1") {
          p.color(255, 204, 0);
          p.fill(255, 204, 0);
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

    this.players.forEach((player) => {
        player.draw(p);
    })
  }
}