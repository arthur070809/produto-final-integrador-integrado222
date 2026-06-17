/**
 * script.js — WINDSPEED RACING
 * Animações, interatividade, parallax e lógica do site
 */

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initCountdown();
    loadTeamStats();
    initInteractiveElements();
});

// ═══════════════════════════════════════════════════════════════════════════
// NAVEGAÇÃO E HAMBURGER MENU
// ═══════════════════════════════════════════════════════════════════════════

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMAÇÕES DE SCROLL
// ═══════════════════════════════════════════════════════════════════════════

function initScrollAnimations() {
    // Intersection Observer para animações ao scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = getAnimationForElement(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar todos os elementos animáveis
    document.querySelectorAll('[data-animation]').forEach(el => {
        observer.observe(el);
    });

    // Parallax effect no hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const elements = hero.querySelectorAll('.hero-blur-1, .hero-blur-2, .stars');
            elements.forEach((el, index) => {
                el.style.transform = `translateY(${scrollTop * 0.5 * (index + 1)}px)`;
            });
        });
    }

    // Fade in elements on scroll
    const fadeElements = document.querySelectorAll('.team-card, .blog-card, .stat-card, .timeline-item');
    fadeElements.forEach((el, index) => {
        el.style.animation = 'none';
        observer.observe(el);
    });
}

function getAnimationForElement(el) {
    if (el.classList.contains('team-card')) {
        return 'fadeInUp 0.8s ease-out forwards';
    }
    if (el.classList.contains('blog-card')) {
        return 'fadeInUp 0.8s ease-out forwards';
    }
    if (el.classList.contains('stat-card')) {
        return 'fadeInUp 0.8s ease-out forwards';
    }
    if (el.classList.contains('timeline-item')) {
        return 'fadeInUp 0.8s ease-out forwards';
    }
    return 'fadeInUp 0.8s ease-out forwards';
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTAGEM REGRESSIVA
// ═══════════════════════════════════════════════════════════════════════════

function initCountdown() {
    // Data do próximo GP (14 dias no futuro)
    const nextRaceDate = new Date();
    nextRaceDate.setDate(nextRaceDate.getDate() + 14);

    // Lista de GPs (simulado)
    const upcomingRaces = [
        { name: 'Grande Prêmio da Bélgica', location: 'Spa-Francorchamps', date: nextRaceDate },
        { name: 'Grande Prêmio da Holanda', location: 'Zandvoort', date: new Date(nextRaceDate.getTime() + 14 * 24 * 60 * 60 * 1000) },
        { name: 'Grande Prêmio da Itália', location: 'Monza', date: new Date(nextRaceDate.getTime() + 28 * 24 * 60 * 60 * 1000) }
    ];

    const nextGP = upcomingRaces[0];

    // Atualizar informações do próximo GP
    const gpName = document.getElementById('gp-name');
    const gpDate = document.getElementById('gp-date');
    if (gpName) gpName.textContent = nextGP.name;
    if (gpDate) gpDate.textContent = nextGP.location;

    // Atualizar contagem regressiva
    function updateCountdown() {
        const now = new Date().getTime();
        const raceTime = nextGP.date.getTime();
        const distance = raceTime - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

        if (distance < 0) {
            document.querySelector('.countdown-container').innerHTML = '<p>A corrida começou!</p>';
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ═══════════════════════════════════════════════════════════════════════════
// CARREGAR STATS DA API
// ═══════════════════════════════════════════════════════════════════════════

async function loadTeamStats() {
    try {
        // Simular dados da API
        const stats = {
            totalLaps: 1847,
            totalRaces: 12,
            wins: 2,
            podiums: 4
        };

        // Animar números
        animateCounter('stat-laps', 1847);
        animateCounter('stat-races', 12);
        animateCounter('stat-wins', 2);
        animateCounter('stat-podiums', 4);

    } catch (error) {
        console.error('Erro ao carregar stats:', error);
    }
}

function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentValue = 0;
    const increment = finalValue / 60;
    const interval = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(interval);
        }
        element.textContent = Math.floor(currentValue);
    }, 30);
}

