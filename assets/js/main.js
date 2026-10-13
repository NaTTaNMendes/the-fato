/* ═══════════════════════════════════════════════════════════
   THE FATO — interações do site
   Depende de assets/js/products.js (PRODUCTS, COLLECTIONS).
   ═══════════════════════════════════════════════════════════ */

const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;
const normalize = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PAGE = document.body.dataset.page || '';

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function lockScroll(locked) {
    document.documentElement.style.overflow = locked ? 'hidden' : '';
}


// ── 1. Product cards (rendered from products.js) ──────────
// print art (square, white background) is shown whole; photos keep object-fit: cover
const isArt = (src) => src.includes('/estampas/');

// prices with the store rules from products.js (STORE)
const pixPrice = (value) => value * (1 - STORE.pixDiscount);
const pixPercent = () => Math.round(STORE.pixDiscount * 100);
const installments = (value) => `${STORE.maxInstallments}x de ${formatPrice(value / STORE.maxInstallments)} sem juros`;
const isFreeShipping = (subtotal) => subtotal >= STORE.freeShippingFrom;

const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';

// The grid item is a wrapper so the favorite button can sit next to the link (no button inside <a>)
function renderProductCard(p) {
    const coll = COLLECTIONS[p.collection];
    const order = PRODUCTS.indexOf(p) + 1;
    const badge = p.badge && BADGES[p.badge];
    const photo = p.colors[p.mainColor]; // mockup photo on the product's main tee color
    return `
        <div class="product-item" data-id="${esc(p.id)}" data-name="${esc(p.name)}" data-collection="${esc(p.collection)}" data-color="${esc(Object.keys(p.colors).join(' '))}" data-price="${p.price}" data-order="${order}">
            <a href="produto.html?id=${esc(p.id)}" class="product-card">
                <div class="card-img aspect-[3/4] bg-bone">
                    <span class="card-tag">${esc(coll ? coll.name : '')}</span>
                    ${badge ? `<span class="card-badge badge-${esc(p.badge)}">${esc(badge)}</span>` : ''}
                    <img src="${esc(photo)}" alt="${esc(p.name)}: camiseta ${esc(TEE_COLORS[p.mainColor].name.toLowerCase())} com a estampa" loading="lazy" decoding="async" width="1200" height="1600">
                    <img src="${esc(p.images[0])}" alt="" aria-hidden="true" class="is-art card-art-hover" loading="lazy" decoding="async" width="1200" height="1200">
                </div>
                <div class="card-body">
                    <h3 class="card-title">${esc(p.name)}</h3>
                    <p class="card-subtitle">${esc(p.colorLabel)}</p>
                    <p class="card-price">${formatPrice(p.price)}</p>
                    <p class="card-pix">${formatPrice(pixPrice(p.price))} no PIX</p>
                </div>
            </a>
            <button type="button" class="fav-btn" data-fav="${esc(p.id)}" aria-pressed="${isFav(p.id)}" aria-label="Favoritar ${esc(p.name)}">${HEART}</button>
        </div>`;
}

function renderProducts() {
    if (typeof PRODUCTS === 'undefined') return;
    document.querySelectorAll('[data-products]').forEach(grid => {
        const source = grid.dataset.products;
        let list = PRODUCTS;
        if (source.startsWith('collection:')) list = PRODUCTS.filter(p => p.collection === source.split(':')[1]);
        const limit = parseInt(grid.dataset.limit, 10);
        if (limit) list = list.slice(0, limit);
        grid.innerHTML = list.map(renderProductCard).join('');
    });
    document.querySelectorAll('[data-collection-count]').forEach(node => {
        const n = PRODUCTS.filter(p => p.collection === node.dataset.collectionCount).length;
        node.textContent = n === 1 ? '1 peça' : `${n} peças`;
    });
}


// ── 2. Cart (saved in localStorage, shared by every page) ──
const CART_KEY = 'thefato-cart';

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) { return []; }
}

let cart = loadCart();
let lastFocus = null;
let onCartChange = null; // set by pages that show the cart contents (checkout)

function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode: cart lives only on this page */ }
}

const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
const cartSubtotal = () => cart.reduce((n, i) => n + i.price * i.qty, 0);

window.toggleCart = function (e, forceOpen) {
    if (e && e.preventDefault) e.preventDefault();
    const panel = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!panel || !overlay) return;
    const open = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('open');
    if (open === panel.classList.contains('open')) return;
    panel.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
    panel.setAttribute('aria-hidden', String(!open));
    lockScroll(open);
    if (open) {
        lastFocus = document.activeElement;
        setTimeout(() => panel.focus(), 50);
    } else if (lastFocus && lastFocus.focus) {
        lastFocus.focus();
    }
};

window.addToCart = function (title, price, image, size, color) {
    const id = `${title}__${size || 'U'}${color ? `__${color}` : ''}`;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, title, price, image, size: size || '', color: color || '', qty: 1 });
    saveCart();
    updateCartUI(true);
    window.toggleCart(null, true);
};

window.changeQty = function (id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
};

window.removeFromCart = function (id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
};

// "Faltam R$ X para o frete grátis" bar (cart drawer and checkout summary)
// ids: <prefix>-text and <prefix>-fill inside the bar
function renderShipBar(prefix, subtotal) {
    const text = document.getElementById(`${prefix}-text`);
    const fill = document.getElementById(`${prefix}-fill`);
    if (!text || !fill) return;
    const done = isFreeShipping(subtotal);
    text.innerHTML = done
        ? 'Frete grátis liberado <span aria-hidden="true">(•ᴥ•)</span>'
        : `Faltam <strong>${formatPrice(STORE.freeShippingFrom - subtotal)}</strong> para o frete grátis`;
    fill.style.width = `${Math.min(100, (subtotal / STORE.freeShippingFrom) * 100)}%`;
    fill.parentElement.parentElement.classList.toggle('is-done', done);
}

function renderEmptyCart(container) {
    container.innerHTML = '';
    const box = el('div', 'flex flex-col items-center justify-center h-full gap-4 text-center');
    box.innerHTML = '<svg class="w-16 h-16 text-carbon-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>';
    box.appendChild(el('p', 'text-carbon-700 text-sm uppercase tracking-[0.2em] font-semibold', 'Carrinho vazio'));
    const link = el('a', 'btn-ghost', 'Ver drops'); link.href = 'produtos.html';
    box.appendChild(link);
    container.appendChild(box);
}

