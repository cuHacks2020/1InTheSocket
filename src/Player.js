


export default class Player {

  constructor() {
    this.x = this.y = 100;
    this.charSpeed = 5;
    // this.bullet = false;
    this.bulletX1 = this.bulletX2 = this.bulletY1 = this.bulletY2 = 0;
    this.bulletAlpha = 1;
    this.isShooting = false;
    this.bullets = 5;
  }

  shoot(p) {
    this.bulletX1 = p.mouseX;
    this.bulletY1 = p.mouseY;
    this.bulletX2 = this.x;
    this.bulletY2 = this.y;
    this.bullets = (this.bullets > 0) ? this.bullets - 1 : this.bullets;
    this.isShooting = this.bullets > 0;
    // console.log(this.bullets);
    // this.bullet = true;
    // this.bullets = 1;

  }

  draw(p) {

    if (p.keyIsDown(87)) {
      this.y -= this.charSpeed;
    }
    if (p.keyIsDown(83)) {
      this.y += this.charSpeed;
    }
    if (p.keyIsDown(65)) {
      this.x -= this.charSpeed;;
    }
    if (p.keyIsDown(68)) {
      this.x += this.charSpeed;;
    }
    p.background(40);
    p.stroke(p.color(0, 0, 0));
    p.ellipse(this.x, this.y, 50);
    p.fill(p.color(255, 0, 0));
    p.strokeWeight(4);
    //p.line(p.mouseX, p.mouseY, this.x, this.y);

    //fade aiming line
    // if (this.bullets > 0 || this.isShooting) {
    if (this.isShooting) {
      console.log(this.bullets);

      if (this.bulletAlpha > 0) {
        this.bulletAlpha -= 0.02;
      }
      if (this.bulletAlpha < 0) {
        this.bulletAlpha = 0.001;
        this.bullets -= 1;
        this.isShooting = false;
        // this.bulletAlpha = 1;
      }
      p.stroke('rgba(0,0,0,' + this.bulletAlpha + ')');
      p.line(this.bulletX1, this.bulletY1, this.bulletX2, this.bulletY2);

    }
    else {
      this.bulletAlpha = 1;
    }

  }
}