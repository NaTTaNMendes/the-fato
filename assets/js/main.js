/* ═══════════════════════════════════════════════════════════
   THE FATO v3.0 — THREE.JS 3D BACKGROUND & ANIMATIONS
   ═══════════════════════════════════════════════════════════ */

// ── 1. Smooth Scroll (Lenis) ───────────────────────────────
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);


// ── 2. Cinematic 3D Background (Three.js) ──────────────────
let scrollY = 0;
let targetScrollY = 0;

window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
});

document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Dark Faceted Torus Knot
    const geometry = new THREE.TorusKnotGeometry(9, 2.5, 128, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0x0a0303,
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true // Makes it look edgy/modern
    });
    const knot = new THREE.Mesh(geometry, material);
    group.add(knot);

    // Red Wireframe Aura (Additive Blending for Fake Bloom)
    const wireGeo = new THREE.TorusKnotGeometry(9.3, 2.5, 128, 16);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xff3b30,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });
    const wireKnot = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireKnot);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff3b30, 5, 50);
    redLight.position.set(10, 10, 10);
    scene.add(redLight);

    const redLight2 = new THREE.PointLight(0xff0000, 3, 50);
    redLight2.position.set(-10, -10, 10);
    scene.add(redLight2);

    const clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    });

    function animate3D() {
        requestAnimationFrame(animate3D);
        const elapsedTime = clock.getElapsedTime();

        // Smooth scroll interpolation
        scrollY += (targetScrollY - scrollY) * 0.05;

        // SCROLL JACKING THE 3D MODEL
        // The further you scroll, the more it rotates!
        group.rotation.y = scrollY * 0.001 + (mouseX * 0.5);
        group.rotation.x = scrollY * 0.0005 + (mouseY * 0.5);
        
        // Base idle animation
        knot.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;
        wireKnot.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;

        // Floating effect
        group.position.y = Math.sin(elapsedTime) * 0.5;

        renderer.render(scene, camera);
    }
    animate3D();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});


// ── 3. Magnetic Buttons ────────────────────────────────────
document.querySelectorAll('.magnetic-wrap').forEach(wrap => {
    const btn = wrap.querySelector('.btn-magnet');
    wrap.addEventListener('mousemove', (e) => {
        const position = wrap.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;
        gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.5, ease: "power3.out" });
    });
    wrap.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
});


// ── 4. VanillaTilt for 3D Cards ────────────────────────────
VanillaTilt.init(document.querySelectorAll(".js-tilt"), {
    max: 15, speed: 400, glare: true, "max-glare": 0.2, perspective: 1000, scale: 1.02
});


// ── 5. GSAP Animations (Bold Reveals) ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
    
    // Aggressive Hero Reveal
    const heroTl = gsap.timeline();
    heroTl.to('.gs-hero-clip > *', {
        y: '0%', duration: 1.5, ease: "expo.out", stagger: 0.15, delay: 0.2
    }).to('.gs-hero-fade', {
        opacity: 1, y: 0, duration: 1, ease: "power3.out"
    }, "-=1.0");

    // Scroll Parallax for Images
    gsap.utils.toArray('.gs-parallax').forEach(section => {
        const speed = section.dataset.speed || 0.4;
        gsap.to(section, {
            y: () => (window.innerHeight * speed),
            ease: "none",
            scrollTrigger: { trigger: section.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    // Content Reveals on Scroll
    gsap.utils.toArray('.gs-reveal').forEach(elem => {
        gsap.fromTo(elem, 
            { autoAlpha: 0, y: 60, scale: 0.95 }, 
            {
                autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out",
                scrollTrigger: { trigger: elem, start: "top 85%", toggleActions: "play none none reverse" }
            }
        );
    });
});


// ── 6. Cart Logic ──────────────────────────────────────────
let cart = [];
const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;

window.toggleCart = function(e) {
    if (e) e.preventDefault();
    const panel = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (panel.classList.contains('open')) {
        panel.classList.remove('open'); overlay.classList.remove('active'); lenis.start();
    } else {
        panel.classList.add('open'); overlay.classList.add('active'); lenis.stop();
    }
}

window.addToCart = function(title, price, image) {
    cart.push({ title, price, image }); updateCartUI(); window.toggleCart();
}

window.removeFromCart = function(index) {
    cart.splice(index, 1); updateCartUI();
}

function updateCartUI() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = cart.length;
        gsap.fromTo(badge, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
    }

    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center text-muted text-xs uppercase tracking-widest mt-10">Carrinho vazio</div>`;
        document.getElementById('cart-total').innerText = 'R$ 0,00';
        return;
    }

    let total = 0; container.innerHTML = '';
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/10 relative">
                <img src="${item.image}" class="w-16 h-20 object-cover rounded-md" alt="${item.title}">
                <div class="flex-1">
                    <h4 class="font-display text-lg text-bone uppercase">${item.title}</h4>
                    <p class="text-[var(--c-accent)] text-sm font-bold">${formatPrice(item.price)}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-muted hover:text-[var(--c-accent)] p-2 absolute top-2 right-2">✕</button>
            </div>`;
    });
    document.getElementById('cart-total').innerText = formatPrice(total);
}