function updateCartUI(bump) {
    const count = cartCount();
    if (typeof onCartChange === 'function') onCartChange();

    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
        if (bump) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
    }
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.setAttribute('aria-label', count ? `Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}` : 'Abrir carrinho');

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = formatPrice(cartSubtotal());
    const pixEl = document.getElementById('cart-pix');
    if (pixEl) pixEl.textContent = cart.length ? `ou ${formatPrice(pixPrice(cartSubtotal()))} no PIX` : '';
    const shipBox = document.getElementById('cart-ship');
    if (shipBox) {
        shipBox.classList.toggle('hidden', cart.length === 0);
        renderShipBar('cart-ship', cartSubtotal());
    }

    const checkoutBtn = document.querySelector('[data-checkout]');
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    const container = document.getElementById('cart-items');
    if (!container) return;
    if (cart.length === 0) { renderEmptyCart(container); return; }

    container.innerHTML = '';
    cart.forEach(item => {
        const row = el('div', 'flex gap-4 items-center bg-white p-3 border-[3px] border-carbon-950 relative');

        const img = el('img', 'w-16 h-20 object-cover border border-carbon-950');
        img.src = item.image; img.alt = item.title;
        row.appendChild(img);

        const info = el('div', 'flex-1 min-w-0');
        info.appendChild(el('h3', 'font-display text-lg text-carbon-950 uppercase leading-none pr-6', item.title));
        if (item.size) info.appendChild(el('p', 'font-mono text-[0.65rem] uppercase tracking-[0.2em] text-carbon-700 mt-1', `Tamanho ${item.size}${item.color ? ` · ${item.color}` : ''}`));
        info.appendChild(el('p', 'text-brand-red text-sm font-bold mt-1', formatPrice(item.price * item.qty)));

        const qty = el('div', 'flex items-center mt-2 border-[2px] border-carbon-950 w-max');
        const minus = el('button', 'qty-btn', '−'); minus.type = 'button'; minus.setAttribute('aria-label', `Diminuir ${item.title}`);
        minus.addEventListener('click', () => window.changeQty(item.id, -1));
        const plus = el('button', 'qty-btn', '+'); plus.type = 'button'; plus.setAttribute('aria-label', `Aumentar ${item.title}`);
        plus.addEventListener('click', () => window.changeQty(item.id, 1));
        qty.append(minus, el('span', 'w-8 text-center text-sm font-bold', String(item.qty)), plus);
        info.appendChild(qty);
        row.appendChild(info);

        const remove = el('button', 'absolute top-2 right-3 text-carbon-950 hover:text-brand-red', '✕');
        remove.type = 'button'; remove.setAttribute('aria-label', `Remover ${item.title}`);
        remove.addEventListener('click', () => window.removeFromCart(item.id));
        row.appendChild(remove);

        container.appendChild(row);
    });
}


// ── 2b. Account (prototype) ────────────────────────────────
// Static site, no server: accounts keep ONLY name + e-mail in this browser.
// Passwords are validated on screen and never stored anywhere.
const ACCOUNTS_KEY = 'thefato-accounts';
const SESSION_KEY = 'thefato-session';
const ORDERS_KEY = 'thefato-orders';

function readJSON(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; } catch (e) { return fallback; }
}
function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
}

const getAccounts = () => readJSON(ACCOUNTS_KEY, []);
const getSession = () => readJSON(SESSION_KEY, null);
const findAccount = (email) => getAccounts().find(a => a.email === email.trim().toLowerCase()) || null;

function startSession(account) {
    writeJSON(SESSION_KEY, { name: account.name, email: account.email });
}

function logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
}

function saveOrder(order) {
    const orders = readJSON(ORDERS_KEY, []);
    orders.unshift(order);
    writeJSON(ORDERS_KEY, orders.slice(0, 50));
}

const firstName = (name) => String(name).trim().split(/\s+/)[0];


// ── 2c. Favorites (saved in this browser) ──────────────────
const FAV_KEY = 'thefato-favs';
const loadFavs = () => { const v = readJSON(FAV_KEY, []); return Array.isArray(v) ? v : []; };
let favs = loadFavs();
const isFav = (id) => favs.includes(id);

function toggleFav(id) {
    favs = isFav(id) ? favs.filter(f => f !== id) : [...favs, id];
    writeJSON(FAV_KEY, favs);
    updateFavUI();
}

function updateFavUI() {
    document.querySelectorAll('[data-fav]').forEach(b => b.setAttribute('aria-pressed', String(isFav(b.dataset.fav))));
    const n = favs.filter(id => getProduct(id)).length;
    const count = document.getElementById('fav-count');
    if (count) { count.textContent = n; count.style.display = n ? 'flex' : 'none'; }
    const link = document.getElementById('fav-link');
    if (link) link.setAttribute('aria-label', n ? `Favoritos, ${n} ${n === 1 ? 'peça' : 'peças'}` : 'Favoritos');
    renderFavPage();
}

function renderFavPage() {
    if (PAGE !== 'favoritos') return;
    const list = favs.map(getProduct).filter(Boolean);
    document.getElementById('fav-grid').innerHTML = list.map(renderProductCard).join('');
    document.getElementById('fav-empty').classList.toggle('hidden', list.length > 0);
    document.getElementById('fav-page-count').textContent = list.length === 1 ? '1 peça' : `${list.length} peças`;
}

function updateAccountUI() {
    const session = getSession();
    const link = document.getElementById('account-link');
    const dot = document.getElementById('account-dot');
    const mobile = document.getElementById('mobile-account-link');
    if (link) link.setAttribute('aria-label', session ? `Minha conta (${firstName(session.name)})` : 'Entrar ou criar conta');
    if (dot) dot.classList.toggle('hidden', !session);
    if (mobile) mobile.textContent = session ? `Minha conta (${firstName(session.name)})` : 'Entrar / Criar conta';
}

