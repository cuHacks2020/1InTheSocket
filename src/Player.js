


export default class Player {

  constructor() {
    this.x = 100;
    this.y = 100;
    this.charSpeed = 5;
  }

  draw(p) {
    if(p.keyIsDown(87)) {
      console.log("forward")
      this.y -= this.charSpeed;
    }
    if(p.keyIsDown(83)) {
      console.log("backward")
      this.y += this.charSpeed;
    }
    if(p.keyIsDown(65)) {
      console.log("left")
      this.x -= this.charSpeed;;
    }
    if(p.keyIsDown(68)) {
      console.log("right")
      this.x += this.charSpeed;;
    }
    p.createCanvas(window.innerWidth,window.innerHeight);
    p.background(40);
    p.ellipse(this.x, this.y, 50);
  }
}