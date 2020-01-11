import p5 from 'p5';

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');
 
 
let main = (p) => {
  p.setup = () =>{
    // game = new Game(window.innerWidth, window.innerHeight);
    const cur_speed = 20;

    p.createCanvas(window.innerWidth,window.innerHeight);
    p.background(40);
  };

  p.mousePressed = () => {
    console.log("mouse")
  };
};

new p5(main);