function initAccountPage() {
    if (PAGE !== 'conta') return;
    const auth = document.getElementById('auth');
    const account = document.getElementById('account');
    const tabs = { entrar: document.getElementById('tab-entrar'), criar: document.getElementById('tab-criar') };
    const panels = { entrar: document.getElementById('panel-entrar'), criar: document.getElementById('panel-criar') };

    function render() {
        const session = getSession();
        auth.classList.toggle('hidden', !!session);
        account.classList.toggle('hidden', !session);
        updateAccountUI();
        if (!session) return;
        const acc = findAccount(session.email) || session;
        document.getElementById('acc-first-name').textContent = firstName(acc.name);
        document.getElementById('acc-name').textContent = acc.name;
        document.getElementById('acc-email').textContent = acc.email;
        document.getElementById('acc-since').textContent = acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('pt-BR') : '—';

        const orders = readJSON(ORDERS_KEY, []).filter(o => o.email === acc.email || o.account === acc.email);
        const list = document.getElementById('acc-orders');
        document.getElementById('acc-no-orders').classList.toggle('hidden', orders.length > 0);
        list.innerHTML = orders.map(o => `
            <li class="border-[3px] border-carbon-950">
                <div class="flex flex-wrap justify-between gap-3 bg-[#f4f4f0] border-b-[3px] border-carbon-950 px-5 py-3">
                    <p class="font-display text-2xl uppercase">${esc(o.number)}</p>
                    <p class="font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] self-center">${esc(new Date(o.date).toLocaleDateString('pt-BR'))} · <span class="bg-brand-yellow px-2 py-1">Pedido recebido</span></p>
                </div>
                <ul class="px-5 py-3 text-sm space-y-1">${o.items.map(i => `<li>${i.qty}x ${esc(i.title)}${i.size ? ` (${esc(i.size)})` : ''}</li>`).join('')}</ul>
                <div class="flex justify-between border-t-2 border-carbon-950 px-5 py-3 text-sm"><span>${esc(o.payment)}</span><strong>${formatPrice(o.total)}</strong></div>
            </li>`).join('');
    }

    function selectTab(name, focus) {
        Object.keys(tabs).forEach(k => {
            const on = k === name;
            tabs[k].setAttribute('aria-selected', String(on));
            tabs[k].tabIndex = on ? 0 : -1;
            panels[k].classList.toggle('hidden', !on);
        });
        if (focus) tabs[name].focus();
    }

    // each tab change goes into the browser history, so the back button / back gesture
    // returns from "Criar conta" to "Entrar" instead of leaving the page
    function goTab(name, focus) {
        const current = tabs.criar.getAttribute('aria-selected') === 'true' ? 'criar' : 'entrar';
        if (name !== current) history.pushState({ tab: name }, '', name === 'criar' ? '#criar' : location.pathname + location.search);
        selectTab(name, focus);
    }
    const tabFromUrl = () => (location.hash === '#criar' ? 'criar' : 'entrar');
    window.addEventListener('popstate', () => selectTab(tabFromUrl()));

    Object.keys(tabs).forEach(k => tabs[k].addEventListener('click', () => goTab(k)));
    document.querySelector('.auth-tabs').addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') goTab(tabs.entrar.getAttribute('aria-selected') === 'true' ? 'criar' : 'entrar', true);
    });
    document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => goTab(b.dataset.goto, true)));
    selectTab(tabFromUrl());

    // show / hide password
    document.querySelectorAll('.password-toggle').forEach(btn => btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Ocultar' : 'Mostrar';
        btn.setAttribute('aria-pressed', String(show));
        btn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    }));

    // live password rules
    const senha = document.getElementById('signup-senha');
    const confirma = document.getElementById('signup-confirma');
    const rules = { len: v => v.length >= 8, letter: v => /[A-Za-z]/.test(v), number: v => /\d/.test(v) };
    function checkRules() {
        document.querySelectorAll('#senha-regras [data-rule]').forEach(li => li.classList.toggle('ok', rules[li.dataset.rule](senha.value)));
        confirma.setCustomValidity(confirma.value && confirma.value !== senha.value ? 'diferente' : '');
    }
    senha.addEventListener('input', checkRules);
    confirma.addEventListener('input', checkRules);

    function showMsg(id, text, ok) {
        const msg = document.getElementById(id);
        msg.textContent = text;
        msg.classList.remove('hidden');
        msg.classList.toggle('is-ok', !!ok);
    }

    document.querySelector('[data-forgot]').addEventListener('click', () => {
        showMsg('login-msg', 'Neste protótipo não há envio de e-mail. Na versão real, você receberia um link para criar uma nova senha.', true);
    });

    panels.entrar.addEventListener('submit', (e) => {
        e.preventDefault();
        panels.entrar.classList.add('show-errors');
        if (!panels.entrar.checkValidity()) { panels.entrar.querySelector(':invalid').focus(); return; }
        const acc = findAccount(document.getElementById('login-email').value);
        if (!acc) {
            showMsg('login-msg', 'Não encontramos uma conta com esse e-mail. Que tal criar uma?');
            return;
        }
        startSession(acc);
        panels.entrar.reset();
        render();
        window.scrollTo({ top: 0 });
    });

    panels.criar.addEventListener('submit', (e) => {
        e.preventDefault();
        checkRules();
        panels.criar.classList.add('show-errors');
        if (!panels.criar.checkValidity()) { panels.criar.querySelector(':invalid').focus(); return; }
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        if (findAccount(email)) {
            showMsg('signup-msg', 'Já existe uma conta com esse e-mail. Entre com ela.');
            return;
        }
        // only name + e-mail are kept; the password is discarded here
        const acc = { name: document.getElementById('signup-nome').value.trim(), email, createdAt: new Date().toISOString() };
        writeJSON(ACCOUNTS_KEY, [...getAccounts(), acc]);
        startSession(acc);
        panels.criar.reset();
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
        render();
        window.scrollTo({ top: 0 });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        logout();
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
        selectTab('entrar');
        render();
        window.scrollTo({ top: 0 });
    });

    render();
}


// ── 3. Size selector ───────────────────────────────────────
function getSelectedSize() {
    const selected = document.querySelector('#product-view .size-btn.is-selected');
    return selected ? selected.dataset.size || selected.textContent.trim() : null;
}

function selectSize(btn) {
    const group = btn.closest('.size-group') || btn.parentElement;
    group.querySelectorAll('.size-btn').forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', String(on));
    });
    const err = document.getElementById('pv-size-error');
    if (err) err.classList.add('hidden');
}


// ── 4. Product page (produto.html?id=…) ────────────────────
function initProductPage() {
    if (PAGE !== 'produto') return;
    const product = getProduct(new URLSearchParams(location.search).get('id'));
    if (!product) {
        document.getElementById('product-missing').classList.remove('hidden');
        document.title = 'Peça não encontrada | The Fato';
        return;
    }
    const coll = COLLECTIONS[product.collection];
    document.getElementById('product-page').classList.remove('hidden');

    document.title = `${product.name} | The Fato`;
    const description = `${product.name} — camiseta ${coll.name}, ${product.colorLabel}. ${BASE_DESCRIPTION}`;
    document.querySelectorAll('meta[name="description"], meta[property="og:description"]').forEach(m => m.setAttribute('content', description));
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', document.title);

    const crumb = document.getElementById('pp-crumb-collection');
    crumb.textContent = coll.name; crumb.href = coll.page;
    document.getElementById('pp-crumb-name').textContent = product.name;
    document.getElementById('pp-tag').textContent = coll.name;
    document.getElementById('pp-name').textContent = product.name;
    document.getElementById('pp-color').textContent = product.colorLabel;
    document.getElementById('pp-price').textContent = formatPrice(product.price);
    document.getElementById('pp-desc').textContent = `${coll.tagline} ${BASE_DESCRIPTION}`;
    document.getElementById('pp-pay').innerHTML = `<strong>${formatPrice(pixPrice(product.price))}</strong> no PIX (${pixPercent()}% off) · ou ${installments(product.price)}`;
    const badge = document.getElementById('pp-badge');
    if (product.badge && BADGES[product.badge]) {
        badge.textContent = BADGES[product.badge];
        badge.classList.add(`badge-${product.badge}`);
        badge.classList.remove('hidden');
    }
    const fav = document.getElementById('pp-fav');
    fav.dataset.fav = product.id;
    fav.setAttribute('aria-label', `Favoritar ${product.name}`);
    renderSpecies(product, coll);
    initShipCalc(product);
    initReviews(product);

    // gallery: photo of the chosen tee color first, then the print art
    const main = document.getElementById('pp-image');
    const thumbs = document.getElementById('pp-thumbs');
    const colorGroup = document.getElementById('pp-colors');
    let color = new URLSearchParams(location.search).get('cor');
    if (!product.colors[color]) color = product.mainColor;

    function showImage(src) {
        main.src = src;
        main.alt = isArt(src) ? `Arte da estampa ${product.name}` : `${product.name}: camiseta ${TEE_COLORS[color].name.toLowerCase()} com a estampa`;
        main.classList.toggle('is-photo', !isArt(src)); // photos fill the frame, art stays whole
    }

    function renderGallery() {
        const list = [product.colors[color], ...product.images];
        showImage(list[0]);
        thumbs.classList.remove('hidden');
        thumbs.innerHTML = list.map((src, i) =>
            `<button type="button" class="thumb${i === 0 ? ' is-selected' : ''}" data-src="${esc(src)}" aria-label="${i === 0 ? 'Ver foto da camiseta' : `Ver arte ${i}`}"><img src="${esc(src)}" alt="" loading="lazy"${isArt(src) ? ' class="is-art"' : ''}></button>`).join('');
        document.getElementById('pp-color-name').textContent = TEE_COLORS[color].name;
        document.getElementById('pp-color').textContent = `Camiseta ${TEE_COLORS[color].name.toLowerCase()} · estampa ${color === 'preta' ? 'branca' : 'preta'}`;
        colorGroup.querySelectorAll('.color-btn').forEach(b => b.setAttribute('aria-checked', String(b.dataset.color === color)));
    }

    colorGroup.innerHTML = Object.keys(product.colors).map(c =>
        `<button type="button" class="color-btn" role="radio" data-color="${c}" aria-checked="false" aria-label="${TEE_COLORS[c].name}" title="${TEE_COLORS[c].name}"><span style="background:${TEE_COLORS[c].hex}"></span></button>`).join('');
    colorGroup.addEventListener('click', (e) => {
        const b = e.target.closest('.color-btn');
        if (!b || b.dataset.color === color) return;
        color = b.dataset.color;
        renderGallery();
    });
    thumbs.addEventListener('click', (e) => {
        const t = e.target.closest('.thumb');
        if (!t) return;
        showImage(t.dataset.src);
        thumbs.querySelectorAll('.thumb').forEach(b => b.classList.toggle('is-selected', b === t));
    });
    renderGallery();

    const related = PRODUCTS.filter(p => p.collection === product.collection && p.id !== product.id).slice(0, 3);
    document.getElementById('pp-related').innerHTML = related.map(renderProductCard).join('');

    document.getElementById('pv-add-btn').addEventListener('click', () => {
        const size = getSelectedSize();
        if (!size) {
            const err = document.getElementById('pv-size-error');
            if (err) err.classList.remove('hidden');
            return;
        }
        window.addToCart(product.name, product.price, product.colors[color], size, TEE_COLORS[color].name);
    });
}


