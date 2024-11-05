// public/js/chat.js
const socket = io();

// Get the username from the URL query string
const params = new URLSearchParams(window.location.search);
let username = params.get('username');

if (!username) {
    username = prompt("Enter your username (3-20 characters):");
}

socket.emit('setUsername', username);

// Handle sending a new chat message
function sendMessage() {
  const message = document.getElementById("textbox").value.trim();
  if (message) {
    const chatMessage = { user: username, text: message, time: new Date().toLocaleTimeString().slice(0, -3) };
    socket.emit('chatMessage', chatMessage); // Send message to server
    document.getElementById("textbox").value = ""; // Clear input box
  }
}

// Listen for incoming chat messages from the server
socket.on('chatMessage', (data) => {
  const chatDiv = document.getElementById("chat");
  const messageHTML = `<div class='chatmessage' style='font-size:20px;'>
                         <b>[${data.user}]: </b> ${data.text}
                         <span style='color:grey;'> [${data.time}]</span>
                       </div>`;
  chatDiv.innerHTML = messageHTML + chatDiv.innerHTML;
});
