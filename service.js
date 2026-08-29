/* ============================================================
   LISTORA DIGITAL MEDIA — Services Page JavaScript
   ============================================================
   Features:
   0. Mobile Drawer & Sticky Navbar (unified)
   1. Scroll Reveal (fade-up on scroll)
   2. FAQ Accordion (open / close)
   3. Interactive Timeline (active step on scroll)
   4. Floating card hover enhancements
   5. Button ripple effect
   6. Counting number animation for stat cards
   ============================================================ */


/* ─────────────────────────────────────────────────────
   0. MOBILE DRAWER (unified navbar)
───────────────────────────────────────────────────── */
(function initDrawer() {
    var overlay  = document.getElementById('navOverlay');
    var drawer   = document.getElementById('navDrawer');
    var menuBtn  = document.getElementById('menuBtn');
    var closeBtn = document.getElementById('drawerCloseBtn');

    if (!overlay || !drawer || !menuBtn) return;

    function openDrawer() {
        drawer.classList.add('is-open');
        overlay.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('drawer-open');
        if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
        drawer.classList.remove('is-open');
        overlay.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
        menuBtn.focus();
    }

    menuBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDrawer();
    });

    document.querySelectorAll('.drawer-link').forEach(function(link) {
        link.addEventListener('click', closeDrawer);
    });
})();


/* ─────────────────────────────────────────────────────
   STICKY NAVBAR
───────────────────────────────────────────────────── */
(function initNavbar() {
    var nav = document.getElementById('ctNav');
    if (!nav) return;

    var scrolled = false;

    function onScroll() {
        var shouldScroll = window.scrollY > 40;
        if (shouldScroll === scrolled) return;
        scrolled = shouldScroll;
        nav.classList.toggle('scrolled', scrolled);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();


/* ─────────────────────────────────────────────────────
   1. SCROLL REVEAL
   Elements with class "reveal" fade in when visible
───────────────────────────────────────────────────── */
function setupScrollReveal() {

  // Select all elements that should animate on scroll
  const revealElements = document.querySelectorAll('.reveal');

  // Skip if browser doesn't support IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    revealElements.forEach(function(el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop watching once revealed
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,       // Trigger when 12% is visible
      rootMargin: '0px 0px -40px 0px'  // Trigger slightly before bottom
    }
  );

  revealElements.forEach(function(el) {
    observer.observe(el);
  });
}


/* ─────────────────────────────────────────────────────
   2. FAQ ACCORDION
   Click a question to expand/collapse the answer
───────────────────────────────────────────────────── */
function setupFAQ() {

  const faqButtons = document.querySelectorAll('.faq-q');

  faqButtons.forEach(function(button) {

    button.addEventListener('click', function() {
      const isOpen     = this.getAttribute('aria-expanded') === 'true';
      const answerEl   = this.nextElementSibling; // The .faq-a div

      // Close ALL other open items first
      faqButtons.forEach(function(otherBtn) {
        otherBtn.setAttribute('aria-expanded', 'false');
        const otherAnswer = otherBtn.nextElementSibling;
        if (otherAnswer) {
          otherAnswer.classList.remove('open');
        }
      });

      // If this one was closed, open it now
      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        if (answerEl) {
          answerEl.classList.add('open');
        }
      }
    });
  });
}


/* ─────────────────────────────────────────────────────
   3. INTERACTIVE TIMELINE
   Highlight the active step as user scrolls through it
───────────────────────────────────────────────────── */
function setupTimeline() {

  const steps = document.querySelectorAll('.timeline-step');

  if (!steps.length) return;
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Remove active from all
          steps.forEach(function(s) { s.classList.remove('active'); });
          // Add active to the intersecting step
          entry.target.classList.add('active');
        }
      });
    },
    {
      threshold: 0.5,           // When 50% of the step is visible
      rootMargin: '-10% 0px -40% 0px'
    }
  );

  steps.forEach(function(step) {
    observer.observe(step);
  });
}