// shipping estimate by CEP on the product page (same simulated table as the checkout)
function initShipCalc(product) {
    const form = document.getElementById('pp-ship-form');
    if (!form) return;
    const cep = document.getElementById('pp-cep');
    const out = document.getElementById('pp-ship');
    cep.addEventListener('input', () => maskInput(cep));
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!cep.checkValidity()) {
            out.innerHTML = '<p class="text-brand-red font-mono text-xs uppercase tracking-[0.15em]">Use o formato 00000-000.</p>';
            cep.focus();
            return;
        }
        const s = shippingFor(cep.value);
        const free = isFreeShipping(product.price);
        out.innerHTML = `
            <div class="ship-row"><span>${esc(s.region)} · ${esc(s.days)}</span><strong>${free ? 'Grátis' : formatPrice(s.price)}</strong></div>
            ${free ? '' : `<p class="ship-note">Frete grátis a partir de ${formatPrice(STORE.freeShippingFrom)} (2 peças).</p>`}`;
    });
}

// reviews: no invented reviews; a visitor's own review is saved only in this browser
const REVIEWS_KEY = 'thefato-reviews';

function initReviews(product) {
    const list = document.getElementById('rv-list');
    const form = document.getElementById('rv-form');
    if (!list || !form) return;
    const nome = document.getElementById('rv-nome');
    const texto = document.getElementById('rv-texto');
    const err = document.getElementById('rv-error');
    const session = getSession();
    if (session) nome.value = firstName(session.name);
    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    function render() {
        const mine = readJSON(REVIEWS_KEY, {})[product.id] || [];
        if (!mine.length) {
            list.innerHTML = `
                <div class="rv-empty">
                    <p class="font-body font-bold text-4xl" aria-hidden="true">(•ᴥ•)</p>
                    <p class="font-display text-3xl uppercase mt-4">Ainda não há avaliações</p>
                    <p class="mt-2">Seja o primeiro a contar o que achou desta estampa.</p>
                </div>`;
            return;
        }
        const avg = mine.reduce((s, r) => s + r.nota, 0) / mine.length;
        list.innerHTML = `
            <p class="rv-summary"><span class="rv-stars-static" aria-hidden="true">${stars(Math.round(avg))}</span>
                <strong>${avg.toFixed(1).replace('.', ',')}</strong> · ${mine.length} ${mine.length === 1 ? 'avaliação' : 'avaliações'} neste navegador</p>
            ${mine.map(r => `
                <article class="rv-card">
                    <p class="rv-stars-static" aria-label="Nota ${r.nota} de 5">${stars(r.nota)}</p>
                    <p class="mt-2 leading-relaxed">${esc(r.texto)}</p>
                    <p class="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.15em]">${esc(r.nome)} · ${new Date(r.date).toLocaleDateString('pt-BR')}</p>
                </article>`).join('')}`;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.add('show-errors');
        const nota = form.querySelector('input[name="nota"]:checked');
        err.classList.toggle('hidden', !!nota);
        if (!nota || !form.checkValidity()) {
            const first = !nota ? form.querySelector('input[name="nota"]') : form.querySelector(':invalid');
            if (first) first.focus();
            return;
        }
        const all = readJSON(REVIEWS_KEY, {});
        all[product.id] = [{ nota: parseInt(nota.value, 10), nome: nome.value.trim(), texto: texto.value.trim(), date: new Date().toISOString() }, ...(all[product.id] || [])];
        writeJSON(REVIEWS_KEY, all);
        nota.checked = false;
        texto.value = '';
        form.classList.remove('show-errors');
        render();
    });
    render();
}

// "ficha de espécie": the concept behind each print, in the collection's color
function renderSpecies(product, coll) {
    const box = document.getElementById('pp-species');
    if (!box || !product.species) return;
    const s = product.species;
    box.style.setProperty('--sp-c', `var(--c-${coll.color || 'red'})`);
    box.innerHTML = `
        <div class="species-head">
            <p class="species-label">Ficha de espécie</p>
            <span class="species-kaomoji" aria-hidden="true">${esc(product.kaomoji || '(•ᴥ•)')}</span>
        </div>
        <p class="species-concept">${esc(product.concept || '')}</p>
        <dl class="species-list">
            <div><dt>Nome científico</dt><dd><i>${esc(s.nome)}</i></dd></div>
            <div><dt>Habitat</dt><dd>${esc(s.habitat)}</dd></div>
            <div><dt>Ameaça</dt><dd>${esc(s.ameaca)}</dd></div>
        </dl>
        <p class="species-note"><span aria-hidden="true">*</span>${esc(s.nota)}</p>`;
    box.classList.remove('hidden');
}


