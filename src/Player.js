import io from "socket.io-client";

const SPEED = 5;

export default class Player {
  constructor(socket = null, socketId = null, x = Math.floor(Math.random() * 800), y = Math.floor(Math.random() * 800)) {
    this.x = x;
    this.y = y;
    this.socket = socket;
    this.me = !socketId;
    this.id = socketId || socket.id;
    this.lastMovement = { horizontal: 0, vertical: 0 };
  }

  draw(p, g) {
    if (this.me) {
      let initX = this.x;
      let initY = this.y;
      if (this.doMovement(p, g)) {
        this.x = initX;
        this.y = initY;
      }
    }
    
    if (!this.me) {
      p.stroke("red");
      p.fill([255, 0, 0, 50]);
    } else {
      p.stroke("blue");
      p.fill([0, 0, 255, 50]);
    }
    p.ellipse(this.x, this.y, 50);
    p.ellipseMode(p.CORNER);
    p.ellipse(this.x, this.y, g.width / 32, g.height / 32);

  }

  shoot(p) {
    let pos = {};
    let clicked = false;
    if (p.mousePressed) {
      clicked = true;
      pos.x = this.x;
      pos.y = this.y;
      console.log(pos);
      console.log('clicked!');
      return pos.x;
    }
    console.log(clicked);
    return undefined;
  }

  doMovement(p, g) {
    let { vertical, horizontal } = this.lastMovement;

    if (this.me) {
      vertical = Number(p.keyIsDown(83) - p.keyIsDown(87));
      horizontal = Number(p.keyIsDown(68) - p.keyIsDown(65));
    }

    let initX = this.x;
    let initY = this.y;

    if (vertical && !horizontal) {
      this.y += vertical * SPEED;
    } else if (horizontal && !vertical) {
      this.x += horizontal * SPEED;
    } else if (vertical && horizontal) {
      const adjustedSpeed = SPEED / Math.sqrt(2);

      this.x += adjustedSpeed * horizontal;
      this.y += adjustedSpeed * vertical;
    }
    if (this.x > window.innerWidth) {
      this.x = window.innerWidth;
    }

    if (this.x < 0) {
      this.x = 0;
    }

    if (this.y > window.innerHeight) {
      this.y = window.innerHeight;
    }

    if (this.y < 0) {
      this.y = 0;
    }

    if (this.me) {
      this.socket.emit("move", { x: this.x, y: this.y });
    }

    return g.checkWallCollisionPlayer(
      this.x,
      this.y,
      horizontal * SPEED,
      vertical * SPEED,
      g.width,
      g.height
    );
  }

  getSocket() {
    return this.id;
  }
}
