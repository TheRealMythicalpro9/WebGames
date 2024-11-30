// Redirect console.log to the custom console
(function () {
    const originalConsoleLog = console.log;
    const consoleLogDiv = document.getElementById('console-log');
    
    console.log = function (...args) {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logEntry.style.color = '#00ff00'; // Log messages in green
        consoleLogDiv.appendChild(logEntry);
        consoleLogDiv.scrollTop = consoleLogDiv.scrollHeight;
        originalConsoleLog.apply(console, args);
    };

    console.error = function (...args) {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logEntry.style.color = '#ff0000'; // Error messages in red
        consoleLogDiv.appendChild(logEntry);
        consoleLogDiv.scrollTop = consoleLogDiv.scrollHeight;
        originalConsoleLog.apply(console, args);
    };
})();

// Update iframe output
function updateOutput() {
    const html = document.getElementById('html').value;
    const css = `<style>${document.getElementById('css').value}</style>`;
    const js = `<script>${document.getElementById('js').value}<\/script>`;

    const iframe = document.getElementById('preview');
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();
    doc.write(html + css + js);
    doc.close();
}

// Execute commands in console
function executeConsoleInput() {
    const input = document.getElementById('console-input').value;
    try {
        const result = eval(input);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
    document.getElementById('console-input').value = '';
}
