import io from 'socket.io-client';
import Player from './Player';

export default class Game {
    constructor() {
        console.log('hi');
        this.connect();
        this.players = [new Player()]
        this.map = null;
        this.x = null;
        this.y = null;
        this.enemies = [];

        this.recvMap = (mapObject, x, y) => {
            this.map = mapObject;
            this.x = x;
            this.y = y;
        }

        this.connect();
    }
    
    connect() {
        const socket = io();
        socket.emit('new user');
        socket.on("map", this.recvMap);
    }

    // Checks if there is wall between two set of points
    // Player position and given x y
    checkWallCollisionBullet(playerX, playerY, X, Y) {
        playerX = playerX / 20;
        playerY = playerY / 20;
        X = X / 20;
        Y = Y / 20;
        let angleDegrees = Math.atan2(Y - playerY, X - playerX) * 180 / Math.PI;
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
        if (differenceY != 0 && this.map[Math.floor((playerY + differenceY)/20)][Math.floor(playerX/20)] ||
            differenceX != 0 && this.map[Math.floor(playerY/20)][Math.floor((playerX+differenceX)/20)]) {
            return true;
        }
        return false;
    }

    drawMap(p, windowWidth, windowHeight) {
        const pixelsPerBlock = 16;
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
        if (this.map) {
            this.drawMap(p, windowWidth, windowHeight);
        }
    }
}