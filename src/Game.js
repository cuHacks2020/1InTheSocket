import io from 'socket.io-client';

export default class Game {
    constructor() {
        console.log('hi');
        this.connect();

        this.map = null;
    }
    connect() {
        const socket = io();
        socket.emit('new user');
        socket.on("map", this.recvMap);
    }

    //renders map using a 2d mapObject 
    recvMap(mapObject) {
        this.map = mapObject;
    }

    drawMap(mapObject) {
        const pixelsPerBlock = 16;

        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[0].length; j++) {
                
            }
        }
    }

    draw(p) {
        console.log('draw');

        drawMap();
    }
}