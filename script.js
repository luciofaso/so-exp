// Carousel functionality
let currentIndex = 0;
const carousel = document.getElementById('carousel');
const cards = document.querySelectorAll('.formation-card');
const totalCards = cards.length;
const dotsContainer = document.getElementById('dots');
let autoScrollInterval;

function getCardsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

function getTotalPages() {
    return Math.ceil(totalCards / getCardsPerView());
}

function createDots() {
    dotsContainer.innerHTML = '';
    const totalPages = getTotalPages();
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.onclick = () => {
            goToSlide(i);
            resetAutoScroll();
        };
        dotsContainer.appendChild(dot);
    }
}

function moveCarousel(direction) {
    const totalPages = getTotalPages();
    currentIndex += direction;

    if (currentIndex < 0) currentIndex = totalPages - 1;
    if (currentIndex >= totalPages) currentIndex = 0;

    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

function updateCarousel() {
    const cardsPerView = getCardsPerView();
    const cardWidth = cards[0].offsetWidth;
    const gap = 32;
    const offset = currentIndex * (cardWidth + gap) * cardsPerView;

    carousel.style.transform = `translateX(-${offset}px)`;

    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });

    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
}

function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        moveCarousel(1);
    }, 5000);
}

function resetAutoScroll() {
    clearInterval(autoScrollInterval);
    startAutoScroll();
}

carousel.addEventListener('mouseenter', () => {
    clearInterval(autoScrollInterval);
});

carousel.addEventListener('mouseleave', () => {
    startAutoScroll();
});

createDots();
updateCarousel();
startAutoScroll();

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        currentIndex = 0;
        createDots();
        updateCarousel();
        resetAutoScroll();
    }, 250);
});

document.getElementById('prevBtn').onclick = () => {
    moveCarousel(-1);
    resetAutoScroll();
};

document.getElementById('nextBtn').onclick = () => {
    moveCarousel(1);
    resetAutoScroll();
};

// ========================================
// SUBSTACK ARTICLES LOADER (Multilingua)
// ========================================

async function loadSubstackArticles(feedUrl, containerId, locale) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error('Errore nel caricamento del feed');
        }

        const articles = data.items.slice(0, 6);

        const translations = {
            'fr': {
                readMore: 'Lire l\'article',
                errorMessage: 'Impossible de charger les articles.',
                visitBlog: 'Visitez le blog'
            },
            'it': {
                readMore: 'Leggi l\'articolo',
                errorMessage: 'Non è stato possibile caricare gli articoli.',
                visitBlog: 'Visita il blog'
            },
            'en': {
                readMore: 'Read article',
                errorMessage: 'Unable to load articles.',
                visitBlog: 'Visit blog'
            }
        };

        const t = translations[locale] || translations['en'];

        const articlesHTML = articles.map(article => {
            const date = new Date(article.pubDate);
            const formattedDate = date.toLocaleDateString(
                locale === 'fr' ? 'fr-FR' : locale === 'it' ? 'it-IT' : 'en-GB',
                { day: 'numeric', month: 'long', year: 'numeric' }
            );

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.description;
            let excerpt = tempDiv.textContent || tempDiv.innerText || '';
            excerpt = excerpt.substring(0, 150) + '...';

            return `
                <div class="article-card">
                    <div class="article-content">
                        <div class="article-date">${formattedDate}</div>
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-excerpt">${excerpt}</p>
                        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="article-link">
                            ${t.readMore}
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="articles-grid">${articlesHTML}</div>`;

    } catch (error) {
        console.error('Errore nel caricamento degli articoli:', error);
        const blogUrl = feedUrl.replace('/feed', '');
        const t = translations[locale] || translations['en'];

        container.innerHTML = `
            <div class="error-message">
                ${t.errorMessage}
                <a href="${blogUrl}" target="_blank" style="color: #2563EB; font-weight: 600;">
                    ${t.visitBlog}
                </a>
            </div>
        `;
    }
}

// Carica articoli per tutte le lingue
document.addEventListener('DOMContentLoaded', function () {
    // Francese
    if (document.getElementById('articles-container-fr')) {
        loadSubstackArticles(
            'https://sociocracyexperimentfrance.substack.com/feed',
            'articles-container-fr',
            'fr'
        );
    }

    // Italiano
    if (document.getElementById('articles-container-it')) {
        loadSubstackArticles(
            'https://sociocracyexperiment.substack.com/feed',
            'articles-container-it',
            'it'
        );
    }

    // Inglese (usa feed francese)
    if (document.getElementById('articles-container-en')) {
        loadSubstackArticles(
            'https://sociocracyexperimentfrance.substack.com/feed',
            'articles-container-en',
            'en'
        );
    }
});