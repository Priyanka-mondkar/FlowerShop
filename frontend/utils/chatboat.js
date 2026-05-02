(function () {

    const occasionMap = {
        1: "Birthday 🎂",
        2: "Anniversary 💍",
        3: "Festival 🪔",
        4: "Surprise 🎁"
    };

    const preferenceMap = [
        { name: "Roses 🌹", keyword: "rose" },
        { name: "Mixed 💐", keyword: "mixed" },
        { name: "Luxury 🌸", keyword: "orchid" },
        { name: "Simple 🌼", keyword: "marigold" }
    ];

    let selectedOccasionId = null;
    let selectedPreference = null;
    let selectedBudget = null;

    function addBotMessage(text, isHtml = false) {
        const msg = document.createElement('div');
        msg.className = 'bot-message';
        msg.innerHTML = isHtml ? text : text;
        document.getElementById('chatMessages').appendChild(msg);
        scroll();
    }

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'user-message';
        msg.innerText = text;
        document.getElementById('chatMessages').appendChild(msg);
        scroll();
    }

    function scroll() {
        const c = document.getElementById('chatMessages');
        c.scrollTop = c.scrollHeight;
    }

    function clearOptions() {
        document.getElementById('chatOptions').innerHTML = '';
    }

    // 🌸 STEP 1 - OCCASION
    function showOccasionOptions() {
        clearOptions();

        Object.entries(occasionMap).forEach(([id, name]) => {
            const btn = document.createElement('button');
            btn.innerText = name;
            btn.className = 'choice-btn';

            btn.onclick = () => {
                addUserMessage(name);
                selectedOccasionId = id;
                addBotMessage("💐 What type do you like?");
                showPreferenceOptions();
            };

            document.getElementById('chatOptions').appendChild(btn);
        });
    }

    // 💕 STEP 2 - PREFERENCE
    function showPreferenceOptions() {
        clearOptions();

        preferenceMap.forEach(p => {
            const btn = document.createElement('button');
            btn.innerText = p.name;
            btn.className = 'choice-btn';

            btn.onclick = () => {
                addUserMessage(p.name);
                selectedPreference = p.keyword;
                addBotMessage("💰 What's your budget?");
                showBudgetOptions();
            };

            document.getElementById('chatOptions').appendChild(btn);
        });
    }

    // 💰 STEP 3 - BUDGET
    function showBudgetOptions() {
        clearOptions();

        const budgets = [
            { label: "Under ₹100", max: 100 },
            { label: "₹100 - ₹200", min: 100, max: 200 },
            { label: "₹200 - ₹400", min: 200, max: 400 },
            { label: "₹400+", min: 400, max: 999999 }
        ];

        budgets.forEach(b => {
            const btn = document.createElement('button');
            btn.innerText = b.label;
            btn.className = 'choice-btn';

            btn.onclick = () => {
                addUserMessage(b.label);
                selectedBudget = b;
                suggestFlowers();
            };

            document.getElementById('chatOptions').appendChild(btn);
        });
    }

    // 🌼 RESULT (Backend + Filter)
    async function suggestFlowers() {

        let url = `http://localhost:5000/api/flowers/chatbot?occasion_id=${selectedOccasionId}`;

        if (selectedBudget.min !== undefined) {
            url += `&min=${selectedBudget.min}&max=${selectedBudget.max}`;
        }

        try {
            const res = await fetch(url);

            if (!res.ok) {
                addBotMessage("⚠️ Server error");
                return;
            }

            let data = await res.json();

            // 🔥 FILTER BY PREFERENCE (frontend side)
            if (selectedPreference) {
                data = data.filter(f =>
                    f.name.toLowerCase().includes(selectedPreference)
                );
            }

            if (!Array.isArray(data) || data.length === 0) {
                addBotMessage(`
😔 No flowers found for your selection.

👉 Try this:
• Change budget 💰
• Choose different type 🌸
• Or restart 🔄

<div style="margin-top:10px;">
    <button class="choice-btn" id="changeBudget">💰 Change Budget</button>
    <button class="choice-btn" id="changeType">🌸 Change Type</button>
    <button class="choice-btn restart-btn" id="restartBtn">🔄 Restart</button>
</div>
`, true);

                setTimeout(() => {

                    document.getElementById("changeBudget").onclick = () => {
                        addBotMessage("💰 Select different budget:");
                        showBudgetOptions();
                    };

                    document.getElementById("changeType").onclick = () => {
                        addBotMessage("🌸 Select different type:");
                        showPreferenceOptions();
                    };

                    document.getElementById("restartBtn").onclick = resetChat;

                }, 50);

                return;
            }

            let html = `<div><strong>✨ Perfect picks for you:</strong></div>`;

            data.forEach(f => {
                html += `
                <div class="flower-suggestion">
                    <div class="flower-item">
                        <img src="${f.image || 'https://via.placeholder.com/55'}">
                        <div class="flower-info">
                            <div class="flower-name">${f.name}</div>
                            <div class="flower-price">₹${f.price}</div>
                        </div>
                    </div>
                </div>`;
            });

            html += `<button class="choice-btn restart-btn" id="restartBtn">🔄 Start Again</button>`;

            addBotMessage(html, true);

            setTimeout(() => {
                document.getElementById("restartBtn").onclick = resetChat;
            }, 50);

            clearOptions();

        } catch (err) {
            console.log(err);
            addBotMessage("⚠️ Connection error");
        }
    }

    function resetChat() {
        selectedOccasionId = null;
        selectedPreference = null;
        selectedBudget = null;

        document.getElementById('chatMessages').innerHTML = '';
        document.getElementById('chatOptions').innerHTML = '';

        addBotMessage("🌸 Hi! 😊 What are you looking for?");
        showOccasionOptions();
    }

    function buildChatWindow() {

        document.getElementById('chatbotRoot').innerHTML = `
        <div class="chat-window hidden" id="chatWindow">
            <div class="chat-header">
                <span>🌸 Flower Assistant</span>
                <i class="fa-solid fa-xmark" id="closeChat"></i>
            </div>

            <div class="chat-messages" id="chatMessages"></div>

            <div id="chatOptions" style="padding:10px;"></div>
        </div>

        <div class="chatbot-icon" id="chatbotIcon">💬</div>
        `;

        const chatWindow = document.getElementById('chatWindow');
        const icon = document.getElementById('chatbotIcon');

        icon.onclick = () => {
            chatWindow.classList.remove('hidden');
            icon.style.display = 'none';

            if (!document.getElementById('chatMessages').children.length) {
                resetChat();
            }
        };

        document.getElementById('closeChat').onclick = () => {
            chatWindow.classList.add('hidden');
            icon.style.display = 'flex';
        };
    }

    buildChatWindow();

})();