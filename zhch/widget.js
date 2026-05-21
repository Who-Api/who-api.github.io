(function() {
    const container = document.createElement('div');
    container.className = 'whois-container';
    container.style = "font-family: 'Khmer Sangam MN', -apple-system, sans-serif; max-width: 500px; padding: 25px; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05); margin: 20px auto; text-align: left;";

    container.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 6px; color: #000000; font-size: 18px; font-weight: 700; font-family: 'Khmer Sangam MN', sans-serif;">WhoApi 原生 WHOIS 工具</h3>
        <p style="margin: 0 0 15px 0; color: #475569; font-size: 13px; font-family: 'Khmer Sangam MN', sans-serif;">直接从端口 43 根服务器获取未经过滤的终端注册数据。</p>
        <div style="display: flex; gap: 8px; margin-bottom: 15px;">
            <input type="text" id="whoisInput" placeholder="输入域名 (例如: apple.com)" style="flex: 1; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; outline: none; box-sizing: border-box; color: #000000; font-family: 'Khmer Sangam MN', sans-serif;">
            <button id="whoisBtn" style="padding: 12px 24px; background: #000000; color: #ffffff; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.2s; font-family: 'Khmer Sangam MN', sans-serif;">查询</button>
        </div>
        <div id="whoisLoader" style="display: none; color: #000000; font-style: italic; font-size: 14px; margin-bottom: 10px; font-family: 'Khmer Sangam MN', sans-serif;">正在打开专用套接字循环连接...</div>
        <div id="whoisError" style="display: none; color: #ef4444; background: #fef2f2; padding: 12px; border-radius: 6px; font-size: 14px; margin-bottom: 10px; border: 1px solid #fee2e2; line-height: 1.4; font-family: 'Khmer Sangam MN', sans-serif;"></div>
        <pre id="whoisResult" style="display: none; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-size: 12px; color: #1e293b; max-height: 350px; overflow-y: auto; text-align: left; font-family: monospace;"></pre>
    `;

    const currentScript = document.currentScript;
    currentScript.parentNode.insertBefore(container, currentScript);

    // Translation mapping for common WHOIS fields
    const chineseTranslations = {
        'Domain Name': '域名',
        'Registry Domain ID': '域名注册ID',
        'Registrar WHOIS Server': '注册商WHOIS服务器',
        'Registrar URL': '注册商URL',
        'Updated Date': '更新日期',
        'Creation Date': '创建日期',
        'Expiry Date': '过期日期',
        'Expiration Date': '过期日期',
        'Registrar': '注册商',
        'Registrar IANA ID': '注册商IANA ID',
        'Registrar Abuse Contact Email': '注册商滥用邮箱',
        'Registrar Abuse Contact Phone': '注册商滥用电话',
        'Registry Admin ID': '管理员ID',
        'Admin Name': '管理员名称',
        'Admin Organization': '管理员组织',
        'Admin Street': '管理员地址',
        'Admin City': '管理员城市',
        'Admin State/Province': '管理员省份',
        'Admin Postal Code': '管理员邮编',
        'Admin Country': '管理员国家',
        'Admin Phone': '管理员电话',
        'Admin Phone Ext': '管理员电话分机',
        'Admin Fax': '管理员传真',
        'Admin Email': '管理员邮箱',
        'Registry Tech ID': '技术ID',
        'Tech Name': '技术名称',
        'Tech Organization': '技术组织',
        'Tech Street': '技术地址',
        'Tech City': '技术城市',
        'Tech State/Province': '技术省份',
        'Tech Postal Code': '技术邮编',
        'Tech Country': '技术国家',
        'Tech Phone': '技术电话',
        'Tech Phone Ext': '技术电话分机',
        'Tech Fax': '技术传真',
        'Tech Email': '技术邮箱',
        'Registry Registrant ID': '注册人ID',
        'Registrant Name': '注册人名称',
        'Registrant Organization': '注册人组织',
        'Registrant Street': '注册人地址',
        'Registrant City': '注册人城市',
        'Registrant State/Province': '注册人省份',
        'Registrant Postal Code': '注册人邮编',
        'Registrant Country': '注册人国家',
        'Registrant Phone': '注册人电话',
        'Registrant Phone Ext': '注册人电话分机',
        'Registrant Fax': '注册人传真',
        'Registrant Email': '注册人邮箱',
        'Name Server': '名称服务器',
        'DNSSEC': '防护模式',
        'DNSSEC DS Data': '防护数据',
        'URL of the ICANN Whois Inaccuracy Complaint Form': 'ICANN投诉表单',
        'Status': '状态'
    };

    function translateWhoisText(rawText) {
        let translated = rawText;
        
        // Replace English field names with Chinese
        for (const [english, chinese] of Object.entries(chineseTranslations)) {
            const regex = new RegExp(`^${english}:`, 'gm');
            translated = translated.replace(regex, `${chinese}:`);
        }
        
        return translated;
    }

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
            errorBox.innerText = '请输入有效的域名。';
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
                errorBox.innerText = payload.error || '服务器处理错误。';
                errorBox.style.display = 'block';
                return;
            }

            // Renders the raw terminal string return output perfectly on screen with Chinese translations
            const translatedText = translateWhoisText(payload.rawText);
            resultPre.innerText = translatedText;
            resultPre.style.display = 'block';
        } catch (err) {
            loader.style.display = 'none';
            errorBox.innerText = '无法与后端脚本引擎通信。';
            errorBox.style.display = 'block';
        }
    });
})();