const blockHeight = window.innerHeight / 9; 
const blockWidth = window.innerWidth / 16;
const SPEED = 0.07;
const speed_v = SPEED * blockHeight;
const speed_h = SPEED * blockWidth;
const PLAYER_RADIUS = 25;

export default class Player {
  constructor(socket = null, socketId = null, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.socket = socket;
    this.me = !socketId;
    this.id = socketId || socket.id;
    this.lastMovement = { horizontal: 0, vertical: 0 };
    this.shot = {x1: 0, x2: 100, y1: 0, y2: 100, alpha: 0};
    this.hasShot = true;

    if (socket) {
      socket.on('startingPos', ({x,y}) => {
        this.x = x * blockWidth;
        this.y = y * blockHeight;
      });
    }

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

  draw(p, game) {
    this.tick(p, game);
    
    if (!this.me) {
      p.stroke("red");
      p.fill([255, 0, 0, 50]);
    } else {
      p.stroke("blue");
      p.fill([0, 0, 255, 50]);
    }

    p.strokeWeight(2);
    p.ellipse(this.x, this.y, PLAYER_RADIUS * 2);

    p.strokeWeight(5);
    if (this.me) {
      p.stroke(`rgba(0,0,255,${this.shot.alpha})`);
      if (this.shot.alpha > 0.02)
      {
        this.shot.alpha -= 0.02;
      }
      p.line(this.shot.x1, this.shot.y1, this.shot.x2, this.shot.y2);
      p.alpha = 1;
    }
  }

  tick(p, game) {
    if (!this.me) {
      this.advance(this.lastMovement.horizontal, this.lastMovement.vertical);
      return;
    }

    this.doMovement(p, game);

    p.mouseClicked = () => {
      if (this.hasShot) {
        const endCoords = this.checkWallCollisionBullet(p);

        const angle = Math.atan2(endCoords.y-this.y, endCoords.x-this.x)
        this.shot = {
          x1: this.x + Math.cos(angle) * PLAYER_RADIUS,
          y1: this.y + Math.sin(angle) * PLAYER_RADIUS, 
          x2: endCoords.x,
          y2: endCoords.y,
          alpha: 1
        }
      }
    }
  }

  doMovement(p, game) {
    const vertical = Number(p.keyIsDown(83) - p.keyIsDown(87));
    const horizontal = Number(p.keyIsDown(68) - p.keyIsDown(65));

    let initX = this.x;
    let initY = this.y;
    this.advance(horizontal, vertical);

    if (game.checkWallCollisionPlayer(
      this.x,
      this.y,
      PLAYER_RADIUS,
      window.innerWidth,
      window.innerHeight
    )) {
      this.x = initX;
      this.y = initY;
    }

    this.socket.emit("move", { x: this.x / blockWidth, y: this.y / blockHeight });
  }

  advance(horizontal, vertical) {
    if (vertical && !horizontal) {
      this.y += vertical * speed_v;
    } else if (horizontal && !vertical) {
      this.x += horizontal * speed_h;
    } else if (vertical && horizontal) {
      const adjustedSpeed_v = speed_v / Math.sqrt(2)
      const adjustedSpeed_h = speed_h / Math.sqrt(2)

      this.x += adjustedSpeed_h * horizontal;
      this.y += adjustedSpeed_v * vertical;
    }
  }

  getSocket() {
    return this.id;
  }
}
