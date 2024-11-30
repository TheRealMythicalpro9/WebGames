(function () {
    const originalConsoleLog = console.log;
    const consoleLogDiv = document.getElementById('console-log');
    
    // Redirect console.log to display in custom console
    console.log = function (...args) {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        consoleLogDiv.appendChild(logEntry);
        consoleLogDiv.scrollTop = consoleLogDiv.scrollHeight; // Scroll to bottom
        originalConsoleLog.apply(console, args);
    };
})();

// Update the iframe with HTML content
function updateOutput() {
    const html = document.getElementById('html').value;

    const iframe = document.getElementById('preview');
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();
    doc.write(html);
    doc.close();
}

// Execute commands entered into the console
function executeConsoleInput() {
    const input = document.getElementById('console-input').value;
    try {
        const iframe = document.getElementById('preview');
        const iframeWindow = iframe.contentWindow;
        const result = iframeWindow.eval(input); // Execute inside the iframe
        console.log(result); // Log the result to the console
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    document.getElementById('console-input').value = ''; // Clear input
}

// Automatically run the code whenever the textarea content changes
document.getElementById('html').addEventListener('input', updateOutput);
