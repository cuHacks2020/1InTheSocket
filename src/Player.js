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
    const vertical = Number(p.keyIsDown(83) - p.keyIsDown(87));
    const horizontal = Number(p.keyIsDown(68) - p.keyIsDown(65));

    if (vertical && !horizontal) {
      this.y += vertical * SPEED;
    } else if (horizontal && !vertical) {
      this.x += horizontal * SPEED;
    } else if (vertical && horizontal) {
      const adjustedSpeed = SPEED / Math.sqrt(2)

      this.x += adjustedSpeed * horizontal;
      this.y += adjustedSpeed * vertical;
    }

    this.socket.emit('move', {x: this.x, y: this.y});
  }
}