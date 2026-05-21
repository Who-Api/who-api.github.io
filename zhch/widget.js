(function() {
    const container = document.createElement('div');
    container.className = 'whois-container';
    container.style = "font-family: 'Khmer Sangam MN', -apple-system, sans-serif; max-width: 500px; padding: 25px; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05); margin: 20px auto; text-align: left;";

    container.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 6px; color: #000000; font-size: 18px; font-weight: 700; font-family: 'Khmer Sangam MN', sans-serif;">WhoApi Native WHOIS Tool</h3>
        <p style="margin: 0 0 15px 0; color: #475569; font-size: 13px; font-family: 'Khmer Sangam MN', sans-serif;">Unfiltered terminal registration data directly from Port 43 root servers.</p>
        <div style="display: flex; gap: 8px; margin-bottom: 15px;">
            <input type="text" id="whoisInput" placeholder="Enter domain (e.g., apple.com)" style="flex: 1; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; outline: none; box-sizing: border-box; color: #000000; font-family: 'Khmer Sangam MN', sans-serif;">
            <button id="whoisBtn" style="padding: 12px 24px; background: #000000; color: #ffffff; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.2s; font-family: 'Khmer Sangam MN', sans-serif;">Search</button>
        </div>
        <div id="whoisLoader" style="display: none; color: #000000; font-style: italic; font-size: 14px; margin-bottom: 10px; font-family: 'Khmer Sangam MN', sans-serif;">Opening dedicated socket loop connection...</div>
        <div id="whoisError" style="display: none; color: #ef4444; background: #fef2f2; padding: 12px; border-radius: 6px; font-size: 14px; margin-bottom: 10px; border: 1px solid #fee2e2; line-height: 1.4; font-family: 'Khmer Sangam MN', sans-serif;"></div>
        <pre id="whoisResult" style="display: none; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-size: 12px; color: #1e293b; max-height: 350px; overflow-y: auto; text-align: left; font-family: monospace;"></pre>
    `;

    const currentScript = document.currentScript;
    currentScript.parentNode.insertBefore(container, currentScript);

    const searchBtn = document.getElementById('whoisBtn');
    searchBtn.addEventListener('click', async () => {
        const input = document.getElementById('whoisInput').value;
        const loader = document.getElementById('whoisLoader');
        const errorBox = document.getElementById('whoisError');
        const resultPre = document.getElementById('whoisResult');
        
        loader.style.display = 'block';
        errorBox.style.display = 'none';
        resultPre.style.display = 'none';

        if (!input) {
            loader.style.display = 'none';
            errorBox.innerText = 'Please enter a valid domain name.';
            errorBox.style.display = 'block';
            return;
        }

        // REPLACE THE VARIABLE VALUE BELOW WITH YOUR COPIED LIVE RENDER SERVER WEB LINK
        const backendServerUrl = "https://whoapibackend.onrender.com";

        try {
            const fetchUrl = `${backendServerUrl.replace(/\/$/, '')}/api/whois?domain=${encodeURIComponent(input)}`;
            const response = await fetch(fetchUrl);
            const payload = await response.json();
            loader.style.display = 'none';

            if (!payload.success) {
                errorBox.innerText = payload.error || 'Server processing error.';
                errorBox.style.display = 'block';
                return;
            }

            // Renders the raw terminal string return output perfectly on screen
            resultPre.innerText = payload.rawText;
            resultPre.style.display = 'block';
        } catch (err) {
            loader.style.display = 'none';
            errorBox.innerText = 'Unable to communicate with your backend script engine.';
            errorBox.style.display = 'block';
        }
    });
})();
