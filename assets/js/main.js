let cart = [];
const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;

function toggleCart(e) {
    if (e) e.preventDefault();
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
}

function addToCart(title, price, image) {
    cart.push({ title, price, image });
    updateCartUI();
    toggleCart(); // Automatically open drawer
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const container = document.getElementById('cart-items');

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-brand-black font-bold text-center mt-10 text-xl font-display uppercase">Seu carrinho está vazio.</p>';
        document.getElementById('cart-total').innerText = 'R$ 0,00';
        return;
    }

    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="flex gap-4 items-center border-[3px] border-brand-black p-3 bg-brand-white relative group shadow-[4px_4px_0px_#fcc30b]">
                <div class="w-20 h-24 bg-brand-white border-[3px] border-brand-black flex items-center justify-center p-2">
                    <img src="${item.image}" class="w-full h-full object-contain">
                </div>
                <div class="flex-1 pr-6">
                    <h4 class="font-display font-black uppercase text-xl leading-tight text-brand-black">${item.title}</h4>
                    <p class="font-black text-brand-red mt-1 text-lg drop-shadow-[1px_1px_0px_#000000]">${formatPrice(item.price)}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="absolute top-2 right-2 text-brand-black hover:text-brand-red font-black text-xl transition-transform hover:scale-125">✕</button>
            </div>
        `;
    });
    document.getElementById('cart-total').innerText = formatPrice(total);
}

function openProduct(e, title, image, price, desc) {
    if (e) e.preventDefault();
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('product-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('pv-image').src = image;
    document.getElementById('pv-title').innerText = title;
    document.getElementById('pv-price').innerText = formatPrice(price);
    document.getElementById('pv-desc').innerText = desc;

    document.getElementById('pv-add-btn').onclick = () => addToCart(title, price, image);
}

function closeProduct() {
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('product-view').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Dynamic Text Alternator ---
const words = ["Revolucionário", "Sustentável", "Caótico", "Brabo", "Verde", "Irônico"];
const wordColors = ["text-brand-yellow", "text-brand-blue", "text-brand-red", "text-brand-white", "text-brand-green", "text-brand-white"];
let wordIdx = 0;

setInterval(() => {
    const dynamicWordEl = document.getElementById('dynamic-word');
    if (dynamicWordEl) {
        // Fade out and move down
        dynamicWordEl.style.opacity = '0';
        dynamicWordEl.style.transform = 'translateY(20px)';

        setTimeout(() => {
            wordIdx = (wordIdx + 1) % words.length;
            dynamicWordEl.innerText = words[wordIdx];

            // Reset classes and apply new color
            dynamicWordEl.className = `block mt-2 text-[5rem] sm:text-[8rem] md:text-[10rem] text-stroke-black drop-shadow-[6px_6px_0px_#000000] transition-all duration-300 ${wordColors[wordIdx]}`;

            // Fade in and move to original position
            dynamicWordEl.style.opacity = '1';
            dynamicWordEl.style.transform = 'translateY(0)';
        }, 300); // 300ms matches the CSS duration
    }
}, 2500); // Change word every 2.5 seconds


function toggleSubmenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const popup = document.getElementById('submenu-popup');
    const chevron = document.getElementById('collections-chevron');

    if (popup.classList.contains('opacity-0')) {
        // Open Menu
        popup.classList.remove('opacity-0', 'scale-50', 'pointer-events-none');
        popup.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
        if (chevron) chevron.classList.add('rotate-180');
    } else {
        // Close Menu
        popup.classList.add('opacity-0', 'scale-50', 'pointer-events-none');
        popup.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
        if (chevron) chevron.classList.remove('rotate-180');
    }
}

// Close submenu when clicking anywhere else
document.addEventListener('click', (e) => {
    const popup = document.getElementById('submenu-popup');
    const container = document.getElementById('collections-container');
    const chevron = document.getElementById('collections-chevron');
    if (popup && !popup.classList.contains('opacity-0') && container && !container.contains(e.target)) {
        popup.classList.add('opacity-0', 'scale-50', 'pointer-events-none');
        popup.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
        if (chevron) chevron.classList.remove('rotate-180');
    }
});

// --- FATO.AI Stylist Integration ---
const aiChatState = [
    {
        role: "user",
        parts: [{ text: "System prompt: Aja como um stylist de moda streetwear e assistente de vendas da marca 'THE FATO'. Você tem uma atitude ousada, direta, um pouco rebelde e usa gírias do streetwear brasileiro (ex: 'salve', 'kit', 'brabo', 'drip', 'mano'). Recomende peças do nosso catálogo com base no que o usuário pedir. Nosso catálogo atual: 1. 'T-Shirt Ainda Se Lembra' (estampa borboleta/lagarta), 2. 'T-Shirt Melzinho' (estampa abelha/chupeta), 3. 'T-Shirt Let It Quack' (estampa de patos psicodélica), 4. 'T-Shirt Possui Ecobag' (estampa canguru e estrela). Todas custam R$ 149,90. Mantenha as respostas bem curtas, diretas e autênticas, como mensagens de chat (máximo 2-3 frases curtas)." }]
    },
    {
        role: "model",
        parts: [{ text: "Pode pá. Salve! Bora montar esse kit brabo pra você." }]
    }
];

function toggleAIDrawer(e) {
    if (e) e.preventDefault();
    const drawer = document.getElementById('ai-drawer');
    const overlay = document.getElementById('ai-overlay');
    drawer.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
}

function appendMessage(sender, text) {
    const chatHistory = document.getElementById('ai-chat-history');
    const msgDiv = document.createElement('div');

    if (sender === 'user') {
        msgDiv.className = 'bg-brand-red text-brand-white p-4 rounded-2xl rounded-tr-none self-end max-w-[85%] border-[3px] border-brand-black font-bold text-sm shadow-[4px_4px_0px_#000000]';
    } else {
        msgDiv.className = 'bg-brand-blue text-brand-white p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] border-[3px] border-brand-black font-bold text-sm shadow-[4px_4px_0px_#000000]';
    }

    msgDiv.innerText = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function handleAISubmit(e) {
    e.preventDefault();
    const input = document.getElementById('ai-input');
    const btnText = document.getElementById('ai-btn-text');
    const btnSpinner = document.getElementById('ai-btn-spinner');
    const message = input.value.trim();

    if (!message) return;

    appendMessage('user', message);
    input.value = '';
    input.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    aiChatState.push({ role: "user", parts: [{ text: message }] });

    try {
        const apiKey = ""; // Platform automatically provides key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: aiChatState })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            appendMessage('model', reply);
            aiChatState.push({ role: "model", parts: [{ text: reply }] });
        } else {
            appendMessage('model', "Putz, deu um erro aqui na matrix. Manda a ideia de novo.");
        }
    } catch (error) {
        console.error("FATO.AI Error:", error);
        appendMessage('model', "Caiu a rede aqui, mano. Tenta de novo.");
    } finally {
        input.disabled = false;
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        input.focus();
    }
}