// ── 5. Catalog filters (produtos.html) ─────────────────────
function initCatalog() {
    const grid = document.getElementById('catalog-grid');
    const form = document.getElementById('catalog-filters');
    if (!grid || !form) return;

    const cards = [...grid.querySelectorAll('.product-item')];
    const search = document.getElementById('filter-search');
    const sort = document.getElementById('filter-sort');
    const count = document.getElementById('catalog-count');
    const empty = document.getElementById('catalog-empty');
    const clear = document.getElementById('filter-clear');

    // ?colecao=… and ?busca=… come from the menu and the header search
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get('colecao');
    if (fromUrl) {
        const radio = form.querySelector(`input[name="colecao"][value="${CSS.escape(fromUrl)}"]`);
        if (radio) radio.checked = true;
    }
    if (params.get('busca')) search.value = params.get('busca');

    function apply() {
        const colecao = form.querySelector('input[name="colecao"]:checked').value;
        const cor = form.querySelector('input[name="cor"]:checked').value;
        const term = normalize(search.value.trim());

        const visible = cards.filter(card => {
            const okColl = colecao === 'todas' || card.dataset.collection === colecao;
            const okColor = cor === 'todas' || card.dataset.color.split(' ').includes(cor);
            const okTerm = !term || normalize(card.dataset.name).includes(term);
            return okColl && okColor && okTerm;
        });

        const by = {
            'relevancia': (a, b) => a.dataset.order - b.dataset.order,
            'nome-asc': (a, b) => a.dataset.name.localeCompare(b.dataset.name, 'pt-BR', { numeric: true }),
            'nome-desc': (a, b) => b.dataset.name.localeCompare(a.dataset.name, 'pt-BR', { numeric: true }),
            'preco-asc': (a, b) => a.dataset.price - b.dataset.price || a.dataset.order - b.dataset.order,
            'preco-desc': (a, b) => b.dataset.price - a.dataset.price || a.dataset.order - b.dataset.order,
        }[sort.value];
        visible.sort(by);

        // a color filter shows every card on that tee color; "Todas" uses each product's main color
        cards.forEach(card => {
            const p = getProduct(card.dataset.id);
            const img = card.querySelector('.card-img img');
            const shown = p && p.colors[cor] ? cor : (p ? p.mainColor : 'branca');
            if (p && img && img.getAttribute('src') !== p.colors[shown]) {
                img.src = p.colors[shown];
                img.alt = `${p.name}: camiseta ${shown} com a estampa`;
                card.querySelector('.product-card').href = `produto.html?id=${encodeURIComponent(p.id)}${shown !== p.mainColor ? `&cor=${shown}` : ''}`;
            }
        });

        // visible cards first (in order) so the color bands keep cycling, hidden ones after
        cards.forEach(card => { card.hidden = !visible.includes(card); });
        [...visible, ...cards.filter(c => c.hidden)].forEach(card => grid.appendChild(card));

        count.textContent = visible.length === 1 ? '1 peça' : `${visible.length} peças`;
        empty.classList.toggle('hidden', visible.length > 0);
        grid.classList.toggle('hidden', visible.length === 0);
        const filtered = colecao !== 'todas' || cor !== 'todas' || term || sort.value !== 'relevancia';
        clear.classList.toggle('invisible', !filtered);

        const url = new URL(location.href);
        if (colecao === 'todas') url.searchParams.delete('colecao'); else url.searchParams.set('colecao', colecao);
        if (term) url.searchParams.set('busca', search.value.trim()); else url.searchParams.delete('busca');
        history.replaceState(null, '', url);
    }

    form.addEventListener('change', apply);
    search.addEventListener('input', apply);
    clear.addEventListener('click', () => { form.reset(); apply(); });
    apply();
}


// ── 6. Checkout (checkout.html) ────────────────────────────
// Prototype: no payment is processed and no data leaves the browser.
function shippingFor(cep) {
    const region = parseInt(cep.charAt(0), 10);
    if (region <= 1) return { price: 14.90, days: '3 a 5 dias úteis', region: 'SP' };
    if (region <= 3) return { price: 17.90, days: '4 a 6 dias úteis', region: 'RJ, ES e MG' };
    if (region <= 5) return { price: 24.90, days: '6 a 10 dias úteis', region: 'Nordeste' };
    if (region <= 7) return { price: 22.90, days: '5 a 9 dias úteis', region: 'Norte e Centro-Oeste' };
    return { price: 19.90, days: '4 a 7 dias úteis', region: 'Sul' };
}

function maskInput(input) {
    const digits = input.value.replace(/\D/g, '');
    if (input.dataset.mask === 'cep') {
        const d = digits.slice(0, 8);
        input.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    }
    if (input.dataset.mask === 'phone') {
        const d = digits.slice(0, 11);
        if (d.length <= 2) input.value = d.length ? `(${d}` : '';
        else if (d.length <= 6) input.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
        else if (d.length <= 10) input.value = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        else input.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }
}

