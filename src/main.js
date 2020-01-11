import p5 from 'p5';
import Game from './Game';
import io from 'socket.io-client';

let socket = io('http://localhost');

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

const game = new Game();

let main = (p) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.background(40);
  };

  p.draw = () => {
    game.draw(p);
  };

  p.mousePressed = () => {
    console.log("mouse")
  };

  p.keyPressed = (keyCode) => {
    if(keyCode.key == "w") { // forward
      socket.emit("foward")
    }
    if(keyCode.key == "a") { // left
      socket.emit("left")
    }
    if(keyCode.key == "d") { // right
      socket.emit("right")
    }
    if(keyCode.key == "s") { // backward
      socket.emit("backward")
    }
  };
};



new p5(main);