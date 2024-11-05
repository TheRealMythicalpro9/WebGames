// public/js/player-list.js
const socket = io();

// Function to update the user list displayed on the page
function updateUserList(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Clear the list before updating
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
}

// Listen for the user list from the server
socket.on('userList', (users) => {
    updateUserList(users);
});

// Optionally, set the username when connecting if required
const params = new URLSearchParams(window.location.search);
const username = params.get('username');
if (username) {
    socket.emit('setUsername', username);
}
