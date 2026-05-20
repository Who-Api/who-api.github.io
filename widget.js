(function() {
    // 1. Create the main widget container element
    const container = document.createElement('div');
    container.className = 'whois-container';
    container.style = "font-family: 'Khmer Sangam MN', -apple-system, sans-serif; max-width: 500px; padding: 25px; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05); margin: 20px auto; text-align: left;";

    // 2. Inject the modern input search bar and results layout
    container.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 6px; color: #000000; font-size: 18px; font-weight: 700; font-family: 'Khmer Sangam MN', sans-serif;">WhoApi Limitless Free WHOIS API</h3>
        <p style="margin: 0 0 15px 0; color: #475569; font-size: 13px; font-family: 'Khmer Sangam MN', sans-serif;">Real-time registry lookups powered directly by client-side browser endpoints.</p>
        <div style="display: flex; gap: 8px; margin-bottom: 15px;">
            <input type="text" id="whoisInput" placeholder="Enter domain (e.g., google.com)" style="flex: 1; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; outline: none; box-sizing: border-box; color: #000000; font-family: 'Khmer Sangam MN', sans-serif;">
            <button id="whoisBtn" style="padding: 12px 24px; background: #000000; color: #ffffff; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.2s; font-family: 'Khmer Sangam MN', sans-serif;">Search</button>
        </div>
        <div id="whoisLoader" style="display: none; color: #000000; font-style: italic; font-size: 14px; margin-bottom: 10px; font-family: 'Khmer Sangam MN', sans-serif;">Querying official database...</div>
        <div id="whoisError" style="display: none; color: #ef4444; background: #fef2f2; padding: 12px; border-radius: 6px; font-size: 14px; margin-bottom: 10px; border: 1px solid #fee2e2; line-height: 1.4; font-family: 'Khmer Sangam MN', sans-serif;"></div>
        <div id="whoisCard" style="display: none; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #000000;">
            <h4 id="outDomain" style="margin: 0 0 12px 0; text-transform: uppercase; color: #000000; font-size: 15px; letter-spacing: 0.5px; font-weight: 700; font-family: 'Khmer Sangam MN', sans-serif;"></h4>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #000000; font-family: 'Khmer Sangam MN', sans-serif;">
                <p style="margin: 0;"><strong>Registrar:</strong> <span id="outRegistrar" style="color: #000000;"></span></p>
                <p style="margin: 0;"><strong>Created On:</strong> <span id="outCreated" style="color: #000000;"></span></p>
                <p style="margin: 0;"><strong>Expires On:</strong> <span id="outExpires" style="color: #000000;"></span></p>
                <p style="margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong>Nameservers:</strong> <span id="outNS" style="color: #000000; font-size: 13px;"></span></p>
            </div>
        </div>
    `;

    // Automatically inject the interface into the webpage right where the script is loaded
    const currentScript = document.currentScript;
    currentScript.parentNode.insertBefore(container, currentScript);

    // Add button hover styling natively
    const searchBtn = document.getElementById('whoisBtn');
    searchBtn.addEventListener('mouseover', () => searchBtn.style.background = '#1e293b');
    searchBtn.addEventListener('mouseout', () => searchBtn.style.background = '#000000');

    // 3. Connect the core API query logic
    searchBtn.addEventListener('click', async () => {
        const input = document.getElementById('whoisInput').value;
        const loader = document.getElementById('whoisLoader');
        const errorBox = document.getElementById('whoisError');
        const card = document.getElementById('whoisCard');
        
        loader.style.display = 'block';
        errorBox.style.display = 'none';
        card.style.display = 'none';

        if (!input) {
            loader.style.display = 'none';
            errorBox.innerText = 'Please enter a valid domain name.';
            errorBox.style.display = 'block';
            return;
        }

        const cleanDomain = input.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();
        const targetUrl = `https://rdap.org{cleanDomain}`;
        const proxyUrl = `https://corsproxy.io{encodeURIComponent(targetUrl)}`;

        try {
            const response = await fetch(proxyUrl);
            
            if (response.status === 404) {
                loader.style.display = 'none';
                errorBox.innerText = `🎉 "${cleanDomain}" is unregistered and available!`;
                errorBox.style.color = '#15803d';
                errorBox.style.background = '#f0fdf4';
                errorBox.style.borderColor = '#bbf7d0';
                errorBox.style.display = 'block';
                return;
            }

            if (!response.ok) throw new Error('Registry response error');

            const data = await response.json();
            const events = data.events || [];
            const createdEvent = events.find(e => e.eventAction === 'registration');
            const expiryEvent = events.find(e => e.eventAction === 'expiration');

            const entities = data.entities || [];
            const registrarEntity = entities.find(e => e.roles && e.roles.includes('registrar'));
            
            let registrarName = 'Unknown / Protected';
            if (registrarEntity && registrarEntity.vcardArray) {
                const fnRow = registrarEntity.vcardArray.find(prop => prop === 'fn');
                if (fnRow) {
                    registrarName = Array.isArray(fnRow) ? fnRow : fnRow;
                }
            }

            document.getElementById('outDomain').innerText = cleanDomain;
            document.getElementById('outRegistrar').innerText = registrarName;
            document.getElementById('outCreated').innerText = createdEvent ? new Date(createdEvent.eventDate).toLocaleDateString() : 'N/A';
            document.getElementById('outExpires').innerText = expiryEvent ? new Date(expiryEvent.eventDate).toLocaleDateString() : 'N/A';
            document.getElementById('outNS').innerText = data.nameservers ? data.nameservers.map(ns => ns.ldhName).join(', ') : 'None';
            
            loader.style.display = 'none';
            card.style.display = 'block';
        } catch (err) {
            loader.style.display = 'none';
            errorBox.style.color = '#ef4444';
            errorBox.style.background = '#fef2f2';
            errorBox.style.borderColor = '#fee2e2';
            errorBox.innerText = 'Unable to pull database records. This domain extension may not be supported yet or the registry is temporarily down.';
            errorBox.style.display = 'block';
        }
    });
})();
