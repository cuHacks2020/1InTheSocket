window.onload = function() {
  stoppedTyping();
};

function joinGame() {
  const username = document.getElementById("username").value;
  const colour = document.getElementById("colour").value;
  const data = `?user=${username}&colour=${colour}`;
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