// ═══════════════════════════════════════════════════════════════════════════
// ELEMENTOS INTERATIVOS
// ═══════════════════════════════════════════════════════════════════════════

function initInteractiveElements() {
    // Efeitos de hover nos cards
    const cards = document.querySelectorAll('.team-card, .blog-card, .stat-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = this.style.transform || '';
        });
    });

    // Adicionar efeito de glow ao passar o mouse
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        // Atualizar background gradient do body baseado na posição do mouse
        // (efeito sutil de light)
    });

    // Animação dos elementos no hero
    const neonElements = document.querySelectorAll('.neon-circle, .neon-square, .floating-box');
    neonElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.filter = 'drop-shadow(0 0 30px rgba(255, 46, 136, 0.8))';
        });
        el.addEventListener('mouseleave', function() {
            this.style.filter = '';
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ADICIONAR EFEITOS DE CLICK
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('click', (e) => {
    // Ripple effect nos botões
    if (e.target.classList.contains('btn-primary') || e.target.classList.contains('btn-secondary')) {
        const ripple = document.createElement('span');
        const rect = e.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        e.target.parentElement.insertBefore(ripple, e.target);
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// ANIMAÇÃO DE APARIÇÃO DOS NÚMEROS
// ═══════════════════════════════════════════════════════════════════════════

// Intersection Observer para animar números quando são vistos
const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const finalValue = parseInt(entry.target.textContent);
            if (!isNaN(finalValue)) {
                animateCounter(entry.target.id, finalValue);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => {
    numberObserver.observe(el);
});

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    // Press 'D' para ir para Dashboard
    if (e.key === 'd' || e.key === 'D') {
        window.location.href = 'dashboard.html';
    }

    // Press '/' para focar na busca (se tiver buscador)
    if (e.key === '/') {
        e.preventDefault();
        // Implementar busca se necessário
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO AUXILIAR: SCROLL SUAVE
// ═══════════════════════════════════════════════════════════════════════════

function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADICIONAR ÍCONES DO FONTAWESOME (fallback)
// ═══════════════════════════════════════════════════════════════════════════

// O FontAwesome já está carregado via CDN no HTML
// Apenas garantir que os ícones estão visíveis

window.addEventListener('load', () => {
    // Verificar se FontAwesome carregou
    if (typeof FontAwesomeConfig !== 'undefined') {
        console.log('FontAwesome carregado com sucesso');
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// EFEITO DE SCROLL REVELANDO ELEMENTOS
// ═══════════════════════════════════════════════════════════════════════════

const revealElements = document.querySelectorAll('.team-card, .blog-card, .stat-card, .timeline-item, .gallery-item');

const revealOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(element => {
    revealOnScroll.observe(element);
});

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE: LAZY LOADING DE IMAGENS
// ═══════════════════════════════════════════════════════════════════════════

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPORTE A SISTEMA ESCURO/CLARO (TEMA)
// ═══════════════════════════════════════════════════════════════════════════

function initTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Detectar mudanças de tema do sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

initTheme();

// ═══════════════════════════════════════════════════════════════════════════
// TRACKER DE SCROLL (BARRA DE PROGRESSO)
// ═══════════════════════════════════════════════════════════════════════════

function initScrollProgress() {
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    scrollProgress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: var(--gradient-main);
        width: 0%;
        z-index: 999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(scrollProgress);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    });
}

initScrollProgress();

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS FINAIS
// ═══════════════════════════════════════════════════════════════════════════

window.addEventListener('load', () => {
    console.log('✓ Windspeed Racing site carregado completamente');
    console.log('✓ Dica: Pressione "D" para ir ao Dashboard');
});

// Log de informações úteis
console.log('%cWINDSPEED RACING', 'font-size: 24px; font-weight: bold; color: #ff2e88; text-shadow: 0 0 10px rgba(255,46,136,0.5);');
console.log('%cDomínio através da inovação e precisão', 'font-size: 14px; color: #9aa4b2;');