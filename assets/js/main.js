/* ═══════════════════════════════════════════════════════════
   THE FATO — Main JavaScript (Refactored)
   Dark Industrial Streetwear Edition
   ═══════════════════════════════════════════════════════════ */

// ── Cart State ─────────────────────────────────────────────
let cart = [];
const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;

// ── Drawer Toggle (Generic) ────────────────────────────────
function openDrawer(panelId, overlayId) {
    document.getElementById(panelId).classList.add('open');
    document.getElementById(overlayId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawer(panelId, overlayId) {
    document.getElementById(panelId).classList.remove('open');
    document.getElementById(overlayId).classList.remove('active');
    document.body.style.overflow = '';
}

// ── Cart ───────────────────────────────────────────────────
function toggleCart(e) {
    if (e) e.preventDefault();
    const panel = document.getElementById('cart-drawer');
    if (panel.classList.contains('open')) {
        closeDrawer('cart-drawer', 'cart-overlay');
    } else {
        openDrawer('cart-drawer', 'cart-overlay');
    }
}

function addToCart(title, price, image) {
    cart.push({ title, price, image });
    updateCartUI();
    openDrawer('cart-drawer', 'cart-overlay');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = cart.length;
        badge.style.display = cart.length > 0 ? 'flex' : 'none';
    }

    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full gap-4 text-center">
                <svg class="w-16 h-16 text-[var(--c-border)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <p class="text-[var(--c-text-dim)] text-sm uppercase tracking-[0.2em] font-semibold">Carrinho vazio</p>
            </div>`;
        document.getElementById('cart-total').innerText = 'R$ 0,00';
        return;
    }

    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="flex gap-4 items-center border border-[var(--c-border)] p-3 group relative">
                <div class="w-16 h-20 bg-[var(--c-surface2)] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src="${item.image}" class="w-full h-full object-cover" alt="${item.title}">
                </div>
                <div class="flex-1 min-w-0 pr-6">
                    <h4 class="font-display text-base uppercase leading-tight text-[var(--c-text)] truncate">${item.title}</h4>
                    <p class="text-sm text-[var(--c-accent)] mt-1 font-semibold">${formatPrice(item.price)}</p>
                </div>
                <button onclick="removeFromCart(${index})"
                    class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[var(--c-text-dim)] hover:text-[var(--c-accent)] transition-colors text-sm">✕</button>
            </div>`;
    });
    document.getElementById('cart-total').innerText = formatPrice(total);
}

// ── Product View ───────────────────────────────────────────
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

// ── Hero Dynamic Text ──────────────────────────────────────
const words = ["REVOLUCIONÁRIO", "SUSTENTÁVEL", "CAÓTICO", "IRÔNICO", "INEVITÁVEL", "INCÔMODO"];
let wordIdx = 0;

setInterval(() => {
    const el = document.getElementById('dynamic-word');
    if (!el) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';

    setTimeout(() => {
        wordIdx = (wordIdx + 1) % words.length;
        el.innerText = words[wordIdx];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 350);
}, 3000);

// ── Submenu Toggle ─────────────────────────────────────────
function toggleSubmenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const popup = document.getElementById('submenu-popup');
    const chevron = document.getElementById('collections-chevron');

    if (popup.classList.contains('opacity-0')) {
        popup.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        popup.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
        if (chevron) chevron.classList.add('rotate-180');
    } else {
        popup.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        popup.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
        if (chevron) chevron.classList.remove('rotate-180');
    }
}

document.addEventListener('click', (e) => {
    const popup = document.getElementById('submenu-popup');
    const container = document.getElementById('collections-container');
    const chevron = document.getElementById('collections-chevron');
    if (popup && !popup.classList.contains('opacity-0') && container && !container.contains(e.target)) {
        popup.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        popup.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
        if (chevron) chevron.classList.remove('rotate-180');
    }
});

// ── FATO.AI Stylist Drawer ─────────────────────────────────
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
    const panel = document.getElementById('ai-drawer');
    if (panel.classList.contains('open')) {
        closeDrawer('ai-drawer', 'ai-overlay');
    } else {
        openDrawer('ai-drawer', 'ai-overlay');
    }
}

function appendMessage(sender, text) {
    const chatHistory = document.getElementById('ai-chat-history');
    const msgDiv = document.createElement('div');

    if (sender === 'user') {
        msgDiv.className = 'self-end max-w-[85%] px-4 py-3 text-sm font-medium bg-[var(--c-accent)] text-[var(--c-black)] rounded-2xl rounded-tr-sm';
    } else {
        msgDiv.className = 'self-start max-w-[85%] px-4 py-3 text-sm font-medium bg-[var(--c-surface2)] text-[var(--c-text)] border border-[var(--c-border)] rounded-2xl rounded-tl-sm';
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
        const apiKey = "";
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
            appendMessage('model', "Deu ruim aqui. Manda de novo.");
        }
    } catch (error) {
        console.error("FATO.AI Error:", error);
        appendMessage('model', "Caiu a rede. Tenta de novo.");
    } finally {
        input.disabled = false;
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        input.focus();
    }
}

// ── Intersection Observer (Scroll Reveal) ──────────────────
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // Size selector buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Init cart badge
    const badge = document.getElementById('cart-count');
    if (badge) badge.style.display = 'none';

    // Mobile nav toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });
    }
});
