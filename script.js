const WHATSAPP_NUMBER = '233598402862';

// Navbar background once the page is scrolled
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navToggle.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
};

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
});

// Reveal sections as they enter the viewport
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => revealObserver.observe(el));

    // Highlight the nav link for the section in view
    const sectionLinks = new Map();
    navLinks.querySelectorAll('a[href^="#"]:not(.btn)').forEach((link) => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) sectionLinks.set(section, link);
    });
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                sectionLinks.forEach((link) => link.classList.remove('active'));
                sectionLinks.get(entry.target).classList.add('active');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionLinks.forEach((_, section) => navObserver.observe(section));
} else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Contact form: hand the message to WhatsApp
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get('name').trim();
    const message = data.get('message').trim();

    let text = `Hi MarketiX Tech, my name is ${name}. I would like to ${data.get('topic')}.`;
    if (message) text += `\n\n${message}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    formStatus.textContent = 'WhatsApp is opening with your message. Press send there to reach us.';
});

// Hero animation: a buyer picks items, adds delivery details, pays and the order goes out
const orderFlow = document.getElementById('order-flow');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (orderFlow && !reducedMotion) {
    const title = orderFlow.querySelector('[data-flow-title]');
    const screens = [...orderFlow.querySelectorAll('.flow-screen')];
    const items = [...orderFlow.querySelectorAll('.flow-items li')];
    const count = orderFlow.querySelector('[data-flow-count]');
    const total = orderFlow.querySelector('[data-flow-total]');
    const address = orderFlow.querySelector('[data-flow-address]');
    const payOptions = [...orderFlow.querySelectorAll('[data-flow-pay]')];
    const paid = orderFlow.querySelector('[data-flow-paid]');
    const earnChip = document.querySelector('.earn-chip');
    const addressText = address.textContent;
    const titles = { items: 'Choose your items', checkout: 'Delivery and payment', done: 'Order confirmed' };

    let inView = true;
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(orderFlow);
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // Wait, then hold the animation while the phone is off screen or the tab is hidden
    const pause = async (ms) => {
        await sleep(ms);
        while (!inView || document.hidden) await sleep(400);
    };

    const show = (name) => {
        const index = screens.findIndex((screen) => screen.dataset.screen === name);
        screens.forEach((screen, i) => {
            screen.classList.toggle('is-active', i === index);
            screen.classList.toggle('is-past', i < index);
        });
        title.textContent = titles[name];
    };

    const tap = async (el) => {
        el.classList.add('is-tapped');
        await sleep(260);
        el.classList.remove('is-tapped');
    };

    const updateTotal = () => {
        const picked = items.filter((item) => item.classList.contains('is-picked'));
        count.textContent = `${picked.length} ${picked.length === 1 ? 'item' : 'items'}`;
        total.textContent = picked.reduce((sum, item) => sum + Number(item.dataset.price), 0);
    };

    const run = async () => {
        // Alternate between the payment options on each loop
        for (let cycle = 0; ; cycle++) {
            const payOption = payOptions[cycle % payOptions.length];

            // Reset
            earnChip.classList.add('is-hidden');
            items.forEach((item) => item.classList.remove('is-picked'));
            payOptions.forEach((option) => option.classList.remove('is-selected'));
            address.textContent = '';
            updateTotal();
            show('items');
            await pause(1100);

            // Pick items one by one
            for (const item of items) {
                await tap(item);
                item.classList.add('is-picked');
                updateTotal();
                await pause(650);
            }
            await tap(orderFlow.querySelector('[data-flow-continue]'));
            show('checkout');
            await pause(700);

            // Type the delivery address
            address.classList.add('is-typing');
            for (const char of addressText) {
                address.textContent += char;
                await sleep(45);
            }
            address.classList.remove('is-typing');
            await pause(500);

            // Choose payment and place the order
            await tap(payOption);
            payOption.classList.add('is-selected');
            paid.textContent = `GH₵ ${total.textContent} · ${payOption.dataset.flowPay}`;
            await pause(800);
            await tap(orderFlow.querySelector('[data-flow-place]'));
            show('done');
            await pause(900);
            earnChip.classList.remove('is-hidden');
            await pause(4200);
        }
    };

    run();
}
