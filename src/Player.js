const blockHeight = window.innerHeight / 9;
const blockWidth = window.innerWidth / 16;
const SPEED = 0.07;
const speed_v = SPEED * blockHeight;
const speed_h = SPEED * blockWidth;
const PLAYER_RADIUS = window.innerWidth / 100;

export default class Player {
  constructor(socket = null, socketId = null, x = 0, y = 0, username = "") {
    this.x = x;
    this.y = y;
    this.socket = socket;
    this.me = !socketId;
    this.id = socketId || socket.id;
    this.lastMovement = { horizontal: 0, vertical: 0 };
    this.shot = { x1: 0, x2: 100, y1: 0, y2: 100, alpha: 0 };
    this.hasShot = true;
    this.gotKill = { r: PLAYER_RADIUS, alpha: 0};
    const urlParams = new URLSearchParams(window.location.search);
    this.username = urlParams.get("user");
    this.colour = {r: parseInt(urlParams.get("r")), g: parseInt(urlParams.get("g")), b: parseInt(urlParams.get("b"))};

    if (socket) {
      socket.emit("join", { username: this.username, colour: this.colour });
    }

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
            this.gotKill.alpha = 1;
            return { x: currentX, y: currentY };
          }
        }
      }
      return { x: currentX, y: currentY };
    };
  }

  draw(p, game, pg) {
    this.tick(p, game);

    pg.stroke(this.colour.r, this.colour.g, this.colour.b);
    pg.fill([this.colour.r, this.colour.g, this.colour.b, 50]);

    pg.strokeWeight(2);
    pg.ellipse(this.x, this.y, PLAYER_RADIUS * 2);

    pg.strokeWeight(5);
    pg.stroke(
      `rgba(${this.colour.r}, ${this.colour.g}, ${this.colour.b}, ${this.shot.alpha})`
    );
    if (this.shot.alpha > 0.02) {
      this.shot.alpha -= 0.02;
    } else {
      this.shot.alpha = 0;
    }
    pg.line(this.shot.x1, this.shot.y1, this.shot.x2, this.shot.y2);

    if (this.gotKill.alpha > p.deltaTime / 150) {
      this.gotKill.alpha -= p.deltaTime / 150;

      this.gotKill.r += 15; 
      console.log(this.gotKill.r + " " + this.gotKill.alpha);
      pg.stroke(
        `rgba(${this.colour.r}, ${this.colour.g}, ${this.colour.b}, ${this.gotKill.alpha})`
      );
      pg.strokeWeight(0);
      pg.ellipse(this.x, this.y, this.gotKill.r*2);
    } else {
      this.gotKill.alpha = 0;
    }
    pg.alpha = 1;
  }

  tick(p, game) {
    this.doMovement(p, game);
    if (!p.mouseClicked && this.me) {
      p.mouseClicked = () => {
        if (this.hasShot && !this.dead && this.me) {
          const endCoords = this.checkWallCollisionBullet(p);
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
        y: this.y / blockHeight,
        dx: horizontal,
        dy: vertical,
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