/* ─────────────────────────────────────────────────────
   4. BUTTON RIPPLE EFFECT
   Create a visual ripple on button click
───────────────────────────────────────────────────── */
function setupButtonRipple() {

  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      // Create the ripple element
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        width: 80px;
        height: 80px;
        transform: scale(0);
        animation: rippleGrow 0.5s ease-out forwards;
        pointer-events: none;
        left: ${e.offsetX - 40}px;
        top: ${e.offsetY - 40}px;
        z-index: 10;
      `;

      button.appendChild(ripple);

      // Remove ripple element after animation completes
      setTimeout(function() {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });
  });

  // Inject the ripple keyframe if not already in CSS
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleGrow {
        from { transform: scale(0); opacity: 1; }
        to   { transform: scale(3); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}


/* ─────────────────────────────────────────────────────
   5. COUNTING NUMBER ANIMATION
   Animates the stat numbers in the hero cards
───────────────────────────────────────────────────── */
function animateCounter(element, target, suffix, duration) {
  let start = 0;
  const step = (target / duration) * 16; // 60fps

  const timer = setInterval(function() {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    element.textContent = Math.round(start) + suffix;
  }, 16);
}

function setupCounters() {

  const counters = [
    { selector: '.stat-card--1 .stat-num', target: 340, suffix: '%' },
    { selector: '.stat-card--2 .stat-num', target: 200, suffix: '+' },
  ];

  if (!('IntersectionObserver' in window)) return;

  counters.forEach(function(item) {
    const el = document.querySelector(item.selector);
    if (!el) return;

    const observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            animateCounter(el, item.target, item.suffix, 1200);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
  });
}


/* ─────────────────────────────────────────────────────
   7. CARD TILT EFFECT ON HOVER
   Subtle 3D tilt for service cards
───────────────────────────────────────────────────── */
function setupCardTilt() {

  // Only enable on desktop to avoid touch issues
  if (window.innerWidth <= 1024) return;

  const tiltCards = document.querySelectorAll('.core-card, .why-card, .pkg-card');

  tiltCards.forEach(function(card) {

    card.addEventListener('mousemove', function(e) {
      const rect    = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const dx      = (e.clientX - centerX) / (rect.width  / 2);
      const dy      = (e.clientY - centerY) / (rect.height / 2);
      const tilt    = 5; // Max degrees

      card.style.transform =
        `translateY(-8px) rotateX(${-dy * tilt}deg) rotateY(${dx * tilt}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
      card.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
}


/* ─────────────────────────────────────────────────────
   8. IMAGE PLACEHOLDER HANDLING
   If images don't exist, show a styled placeholder
───────────────────────────────────────────────────── */
function handleMissingImages() {

  const images = document.querySelectorAll('img');

  images.forEach(function(img) {
    img.addEventListener('error', function() {
      // Apply a placeholder gradient background
      this.style.background = 'linear-gradient(135deg, #e8eef8 0%, #f3f5fa 100%)';
      this.style.minHeight  = '200px';
      this.removeAttribute('src');

      // Add a placeholder icon overlay
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(3,43,102,0.2);
        font-size: 48px;
      `;
      placeholder.innerHTML = '<i class="fa-regular fa-image"></i>';

      // Only add if parent is position relative/absolute
      if (this.parentElement) {
        this.parentElement.style.position = 'relative';
        this.parentElement.appendChild(placeholder);
      }
    });
  });
}



/* ─────────────────────────────────────────────────────
   INITIALISE EVERYTHING
   Run all functions when the page has loaded
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {

  setupScrollReveal();
  setupFAQ();
  setupTimeline();
  setupButtonRipple();
  setupCounters();
  setupSectionTracking();
  setupCardTilt();
  handleMissingImages();
  setupHeroEntrance();

  console.log('Listora Digital Media — Services page loaded ✓');
});


/* =====================================================
   TEXT ANIMATION SYSTEM — Service Page
   ===================================================== */
(function initTextAnimations() {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
        document.querySelectorAll('.txt-hero-word,.txt-section-word,.txt-para-word,.txt-badge-anim')
            .forEach(function(el) { el.classList.add('txt-in'); el.style.opacity = '1'; });
        return;
    }

    function splitWords(el, cls) {
        if (el.dataset.txtSplit) return;
        el.dataset.txtSplit = '1';
        var nodes = Array.from(el.childNodes);
        el.innerHTML = '';
        nodes.forEach(function(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent.split(/(\s+)/).forEach(function(chunk) {
                    if (!chunk.trim()) {
                        el.appendChild(document.createTextNode(chunk));
                    } else {
                        var s = document.createElement('span');
                        s.className = 'txt-word ' + cls;
                        s.setAttribute('aria-hidden', 'true');
                        s.textContent = chunk;
                        el.appendChild(s);
                    }
                });
            } else {
                el.appendChild(node.cloneNode(true));
            }
        });
        if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.trim());
    }

    /* ── HERO heading ── */
    var heroH1 = document.querySelector('.hero-headline');
    if (heroH1) {
        splitWords(heroH1, 'txt-hero-word');
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                heroH1.querySelectorAll('.txt-hero-word').forEach(function(w, i) {
                    w.style.transitionDelay = (i * 65) + 'ms';
                    w.classList.add('txt-in');
                });
            });
        });
    }

    /* ── Section headings ── */
    var headingEls = document.querySelectorAll([
        '.section-title',
        '.core-card__title',
        '.ops-card__header h3',
        '.why-card h3',
        '.pkg-card__header h3',
        '.timeline-card h3',
        '.alt-block__content h3',
        '.websites-content h2',
        '.tl-step-num'
    ].join(','));

    var headingObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            var words = entry.target.querySelectorAll('.txt-section-word');
            words.forEach(function(w, i) {
                w.style.transitionDelay = (i * 55) + 'ms';
                w.classList.add('txt-in');
            });
            headingObs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    headingEls.forEach(function(el) {
        splitWords(el, 'txt-section-word');
        headingObs.observe(el);
    });

    /* ── Paragraphs ── */
    var paraEls = document.querySelectorAll([
        '.hero-sub',
        '.section-sub',
        '.core-card__desc',
        '.ops-card > p',
        '.why-card p',
        '.pkg-card__header p',
        '.timeline-card p',
        '.alt-block__content p',
        '.websites-desc',
        '.hero-trust span'
    ].join(','));

    var paraObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            var words = entry.target.querySelectorAll('.txt-para-word');
            words.forEach(function(w, i) {
                w.style.transitionDelay = (i * 40) + 'ms';
                w.classList.add('txt-in');
            });
            paraObs.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    paraEls.forEach(function(el) {
        splitWords(el, 'txt-para-word');
        paraObs.observe(el);
    });

    var heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
        paraObs.unobserve(heroSub);
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                heroSub.querySelectorAll('.txt-para-word').forEach(function(w, i) {
                    w.style.transitionDelay = (520 + i * 40) + 'ms';
                    w.classList.add('txt-in');
                });
            });
        });
    }

    /* ── Badges ── */
    var badgeEls = document.querySelectorAll([
        '.section-label',
        '.core-card__badge',
        '.tl-tags span',
        '.service-tag',
        '.pkg-tier'
    ].join(','));

    var badgeObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('txt-badge-in');
            badgeObs.unobserve(entry.target);
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });

    badgeEls.forEach(function(el) {
        el.classList.add('txt-badge-anim');
        badgeObs.observe(el);
    });

})();
