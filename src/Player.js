import io from 'socket.io-client';

const SPEED = 5;

export default class Player {
  constructor(socket=null, socketId=null, x=100, y=100) {
    this.x = x;
    this.y = y;
    this.socket = socket;
    this.me = !socketId;

    this.id = socketId || socket.id;
  }

  draw(p) {
    if (this.me) {
      this.doMovement(p);
    }
   
    p.ellipse(this.x, this.y, 50);
  }

  doMovement(p) {
    if(p.keyIsDown(87)) {
      this.y -= SPEED;
    }

    if(p.keyIsDown(83)) {
      this.y += SPEED;
    }

    if(p.keyIsDown(65)) {
      this.x -= SPEED;
    }

    if(p.keyIsDown(68)) {
      this.x += SPEED;
    }
    

    this.socket.emit('move', {x: this.x, y: this.y});
  }
}