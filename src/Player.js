const blockHeight = window.innerHeight / 9;
const blockWidth = window.innerWidth / 16;
const SPEED = 0.07;
const speed_v = SPEED * blockHeight;
const speed_h = SPEED * blockWidth;
const PLAYER_RADIUS = window.innerWidth / 100;

export default class Player {
  constructor(socket = null, socketId = null, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.socket = socket;
    this.me = !socketId;
    this.id = socketId || socket.id;
    this.lastMovement = { horizontal: 0, vertical: 0 };
    this.shot = { x1: 0, x2: 100, y1: 0, y2: 100, alpha: 0 };
    this.hasShot = true;

    // Checks if there is wall between two set of points
    // Player position and given x y
    this.checkWallCollisionBullet = p => {
      if (!this.me) return;

      let currentX = this.x;
      let currentY = this.y;

      let angleDegrees = Math.atan2(
        p.mouseY - window.innerHeight / 2,
        p.mouseX - window.innerWidth / 2
      );
      while (
        currentX > 0 &&
        currentX < window.innerWidth &&
        currentY > 0 &&
        currentY < window.innerHeight
      ) {
        currentX += Math.cos(angleDegrees);
        currentY += Math.sin(angleDegrees);

        if (currentX > window.innerWidth || currentX < 0) {
          break;
        }

        if (
          this.iMap[Math.floor(currentX / (window.innerWidth / 16))][
            Math.floor(currentY / (window.innerHeight / 9))
          ] === 1
        ) {
          break;
        }

        for (const [id, player] of Object.entries(this.allPlayers)) {
          if (player.me || player.dead) {
            continue;
          }

          if (
            !player.me &&
            Math.sqrt((player.x - currentX) ** 2 + (player.y - currentY) ** 2) <
              PLAYER_RADIUS
          ) {
            this.socket.emit("kill", id);
            return { x: currentX, y: currentY };
          }
        }
      }
      return { x: currentX, y: currentY };
    };
  }

  draw(p, game, pg) {
    this.tick(p, game);
    const shotColour = this.me ? "rgba(0,0,255," : "rgba(255,0,0,";
    if (!this.me) {
      pg.stroke("red");
      pg.fill([255, 0, 0, 50]);
    } else {
      pg.stroke("blue");
      pg.fill([0, 0, 255, 50]);
    }

    pg.strokeWeight(2);
    pg.ellipse(this.x, this.y, PLAYER_RADIUS * 2);

    pg.strokeWeight(5);

    pg.stroke(`${shotColour}${this.shot.alpha})`);
    if (this.shot.alpha > 0.02) {
      this.shot.alpha -= 0.02;
    }
    pg.line(this.shot.x1, this.shot.y1, this.shot.x2, this.shot.y2);
    pg.alpha = 1;
  }

  tick(p, game) {
    this.doMovement(p, game);
    if (!p.mouseClicked && this.me) {
      p.mouseClicked = () => {
        if (this.hasShot && !this.dead && this.me) {
          const endCoords = this.checkWallCollisionBullet(p);
          console.log(endCoords);
          const angle = Math.atan2(endCoords.y - this.y, endCoords.x - this.x);
          this.shot = {
            x1: this.x + Math.cos(angle) * PLAYER_RADIUS,
            y1: this.y + Math.sin(angle) * PLAYER_RADIUS,
            x2: endCoords.x,
            y2: endCoords.y,
            alpha: 1
          };

          this.socket.emit("fire", {
            shot: this.shot,
            oldWidth: window.innerWidth,
            oldHeight: window.innerHeight
          });
        }
      };
    }
  }

  doMovement(p, game) {
    let vertical = Number(p.keyIsDown(83) - p.keyIsDown(87));
    let horizontal = Number(p.keyIsDown(68) - p.keyIsDown(65));
    if (!this.me) {
      vertical = this.lastMovement.vertical;
      horizontal = this.lastMovement.horizontal;
    }

    let initX = this.x;
    let initY = this.y;
    this.advance(horizontal, vertical, p.deltaTime);

    if (
      game.checkWallCollisionPlayer(
        this.x,
        this.y,
        PLAYER_RADIUS,
        window.innerWidth,
        window.innerHeight
      )
    ) {
      this.x = initX;
      this.y = initY;
    }

    if (this.me) {
      this.socket.emit("move", {
        x: this.x / blockWidth,
        y: this.y / blockHeight
      });
    }
  }

  advance(horizontal, vertical, dt) {
    const delta = dt / 20;

    if (vertical && !horizontal) {
      this.y += vertical * speed_v * delta;
    } else if (horizontal && !vertical) {
      this.x += horizontal * speed_h * delta;
    } else if (vertical && horizontal) {
      const adjustedSpeed_v = speed_v / Math.sqrt(2);
      const adjustedSpeed_h = speed_h / Math.sqrt(2);

      this.x += adjustedSpeed_h * horizontal * delta;
      this.y += adjustedSpeed_v * vertical * delta;
    }
  }

  getSocket() {
    return this.id;
  }
}
