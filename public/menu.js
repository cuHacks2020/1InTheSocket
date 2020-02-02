let curColour = {r: 255, g: 255, b:255};

window.onload = function() {
  stoppedTyping();

  const opts = ['#ff0000', '#00ff00', '#0000ff'];

  var colorWheel = iro.ColorPicker("#colorWheelDemo", {
    sliderHeight: undefined,
    color: opts[Math.floor(Math.random() * 3)],
  });

  colorWheel.on('color:change', (color) => {
    curColour = iro.Color.hsvToRgb(color._value)
    updateColor();
  });

  colorWheel.on('color:init', (color) => {
    curColour = iro.Color.hsvToRgb(color._value)
    updateColor();
  });

  updateColor();

  function updateColor(){
    const {r,g,b} = curColour;
    const rgb = `rgb(${r},${g},${b})`;

    document.querySelector('#username').style.borderBottomColor = rgb;

  }
};

function joinGame() {
  const username = document.getElementById("username").value;
  const {r,g,b} = curColour;
  const data = `?user=${username}&r=${r.toFixed(2)}&g=${g.toFixed(2)}&b=${b.toFixed(2)}`;
  window.location.href = window.location.href + "play" + data;
}

function stoppedTyping() {
  const username = document.getElementById("username").value;
  const joinButton = document.getElementById("joinButton");
  if (username === "" || username.length > 20) {
    joinButton.disabled = true;
    joinButton.classList.add("notransition");
    joinButton.classList.remove("animate");
  } else {
    joinButton.disabled = false;
    joinButton.classList.add("animate");
    joinButton.classList.remove("notransition");
  }
}
