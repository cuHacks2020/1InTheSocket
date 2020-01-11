//<script src="/socket.io/socket.io.js"></script>

import p5 from 'p5';
import Game from './Game';
import io from 'socket.io-client';

let x = 100;
let y = 100;
let charSpeed = 5;

//let socket = io('http://localhost');

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');


const game = new Game();

let main = (p) => {
  p.setup = () => {
    // game = new Game(window.innerWidth, window.innerHeight);
    const cur_speed = 20;

    p.createCanvas(window.innerWidth, window.innerHeight);
    p.background(40);
  };

  p.draw = () => {
    game.draw(p);
  };

  p.mousePressed = () => {
    console.log("mouse")
  };
};



new p5(main);