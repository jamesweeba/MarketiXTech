// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Reveal on scroll animation
const revealElements = document.querySelectorAll('[data-reveal]');
const revealOnScroll = () => {
    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight * 0.85) {
            el.classList.add('active');
        }
    });
};

// Initial check and scroll event
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active link highlighting
const sections = document.querySelectorAll('section, header');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id') || '';
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current) && current !== '') {
            link.style.color = 'var(--primary)';
        } else {
            link.style.color = 'var(--text-main)';
        }
    });
});

// Initialize Typing Effect
if (document.getElementById('typed')) {
    new Typed('#typed', {
        strings: [
            'Smart AI Chatbots Delivered via WhatsApp',
            'Smart Workflow Automation Delivered via WhatsApp',
            'Smart Custom Software Delivered via WhatsApp'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// Initialize 3D Tilt Effect
VanillaTilt.init(document.querySelectorAll(".glass-card, .step-card"), {
    max: 10,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
});

// Custom Cursor Logic
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline with slight delay/smoothness
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Pricing Toggle Logic
const billingToggle = document.getElementById('billing-toggle');
const priceAmounts = document.querySelectorAll('.amt');

if (billingToggle) {
    billingToggle.addEventListener('change', () => {
        priceAmounts.forEach(amt => {
            if (billingToggle.checked) {
                amt.innerText = amt.getAttribute('data-yearly');
            } else {
                amt.innerText = amt.getAttribute('data-monthly');
            }
        });
    });
}

// Hover effects for cursor
document.querySelectorAll('a, button, .glass-card, .faq-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.borderColor = 'white';
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.borderColor = 'var(--primary)';
    });
});