function initCheckout() {
    if (PAGE !== 'checkout') return;
    const wrap = document.getElementById('checkout');
    if (cart.length === 0) {
        wrap.classList.add('hidden');
        document.getElementById('checkout-empty').classList.remove('hidden');
        document.querySelectorAll('[data-step-ind]').forEach(li => li.classList.add('is-muted'));
        return;
    }

    const steps = [...document.querySelectorAll('.checkout-step')];
    const indicators = [...document.querySelectorAll('[data-step-ind]')];
    let shipping = null;

    // logged in: prefill name + e-mail; otherwise offer to log in
    const session = getSession();
    const hint = document.getElementById('co-account-hint');
    if (session) {
        document.getElementById('co-nome').value = session.name;
        document.getElementById('co-email').value = session.email;
        hint.innerHTML = `Comprando como <strong>${esc(session.name)}</strong>. O pedido vai aparecer em <a href="conta.html" class="underline font-semibold">Minha conta</a>.`;
    } else {
        hint.innerHTML = 'Já tem conta? <a href="conta.html" class="underline font-semibold">Entre</a> para preencher seus dados e guardar o pedido no histórico.';
    }

    const items = document.getElementById('co-items');
    let placed = false; // true once the order is confirmed (step 4)

    function renderItems() {
        items.innerHTML = cart.map(i => `
            <li class="flex gap-4 items-center p-4">
                <img src="${esc(i.image)}" alt="" class="w-14 h-16 object-cover border border-carbon-950">
                <div class="flex-1 min-w-0">
                    <p class="font-display text-lg uppercase leading-none">${esc(i.title)}</p>
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.15em] mt-1">${i.size ? `Tam. ${esc(i.size)} · ` : ''}${i.color ? `${esc(i.color)} · ` : ''}${i.qty}x</p>
                </div>
                <p class="font-bold">${formatPrice(i.price * i.qty)}</p>
            </li>`).join('');
    }
    renderItems();

    // the cart can change while the customer is here (drawer, another tab): keep the summary in sync
    onCartChange = () => {
        if (placed) return;
        if (cart.length === 0) {
            wrap.classList.add('hidden');
            document.getElementById('checkout-empty').classList.remove('hidden');
            return;
        }
        renderItems();
        refreshTotals();
    };

    let coupon = null; // applied coupon code (STORE.coupons)
    const payMethod = () => (document.querySelector('input[name="pagamento"]:checked') || {}).value || 'pix';

    // coupon over the subtotal, PIX discount over what is left, free shipping by subtotal
    function totals(pay = payMethod()) {
        const subtotal = cartSubtotal();
        const cents = (v) => Math.round(v * 100) / 100;
        const couponOff = coupon ? cents(subtotal * STORE.coupons[coupon]) : 0;
        const pixOff = pay === 'pix' ? cents((subtotal - couponOff) * STORE.pixDiscount) : 0;
        const freeShip = isFreeShipping(subtotal);
        const ship = shipping && !freeShip ? shipping.price : 0;
        return { subtotal, couponOff, pixOff, freeShip, ship, total: cents(subtotal - couponOff - pixOff + ship) };
    }

    function refreshTotals() {
        const t = totals();
        document.getElementById('co-subtotal').textContent = formatPrice(t.subtotal);
        document.getElementById('co-coupon-row').classList.toggle('hidden', !coupon);
        document.getElementById('co-coupon-code').textContent = coupon || '';
        document.getElementById('co-coupon-value').textContent = `− ${formatPrice(t.couponOff)}`;
        document.getElementById('co-pix-row').classList.toggle('hidden', !t.pixOff);
        document.getElementById('co-pix-value').textContent = `− ${formatPrice(t.pixOff)}`;
        document.getElementById('co-shipping').textContent = t.freeShip ? 'Grátis' : (shipping ? formatPrice(shipping.price) : 'Calcular na entrega');
        document.getElementById('co-total').textContent = formatPrice(t.total);
        renderShipBar('co-ship', t.subtotal);
        // installments are on the card price (no PIX discount)
        const cardTotal = totals('cartao').total;
        const parc = document.getElementById('co-parc');
        const chosen = parc.value;
        parc.innerHTML = Array.from({ length: STORE.maxInstallments }, (_, i) => i + 1)
            .map(n => `<option value="${n}">${n}x de ${formatPrice(cardTotal / n)} sem juros</option>`).join('');
        if (chosen) parc.value = chosen; // keep the customer's choice when the total changes
    }

    // coupon
    const couponForm = document.getElementById('co-coupon-form');
    const couponInput = document.getElementById('co-coupon');
    const couponMsg = document.getElementById('co-coupon-msg');
    function setCoupon(code) {
        coupon = code;
        couponInput.value = code || '';
        couponInput.readOnly = !!code;
        couponMsg.className = 'mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-brand-green';
        couponMsg.innerHTML = code
            ? `Cupom ${esc(code)} aplicado: ${Math.round(STORE.coupons[code] * 100)}% off. <button type="button" class="underline" data-coupon-remove>Remover</button>`
            : '';
        refreshTotals();
    }
    couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = couponInput.value.trim().toUpperCase();
        if (coupon) return;
        if (STORE.coupons[code]) { setCoupon(code); return; }
        couponMsg.className = 'mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-brand-red';
        couponMsg.textContent = code ? 'Cupom inválido ou expirado.' : 'Digite um cupom.';
    });
    couponMsg.addEventListener('click', (e) => {
        if (e.target.closest('[data-coupon-remove]')) { setCoupon(null); couponInput.focus(); }
    });

    function show(n) {
        steps.forEach(s => s.classList.toggle('hidden', s.dataset.step !== String(n)));
        indicators.forEach(li => {
            const i = parseInt(li.dataset.stepInd, 10);
            li.classList.toggle('is-active', i === n);
            li.classList.toggle('is-done', i < n);
            if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });
        const title = steps[n - 1].querySelector('h2, p');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
    }

    wrap.querySelectorAll('input[data-mask]').forEach(input => input.addEventListener('input', () => maskInput(input)));

    const cep = document.getElementById('co-cep');
    const freteBox = document.getElementById('co-frete');
    cep.addEventListener('input', () => {
        if (cep.checkValidity()) {
            shipping = shippingFor(cep.value);
            const free = isFreeShipping(cartSubtotal());
            freteBox.classList.remove('hidden');
            freteBox.innerHTML = `<p class="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em]">Frete simulado · ${esc(shipping.region)}</p>
                <p class="font-display text-3xl mt-1">${free ? `Grátis <s class="text-xl opacity-50">${formatPrice(shipping.price)}</s>` : formatPrice(shipping.price)}</p><p class="text-sm">Entrega em ${esc(shipping.days)}.</p>`;
        } else {
            shipping = null;
            freteBox.classList.add('hidden');
        }
        refreshTotals();
    });

    document.querySelectorAll('input[name="pagamento"]').forEach(r => r.addEventListener('change', () => {
        document.querySelectorAll('.pay-panel').forEach(p => p.classList.toggle('hidden', p.dataset.pay !== r.value || !r.checked));
        refreshTotals(); // PIX discount on/off
    }));

    steps.forEach(step => {
        step.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => show(parseInt(step.dataset.step, 10) - 1)));
        if (step.tagName !== 'FORM') return;
        step.addEventListener('submit', (e) => {
            e.preventDefault();
            step.classList.add('show-errors');
            if (!step.checkValidity()) {
                const first = step.querySelector(':invalid');
                if (first) first.focus();
                return;
            }
            const n = parseInt(step.dataset.step, 10);
            if (n === 3) {
                if (placed || cart.length === 0) return; // double click / emptied cart
                placed = true;
                const pay = payMethod();
                const t = totals(pay);
                const total = t.total;
                const parc = document.getElementById('co-parc').value;
                const number = '#TF-' + Math.floor(100000 + Math.random() * 900000);
                const email = document.getElementById('co-email').value.trim().toLowerCase();
                document.getElementById('co-order-number').textContent = number;
                document.getElementById('co-order-email').textContent = email;
                document.getElementById('co-order-pay').textContent = {
                    pix: `Pagamento via PIX de ${formatPrice(total)} — o código seria exibido aqui.`,
                    cartao: `Cartão de crédito em ${parc}x de ${formatPrice(total / parc)} sem juros.`,
                    boleto: `Boleto de ${formatPrice(total)} com vencimento em 3 dias úteis.`,
                }[pay];
                // lets "Rastrear pedido" prefill this order without putting it in the URL
                try { sessionStorage.setItem('thefato-last-order', JSON.stringify({ number, email })); } catch (e) { /* ignore */ }
                saveOrder({
                    number, email, total, date: new Date().toISOString(),
                    subtotal: t.subtotal, discount: t.couponOff + t.pixOff, shipping: t.ship, coupon,
                    account: session ? session.email : null, // shows up in "Minha conta" even if the e-mail was edited
                    payment: { pix: 'PIX', cartao: `Cartão em ${parc}x`, boleto: 'Boleto' }[pay],
                    items: cart.map(i => ({ title: i.title, size: i.size, color: i.color || '', qty: i.qty })),
                });
                document.getElementById('co-account-cta').classList.toggle('hidden', !!findAccount(email));
                cart = [];
                saveCart();
                updateCartUI();
            }
            show(n + 1);
        });
    });

    refreshTotals();
    show(1);
}


