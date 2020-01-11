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
        let m;
        let x;
        let y;
        socket.on("map", this.recvMap);
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