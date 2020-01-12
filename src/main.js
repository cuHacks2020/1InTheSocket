//<script src="/socket.io/socket.io.js"></script>

import p5 from "p5";
import Game from "./Game";
import io from "socket.io-client";

//let socket = io('http://localhost');

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log(
  "if you have sourcemaps enabled in your devtools, click on main.js:5 -->"
);

async function main() {
  const game = new Game();
  await game.init();
  game.width = window.innerWidth;
  game.height = window.innerHeight;

  let main = p => {
    p.setup = () => {
      p.noCursor();
      p.createCanvas(window.innerWidth, window.innerHeight);
      p.background(40);
    };

    p.draw = () => {
      game.draw(p, window.innerWidth, window.innerHeight);
    };
  };

  new p5(main);
}

main();
