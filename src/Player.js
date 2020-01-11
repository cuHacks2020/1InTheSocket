


export default class Player {

  constructor() {
    this.x = 100;
    this.y = 100;
    this.speed = 5;
  }

  draw(p) {
    if(p.keyIsDown(87)) {
      this.y -= this.speed;
    }
    if(p.keyIsDown(83)) {
      this.y += this.speed;
    }
    if(p.keyIsDown(65)) {
      this.x -= this.speed;
    }
    if(p.keyIsDown(68)) {
      this.x += this.speed;
    }
    p.background(40);
    p.ellipse(this.x, this.y, 50);
  }
}