// ── 7. FAQ search (faq.html) ───────────────────────────────
function initFaq() {
    const search = document.getElementById('faq-search');
    const list = document.getElementById('faq-list');
    if (!search || !list) return;
    const items = [...list.querySelectorAll('.faq-item')];
    const groups = [...list.querySelectorAll('.faq-group')];
    const count = document.getElementById('faq-count');
    const empty = document.getElementById('faq-empty');
    let searching = false;
    let savedOpen = items.map(i => i.open);

    function apply() {
        const term = normalize(search.value.trim());
        // remember what the visitor had open, and restore it when the search is cleared
        if (term && !searching) savedOpen = items.map(i => i.open);
        let shown = 0;
        items.forEach((item, idx) => {
            const match = !term || normalize(item.textContent).includes(term);
            item.hidden = !match;
            if (match) shown++;
            item.open = term ? match : savedOpen[idx]; // open the matches while searching
        });
        searching = !!term;
        groups.forEach(g => { g.hidden = !g.querySelector('.faq-item:not([hidden])'); });
        empty.classList.toggle('hidden', shown > 0);
        count.textContent = term ? `${shown} resultado${shown === 1 ? '' : 's'}` : `${items.length} perguntas`;
    }

    search.addEventListener('input', apply);
    apply();
}


// ── 8. Size finder (medidas.html) ──────────────────────────
// Table widths (B): P 54, M 56, G 58, GG 60 cm
function initSizeFinder() {
    const form = document.getElementById('size-finder');
    if (!form) return;
    const sizes = [['P', 54], ['M', 56], ['G', 58], ['GG', 60]];
    const input = document.getElementById('sf-width');
    const out = document.getElementById('sf-size');
    const note = document.getElementById('sf-note');
    const rows = [...document.querySelectorAll('.size-table tbody tr')];

    function apply() {
        const width = parseFloat(String(input.value).replace(',', '.'));
        const larger = form.querySelector('input[name="sf-fit"]:checked').value === 'larga';
        rows.forEach(r => r.classList.remove('is-match'));
        if (!width || width < 40 || width > 80) {
            out.textContent = '—';
            note.textContent = width ? 'Confira a medida: digite um valor entre 40 e 80 cm.' : 'Digite a largura para ver a recomendação.';
            return;
        }
        let idx = sizes.findIndex(([, w]) => width <= w);
        if (idx === -1) {
            out.textContent = 'GG';
            note.textContent = 'Sua medida é maior que a do GG (60 cm). O GG é o mais largo da coleção — fale com a gente se tiver dúvida.';
            rows[3].classList.add('is-match');
            return;
        }
        if (larger && idx < sizes.length - 1) idx++;
        const [size, w] = sizes[idx];
        out.textContent = size;
        note.textContent = larger
            ? `Para um caimento mais largo, indicamos o ${size} (${w} cm de largura).`
            : `O ${size} tem ${w} cm de largura, a medida mais próxima da sua camiseta.`;
        const row = rows.find(r => r.dataset.size === size);
        if (row) row.classList.add('is-match');
    }

    input.addEventListener('input', apply);
    form.addEventListener('change', apply);
}


// ── 9. Header: dropdown, search, active page, scroll state ──
function setSubmenu(open) {
    const popup = document.getElementById('submenu-popup');
    const chevron = document.getElementById('collections-chevron');
    const btn = document.getElementById('collections-btn');
    if (!popup) return;
    popup.classList.toggle('opacity-0', !open);
    popup.classList.toggle('scale-95', !open);
    popup.classList.toggle('pointer-events-none', !open);
    popup.classList.toggle('opacity-100', open);
    popup.classList.toggle('scale-100', open);
    popup.classList.toggle('pointer-events-auto', open);
    popup.classList.toggle('invisible', !open); // closed menu links must not be reachable with Tab
    if (chevron) chevron.classList.toggle('rotate-180', open);
    if (btn) btn.setAttribute('aria-expanded', String(open));
}

function toggleSubmenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const popup = document.getElementById('submenu-popup');
    setSubmenu(popup && popup.classList.contains('opacity-0'));
}

document.addEventListener('click', (e) => {
    const container = document.getElementById('collections-container');
    if (container && !container.contains(e.target)) setSubmenu(false);
});

function setSearch(open) {
    const form = document.getElementById('site-search');
    const btn = document.getElementById('search-toggle');
    if (!form || !btn) return;
    form.classList.toggle('hidden', !open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) document.getElementById('site-search-input').focus();
}

function markActiveNav() {
    const map = {
        'drops': ['drops'], 'produto': ['drops'],
        'bicharada': ['colecoes', 'bicharada'], 'consumo': ['colecoes', 'consumo'], 'conceitos': ['colecoes', 'conceitos'],
        'favoritos': ['favoritos'], 'rastrear': ['rastrear'],
        'manifesto': ['manifesto'], 'faq': ['faq'], 'trocas': ['faq'], 'medidas': ['faq'], 'conta': ['conta'],
    };
    (map[PAGE] || []).forEach(key => {
        document.querySelectorAll(`[data-nav="${key}"]`).forEach(link => link.setAttribute('aria-current', 'page'));
    });
}


// ── 10. Hero dynamic word ──────────────────────────────────
const words = ['IRÔNICO', 'BICHO SOLTO', 'SUSTENTÁVEL', 'TROCADILHO', 'CONCEITUAL', 'BEM-HUMORADO'];
let wordIdx = 0;
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
        const word = document.getElementById('dynamic-word');
        if (!word) return;
        word.style.opacity = '0';
        word.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            wordIdx = (wordIdx + 1) % words.length;
            word.innerText = words[wordIdx];
            word.style.opacity = '1';
            word.style.transform = 'translateY(0)';
        }, 350);
    }, 3000);
}


// ── 10b. Splash screen (once per visit) ────────────────────
// <head> adds .show-splash to <html> on the first page of the visit; here we
// play it for ~1.9 s, let click/Esc skip it and remove it from the page.
function initSplash() {
    const splash = document.getElementById('splash');
    const root = document.documentElement;
    if (!splash) return;
    if (!root.classList.contains('show-splash')) { splash.remove(); return; }
    try { sessionStorage.setItem('thefato-splash', '1'); } catch (e) { /* ignore */ }
    lockScroll(true);

    let done = false;
    const onKey = (e) => { if (['Escape', 'Enter', ' '].includes(e.key)) finish(); };
    function finish() {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKey);
        splash.classList.add('splash-out');
        setTimeout(() => {
            root.classList.remove('show-splash');
            splash.remove();
            lockScroll(false);
        }, 520);
    }
    splash.addEventListener('click', finish);
    document.addEventListener('keydown', onKey);
    setTimeout(finish, 1900);
}


