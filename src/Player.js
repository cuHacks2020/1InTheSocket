import io from "socket.io-client";

const SPEED = 5;

export default class Player {
  constructor(socket = null, socketId = null, x = Math.floor(Math.random() * 800), y = Math.floor(Math.random() * 800), map) {
    this.x = x;
    this.y = y;
    this.socket = socket;
    this.me = !socketId;
    this.id = socketId || socket.id;
    this.lastMovement = { horizontal: 0, vertical: 0 };
    this.shot = {x1: 0, x2: 100, y1: 0, y2: 100, alpha: 0};
    this.hasShot = true;

      // Checks if there is wall between two set of points
    // Player position and given x y
    this.checkWallCollisionBullet = (p) => {
      if (!this.allPlayers) return;

      let currentX = this.x;
      let currentY = this.y;

      let angleDegrees = Math.atan2(p.mouseY - currentY, p.mouseX - currentX);
      while (currentX > 0 && currentX < window.innerWidth && currentY > 0 && currentY < window.innerHeight) {
        currentX += Math.cos(angleDegrees);
        currentY += Math.sin(angleDegrees);

        if (currentX > window.innerWidth || currentX < 0) {
          break;
        }

        if (this.iMap[Math.floor(currentX / (window.innerWidth / 16))][Math.floor(currentY / (window.innerHeight / 9))] === 1) {
          break;
        }

        for (const pl of this.allPlayers) {
          if (pl.me) {
            continue;
          }

          if (!pl.me && Math.sqrt((pl.x- currentX)**2 + (pl.y - currentY)**2) < 25) {
            this.socket.emit("kill", pl.id);
            return {x: currentX, y: currentY};
          }
        }
      }
      return {x: currentX, y: currentY};
    }
  }

  draw(p, g) {
    if (this.me) {
      let initX = this.x;
      let initY = this.y;
      if (this.doMovement(p, g)) {
        this.x = initX;
        this.y = initY;
      }

      p.mouseClicked = () => {
        if (this.hasShot) {
          const endCoords = this.checkWallCollisionBullet(p);

          this.shot = {
            x1: this.x,
            y1: this.y, 
            x2: endCoords.x,
            y2: endCoords.y,
            alpha: 1
          }
        }
      }


      p.stroke(`rgba(0,0,255,${this.shot.alpha})`);
      if (this.shot.alpha > 0.02)
      {
        this.shot.alpha -= 0.02;
      }
      p.line(this.shot.x1, this.shot.y1, this.shot.x2, this.shot.y2);
      p.alpha = 1;
    }
    
    if (!this.me) {
      p.stroke("red");
      p.fill([255, 0, 0, 50]);
    } else {
      p.stroke("blue");
      p.fill([0, 0, 255, 50]);
    }
    p.ellipse(this.x, this.y, 50);
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
