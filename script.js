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

// Articles loading from Substack
async function loadSubstackArticles() {
    const container = document.getElementById('articles-container');
    const feedUrl = 'https://sociocracyexperiment-fr.substack.com/feed';

    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error('Erreur nel caricamento del feed');
        }

        const articles = data.items.slice(0, 6);

        const articlesHTML = articles.map(article => {
            const date = new Date(article.pubDate);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

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
                            Lire l'article
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="articles-grid">${articlesHTML}</div>`;

    } catch (error) {
        console.error('Erreur nel caricamento degli articoli:', error);
        container.innerHTML = `
            <div class="error-message">
                Impossible de charger les articles. 
                <a href="https://sociocracyexperimentfrance.substack.com" target="_blank" style="color: #2563EB; font-weight: 600;">
                    Visitez le blog
                </a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadSubstackArticles);