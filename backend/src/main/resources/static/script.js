document.addEventListener('DOMContentLoaded', () => {
    const API = '/api/reviews';
    const FEEDBACK_API = '/api/feedback';

    let allReviews = [];
    let filteredReviews = [];
    let activeRatingFilter = 0;
    let currentIndex = 0; 
    let searchDebounceTimer = null;

    // ── DOM refs ──
    const reviewForm = document.getElementById('reviewForm');
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const navbar = document.getElementById('navbar');

    // ── Toast ──
    function showToast(msg, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast' + (isError ? ' error' : '');
        setTimeout(() => { toast.classList.add('hidden'); }, 3500);
    }

    // ── Avatar Generation ──
    function getAvatarUrl(name) {
        const encodedName = encodeURIComponent(name || 'User');
        return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&rounded=true&bold=true&size=128`;
    }

    // ── Scroll Reveal ──
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    };
    const revealObserver = new IntersectionObserver(revealCallback, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── Navbar Scroll Effect ──
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ── Animated Counter ──
    function animateCounter(id, target) {
        const el = document.getElementById(id);
        const start = 0;
        const duration = 2000;
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * (target - start) + start);
            el.textContent = current + (id === 'avgRating' ? '.0' : '');
            if (progress < 1) window.requestAnimationFrame(step);
            else el.textContent = target; // Ensure exact final value
        };
        window.requestAnimationFrame(step);
    }

    // ── Fetch All Reviews ──
    async function fetchReviews() {
        showCarouselLoading();
        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error('Network error');
            allReviews = await res.json();
            updateStatsUI(allReviews);
            applyFilters();
        } catch (e) {
            carouselTrack.innerHTML = `<div class="carousel-empty">⚠️ Server Connectivity Issue. Please verify backend status.</div>`;
        }
    }

    function showCarouselLoading() {
        carouselTrack.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Syncing encrypted feed...</p></div>`;
        carouselDots.innerHTML = '';
    }

    function updateStatsUI(reviews) {
        const total = reviews.length;
        const avg = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;
        const tours = new Set(reviews.map(r => r.houseName)).size;

        animateCounter('totalReviews', total);
        animateCounter('avgRating', avg);
        animateCounter('totalTours', tours);
    }

    // ── Filters & Search ──
    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        filteredReviews = allReviews;

        if (query) {
            filteredReviews = filteredReviews.filter(r =>
                r.houseName.toLowerCase().includes(query) ||
                r.comment?.toLowerCase().includes(query) ||
                r.userName.toLowerCase().includes(query)
            );
        }
        if (activeRatingFilter > 0) {
            filteredReviews = filteredReviews.filter(r => r.rating === activeRatingFilter);
        }

        currentIndex = 0;
        buildCarousel();
    }

    // ── Build Carousel ──
    async function buildCarousel() {
        carouselTrack.innerHTML = '';
        carouselDots.innerHTML = '';

        if (filteredReviews.length === 0) {
            carouselTrack.innerHTML = `<div class="carousel-empty">No records found matching your criteria.</div>`;
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        // Parallel fetch for replies
        const repliesData = await Promise.all(
            filteredReviews.map(async r => {
                try {
                    const res = await fetch(`${FEEDBACK_API}/review/${r.id}`);
                    return { id: r.id, data: res.ok ? await res.json() : [] };
                } catch { return { id: r.id, data: [] }; }
            })
        );
        const repliesMap = Object.fromEntries(repliesData.map(x => [x.id, x.data]));

        filteredReviews.forEach((review, i) => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const avatarUrl = getAvatarUrl(review.userName);
            const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent';

            const replies = repliesMap[review.id] || [];
            const replyBlock = replies.length > 0 ? `
                <div class="testimonial-reply">
                    <div class="testimonial-reply-label">Management Response</div>
                    <p>${replies[0].replyText}</p>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="testimonial-avatar">
                    <img src="${avatarUrl}" alt="User">
                </div>
                <div class="testimonial-name">${review.userName}</div>
                <div class="testimonial-role">${review.houseName} • ${date}</div>
                <div style="color: #fbbf24; margin-bottom: 1rem;">${stars}</div>
                <p class="testimonial-comment">"${review.comment}"</p>
                ${replyBlock}
            `;

            card.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            carouselTrack.appendChild(card);
        });

        // Dots
        filteredReviews.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.addEventListener('click', () => { currentIndex = i; updateCarousel(); });
            carouselDots.appendChild(dot);
        });

        updateCarousel();
    }

    function updateCarousel() {
        const cards = carouselTrack.querySelectorAll('.testimonial-card');
        const dots = carouselDots.querySelectorAll('.carousel-dot');
        const total = filteredReviews.length;
        if (!total) return;

        cards.forEach((c, i) => {
            c.classList.remove('active', 'side');
            if (i === currentIndex) c.classList.add('active');
            else c.classList.add('side');
        });

        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));

        const containerWidth = carouselTrack.parentElement.clientWidth;
        const cardWidth = carouselTrack.children[0]?.offsetWidth || 0;
        const gap = 32; 
        const offset = currentIndex * (cardWidth + gap) - (containerWidth / 2) + (cardWidth / 2);
        
        carouselTrack.style.transform = `translateX(-${Math.max(0, offset)}px)`;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === total - 1;
    }

    // ── Listeners ──
    prevBtn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; updateCarousel(); } });
    nextBtn.addEventListener('click', () => { if (currentIndex < filteredReviews.length - 1) { currentIndex++; updateCarousel(); } });

    searchInput.addEventListener('input', () => {
        clearSearchBtn.classList.toggle('hidden', !searchInput.value);
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(applyFilters, 400);
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeRatingFilter = parseInt(btn.dataset.rating);
            applyFilters();
        });
    });

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitText.textContent = 'Processing...';
        submitSpinner.classList.remove('hidden');

        try {
            const data = {
                userName: document.getElementById('userName').value.trim(),
                houseName: document.getElementById('houseName').value.trim(),
                rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value || 5),
                comment: document.getElementById('comment').value.trim()
            };

            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                reviewForm.reset();
                showToast('✅ Protocol Complete: Review Published.');
                await fetchReviews();
                document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
            } else throw new Error();
        } catch {
            showToast('❌ System Error: Publication failed.', true);
        } finally {
            submitBtn.disabled = false;
            submitText.textContent = 'Post Review';
            submitSpinner.classList.add('hidden');
        }
    });

    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('🚀 Transmission Successful: Support team notified.');
        e.target.reset();
    });

    window.addEventListener('resize', updateCarousel);
    fetchReviews();
});
