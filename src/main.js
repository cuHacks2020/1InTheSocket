//<script src="/socket.io/socket.io.js"></script>

import p5 from "p5";
import Game from "./Game";

async function main() {
  const game = new Game();
  await game.init();

  let main = p => {
    let mapCanvas;

    p.setup = () => {
      // p.noCursor();
      p.createCanvas(window.innerWidth, window.innerHeight);
      mapCanvas = p.createGraphics(window.innerWidth, window.innerHeight);
    };

    p.draw = () => {
      game.draw(p, window.innerWidth, window.innerHeight, mapCanvas);
    };
  };

  new p5(main);
}

if (window.location.pathname.includes('play')) {
  main();
}
