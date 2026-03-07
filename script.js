document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // --- Smooth Scrolling for Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 75; // navbar height offset
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu on click
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // --- Glitch Text Effect ---
    // Removed to stop flickering on the text below the logo

    // --- Image Carousel ---
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    let currentIndex = 0;

    function getVisibleSlidesCount() {
        return window.innerWidth <= 768 ? 1 : 3;
    }

    function updateCarousel() {
        const slideWidth = document.querySelector('.carousel-slide').clientWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    nextBtn.addEventListener('click', () => {
        const visibleSlides = getVisibleSlidesCount();
        const maxIndex = slides.length - visibleSlides;
        currentIndex++;
        if (currentIndex > maxIndex) {
            currentIndex = 0; // Loop back
        }
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        const visibleSlides = getVisibleSlidesCount();
        const maxIndex = slides.length - visibleSlides;
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = maxIndex; // Loop to end
        }
        updateCarousel();
    });

    // Handle resize
    window.addEventListener('resize', () => {
        const visibleSlides = getVisibleSlidesCount();
        const maxIndex = slides.length - visibleSlides;
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        updateCarousel();
    });

    // Touch Events for Carousel Swiping
    let startX = 0;
    let endX = 0;
    const carouselContainer = document.querySelector('.carousel-container');

    carouselContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    carouselContainer.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', () => {
        if (!startX || !endX) return;

        const threshold = 50; // Minimum swipe distance
        if (startX - endX > threshold) {
            // Swipe left (next slide)
            nextBtn.click();
        } else if (endX - startX > threshold) {
            // Swipe right (previous slide)
            prevBtn.click();
        }

        // Reset values
        startX = 0;
        endX = 0;

        // Restart autoplay to prevent immediate slide after interaction
        resetAutoplay();
    });

    // Auto-play Carousel
    let autoplayTimer;

    function startAutoplay() {
        autoplayTimer = setInterval(() => {
            const visibleSlides = getVisibleSlidesCount();
            const maxIndex = slides.length - visibleSlides;
            currentIndex++;
            if (currentIndex > maxIndex) {
                currentIndex = 0;
            }
            updateCarousel();
        }, 5000); // 5 seconds per slide
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        startAutoplay();
    }

    // Attach reset to manual buttons too
    nextBtn.addEventListener('click', resetAutoplay);
    prevBtn.addEventListener('click', resetAutoplay);

    startAutoplay();

    // --- Spark Particles Background ---
    const canvas = document.getElementById('sparks-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const sparks = [];
        const maxSparks = 80; // Reasonable amount for mobile performance

        class Spark {
            constructor() {
                this.reset();
                // Randomize initial Y position so they don't all start at the bottom
                this.y = Math.random() * canvas.height;
            }

            update() {
                this.y -= this.speedY; // Move up
                this.x += this.speedX; // Move sideways
                this.opacity -= 0.003 * this.speedY; // Slowly fade out depending on speed

                // Horizontal wiggle effect simulating wind/heat convection
                this.x += Math.sin(this.y * 0.05) * 0.5;

                // Reset spark if it goes out of upper bounds or becomes invisible
                if (this.opacity <= 0 || this.y < -10) {
                    this.reset();
                }
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 20;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * 1.5 + 0.3; // Floating up
                this.speedX = (Math.random() - 0.5) * 0.8; // Horizontal drift

                // Rust / fire colors
                const hue = Math.floor(Math.random() * 40 + 10); // 10-50: orange to yellow
                const lightness = Math.floor(Math.random() * 40 + 50); // 50%-90%
                this.color = `hsl(${hue}, 100%, ${lightness}%)`;

                this.opacity = Math.random() * 0.7 + 0.3;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
            }
        }

        for (let i = 0; i < maxSparks; i++) {
            sparks.push(new Spark());
        }

        function animateSparks() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'screen'; // Looks better for fire/glow

            sparks.forEach(spark => {
                spark.update();
                spark.draw();
            });

            requestAnimationFrame(animateSparks);
        }

        animateSparks();
    }

    // --- Lightbox Functionality ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const screenshotImages = document.querySelectorAll('.slide-content img');

    if (lightbox && lightboxImg && lightboxClose) {
        // Open lightbox
        screenshotImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                // Optional: Stop carousel while viewing
                clearInterval(autoplayTimer);
            });
        });

        // Close lightbox function
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            setTimeout(() => {
                lightboxImg.src = ''; // Clear source after transition
            }, 300);
            resetAutoplay(); // Resume carousel play
        };

        // Close on 'X' click
        lightboxClose.addEventListener('click', closeLightbox);

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
