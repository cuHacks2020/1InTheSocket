import io from 'socket.io-client';
import Player from './Player';

export default class Game {
    constructor() {
        console.log('hi');
        this.connect();
        this.players = [new Player()]
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

    drawMap(p, windowWidth, windowHeight) {
        const pixelsPerBlock = 16;
        let gridXLength = windowWidth/20;
        let gridYLength = windowLength/20;

        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[0].length; j++) {
                if(this.map[i][j] == "1") {
                    p.rect(i*gridXLength, j*gridYLength, gridXLength, gridYLength);
                }
            }
        }
    }

<<<<<<< HEAD
    draw(p, windowWidth, windowHeight) {
        drawMap(p, windowWidth, windowHeight);
=======
    draw(p) {
        console.log('draw');
          //have players be ellipses for now
    
    this.players.forEach((player) => {
        player.draw(p);
    })

        //drawMap();
>>>>>>> rebased movement stuff
    }
}