// ── 10c. Order tracking (rastrear.html) ────────────────────
// Prototype: looks up the orders saved by the checkout in this browser and
// fakes the progress from the order date.
function initTracking() {
    if (PAGE !== 'rastrear') return;
    const form = document.getElementById('track-form');
    const number = document.getElementById('track-number');
    const email = document.getElementById('track-email');
    const out = document.getElementById('track-result');

    let last = null;
    try { last = JSON.parse(sessionStorage.getItem('thefato-last-order')); } catch (e) { /* ignore */ }
    const session = getSession();
    if (last) { number.value = last.number; email.value = last.email; }
    else if (session) email.value = session.email;

    const STEPS = ['Pedido recebido', 'Em produção', 'Enviado', 'Entregue'];
    const stepFor = (date) => {
        const hours = (Date.now() - new Date(date).getTime()) / 36e5;
        return hours < 1 ? 0 : hours < 24 ? 1 : hours < 72 ? 2 : 3;
    };

    function show(order) {
        if (!order) {
            out.innerHTML = `
                <div class="border-[3px] border-carbon-950 bg-brand-yellow p-8">
                    <p class="font-display text-3xl uppercase">Pedido não encontrado</p>
                    <p class="mt-3 leading-relaxed">Confira o número e o e-mail. Neste protótipo, só aparecem pedidos feitos neste navegador.</p>
                </div>`;
            return;
        }
        const current = stepFor(order.date);
        const placed = new Date(order.date);
        const eta = new Date(placed.getTime() + 7 * 864e5);
        out.innerHTML = `
            <div class="border-[3px] border-carbon-950">
                <div class="bg-carbon-950 text-white px-6 py-4 flex flex-wrap justify-between gap-2">
                    <p class="font-display text-2xl uppercase">${esc(order.number)}</p>
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.2em] self-center">Feito em ${placed.toLocaleDateString('pt-BR')}</p>
                </div>
                <ol class="track-steps">
                    ${STEPS.map((s, i) => `<li class="${i < current ? 'is-done' : i === current ? 'is-current' : ''}"${i === current ? ' aria-current="step"' : ''}><span>${i + 1}</span>${s}</li>`).join('')}
                </ol>
                <div class="px-6 pb-6 text-sm leading-relaxed">
                    <p><strong>Previsão de entrega:</strong> até ${eta.toLocaleDateString('pt-BR')} (simulado).</p>
                    <p class="mt-2"><strong>Itens:</strong> ${order.items.map(i => `${esc(i.title)}${i.size ? ` (${esc(i.size)}${i.color ? `, ${esc(i.color)}` : ''})` : ''} × ${i.qty}`).join(', ')}</p>
                    <p class="mt-2"><strong>Total:</strong> ${formatPrice(order.total)} · ${esc(order.payment || '')}</p>
                </div>
            </div>`;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.add('show-errors');
        if (!form.checkValidity()) { form.querySelector(':invalid').focus(); return; }
        const key = '#TF-' + number.value.replace(/\D/g, '');
        const mail = email.value.trim().toLowerCase();
        show(readJSON(ORDERS_KEY, []).find(o => o.number === key && (o.email === mail || o.account === mail)) || null);
    });
}


// ── 10d. WhatsApp button + cookie notice ───────────────────
function initWhatsApp() {
    const btn = document.getElementById('whatsapp-btn');
    if (!btn) return;
    if (PAGE === 'checkout') { btn.remove(); return; } // keep the pay button clear
    btn.href = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('Oi, The Fato! Tenho uma dúvida sobre uma estampa.')}`;
}

const CONSENT_KEY = 'thefato-consent';

function initCookies() {
    const bar = document.getElementById('cookie-bar');
    if (!bar || readJSON(CONSENT_KEY, null)) { if (bar) bar.remove(); return; }
    const open = () => { bar.classList.remove('hidden'); document.body.classList.add('has-cookie-bar'); };
    // wait for the splash screen so both don't show at once
    if (document.documentElement.classList.contains('show-splash')) setTimeout(open, 2600); else open();
    bar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-consent]');
        if (!btn) return;
        writeJSON(CONSENT_KEY, { choice: btn.dataset.consent, date: new Date().toISOString() });
        document.body.classList.remove('has-cookie-bar');
        bar.remove();
    });
}


// ── 11. Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    renderProducts();
    markActiveNav();

    // size and favorite buttons (event delegation)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.size-btn');
        if (btn) { e.preventDefault(); selectSize(btn); }
        const fav = e.target.closest('.fav-btn[data-fav]');
        if (fav && fav.dataset.fav) {
            e.preventDefault();
            toggleFav(fav.dataset.fav);
            fav.classList.remove('pop'); void fav.offsetWidth; fav.classList.add('pop');
        }
    });

    // "choose a size" message under the size selector
    const sizes = document.querySelector('#product-view .size-btn');
    if (sizes && !document.getElementById('pv-size-error')) {
        const err = el('p', 'hidden mt-3 font-mono text-xs uppercase tracking-[0.15em] text-brand-red', 'Escolha um tamanho');
        err.id = 'pv-size-error';
        err.setAttribute('role', 'alert');
        sizes.parentElement.after(err);
    }

    // cart → checkout page
    const checkoutBtn = document.querySelector('[data-checkout]');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => { if (cart.length) location.href = 'checkout.html'; });

    // header search
    const searchBtn = document.getElementById('search-toggle');
    if (searchBtn) searchBtn.addEventListener('click', () => setSearch(searchBtn.getAttribute('aria-expanded') !== 'true'));

    // header border when the page scrolls
    const header = document.getElementById('site-header');
    const onScroll = () => { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    setSubmenu(false);

    // Esc closes the cart, dropdown and search; Tab stays inside the open cart
    document.addEventListener('keydown', (e) => {
        const drawer = document.getElementById('cart-drawer');
        if (e.key === 'Tab' && drawer && drawer.classList.contains('open')) {
            const focusables = [...drawer.querySelectorAll('a[href], button:not([disabled]), input, select')].filter(n => n.offsetParent !== null);
            if (!focusables.length) return;
            const first = focusables[0], last = focusables[focusables.length - 1];
            if (e.shiftKey && (document.activeElement === first || document.activeElement === drawer)) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            else if (!drawer.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
            return;
        }
        if (e.key !== 'Escape') return;
        const panel = document.getElementById('cart-drawer');
        if (panel && panel.classList.contains('open')) window.toggleCart(null, false);
        setSubmenu(false);
        setSearch(false);
    });

    // keep the cart in sync if another tab changes it
    window.addEventListener('storage', (e) => {
        if (e.key === CART_KEY) { cart = loadCart(); updateCartUI(); }
        if (e.key === SESSION_KEY) updateAccountUI(); // logged in/out in another tab
        if (e.key === FAV_KEY) { favs = loadFavs(); updateFavUI(); }
    });

    updateCartUI();
    updateAccountUI();
    initTracking();
    initWhatsApp();
    initCookies();
    initAccountPage();
    initProductPage();
    initCatalog();
    initCheckout();
    initFaq();
    initSizeFinder();
    updateFavUI(); // after the product page set its data-fav

    // newsletter: validate and confirm in place instead of reloading the page
    document.querySelectorAll('form.newsletter').forEach(form => {
        const input = form.querySelector('input[type="email"]');
        const msg = el('p', 'font-mono text-xs uppercase tracking-[0.15em] mt-3 hidden');
        msg.setAttribute('role', 'status');
        form.after(msg);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            msg.classList.remove('hidden');
            msg.textContent = input.checkValidity() ? 'Inscrição feita! Bem-vindo à bicharada.' : 'Digite um e-mail válido.';
            if (input.checkValidity()) form.reset();
        });
    });

    // mobile nav
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.addEventListener('click', () => {
            const open = mobileNav.classList.toggle('hidden') === false;
            mobileBtn.setAttribute('aria-expanded', String(open));
            mobileBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        });
    }
});
