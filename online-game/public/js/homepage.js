// public/js/homepage.js
function goToPage(page) {
    let username = prompt("Enter your username (3-20 characters):");
    while (!username || username.trim() === "" || username.length < 3 || username.length > 20) {
        username = prompt("Enter a valid username (3-20 characters):");
    }
    window.location.href = `/${page}?username=${encodeURIComponent(username)}`;
}
