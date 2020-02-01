//<script src="/socket.io/socket.io.js"></script>

import p5 from "p5";
import Game from "./Game";

async function main() {
  const game = new Game();
  await game.init();

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
