/* ==============================================
   LISTORA DIGITAL MEDIA — demo.js
   Premium interactions & animations
   ============================================== */

'use strict';

/* ==============================================
   1. REDUCED MOTION DETECTION
   Respect user accessibility preferences
   ============================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ==========================
// MOBILE DETECTION HELPER
// ==========================

function isMobileDevice() {
    return window.innerWidth < 768;
}


// ==========================
// MOBILE DRAWER (handled by drawer.js)
// ==========================

// ==========================
// STICKY NAVBAR (handled by inline script in about.html)
// ==========================



// ==========================
// SMOOTH SCROLL
// ==========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#" || targetId.length <= 1) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});


/* ==============================================
   3. SCROLL PROGRESS BAR
   Thin orange bar at top of page
   ============================================== */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'height:3px',
    'width:0%',
    'background:#F97316',
    'z-index:9999',
    'transition:width 0.1s linear',
    'pointer-events:none'
  ].join(';');
  document.body.appendChild(bar);

  window.addEventListener('scroll', function () {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = progress + '%';
  }, { passive: true });
})();


/* ==============================================
   4. INTERSECTION OBSERVER — Reveal on scroll
   Fade + slide-up for sections and staggered children
   ============================================== */
(function initScrollReveal() {
  if (prefersReducedMotion) return;

  /* Elements to observe */
  const revealSelectors = [
    '.hero-content',
    '.hero-image-wrap',
    '.about-images',
    '.about-content',
    '.story-content',
    '.story-image-wrap',
    '.mission-block',
    '.logo-meaning-block',
    '.logo-meaning-center',
    '.why-content',
    '.why-image-wrap',
    '.value-block',
    '.process-step',
    '.story-quote',
    '.footer-col'
  ];

  /* Base hidden state injected via style (avoids flash of unstyled content) */
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .will-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                  transform 0.65s cubic-bezier(0.22,1,0.36,1);
    }
    .will-reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(styleTag);

  /* Mark elements */
  revealSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('will-reveal');
    });
  });

  /* Staggered children in grids */
  const staggerParents = [
    '.values-grid',
    '.process-timeline',
    '.logo-grid',
    '.why-checklist',
    '.mission-inner'
  ];

  staggerParents.forEach(function (parentSel) {
    const parent = document.querySelector(parentSel);
    if (!parent) return;
    Array.from(parent.children).forEach(function (child, i) {
      child.classList.add('will-reveal');
      child.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  /* Observer */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // fire once only
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.will-reveal').forEach(function (el) {
    observer.observe(el);
  });
})();


/* ==============================================
   5. HERO SECTION — Entrance animation on load
   ============================================== */
(function initHeroEntrance() {
  if (prefersReducedMotion) return;

  const heroContent = document.querySelector('.hero-content');
  const heroImage   = document.querySelector('.hero-image-wrap');

  if (heroContent) {
    heroContent.style.opacity   = '0';
    heroContent.style.transform = 'translateY(32px)';
    heroContent.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';

    requestAnimationFrame(function () {
      setTimeout(function () {
        heroContent.style.opacity   = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 120);
    });
  }

  if (heroImage) {
    heroImage.style.opacity   = '0';
    heroImage.style.transform = 'translateY(32px)';
    heroImage.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s';

    requestAnimationFrame(function () {
      setTimeout(function () {
        heroImage.style.opacity   = '1';
        heroImage.style.transform = 'translateY(0)';
      }, 120);
    });
  }
})();


/* ==============================================
   6. SMOOTH ANCHOR SCROLLING
   Offset for fixed navbar height
   ============================================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href   = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.querySelector('.navbar')
        ? document.querySelector('.navbar').offsetHeight
        : 70;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();




/* ==============================================
   8. BUTTON MICRO-INTERACTIONS
   Subtle press effect on primary buttons
   ============================================== */
(function initButtonEffects() {
  document.querySelectorAll('.btn, .subscribe-btn, #sub-btn').forEach(function (btn) {
    btn.addEventListener('mousedown', function () {
      btn.style.transform = 'translateY(1px) scale(0.98)';
    });
    btn.addEventListener('mouseup', function () {
      btn.style.transform = '';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });
})();


/* ==============================================
   9. VALUE BLOCK HOVER GLOW
   Enhance the existing CSS hover with a glow shadow
   ============================================== */
(function initValueHover() {
  document.querySelectorAll('.value-block').forEach(function (block) {
    block.addEventListener('mouseenter', function () {
      block.style.boxShadow = '0 16px 40px rgba(249,115,22,0.12)';
    });
    block.addEventListener('mouseleave', function () {
      block.style.boxShadow = '';
    });
  });
})();


/* ==============================================
   10. PROCESS STEP HOVER — highlight connector
   ============================================== */
(function initProcessHover() {
  document.querySelectorAll('.process-step').forEach(function (step) {
    const icon = step.querySelector('.process-icon');
    if (!icon) return;

    step.addEventListener('mouseenter', function () {
      icon.style.background     = '#FFF4ED';
      icon.style.borderColor    = '#F97316';
      icon.style.transform      = 'scale(1.08)';
      icon.style.transition     = 'transform 0.25s ease, border-color 0.25s ease';
    });
    step.addEventListener('mouseleave', function () {
      icon.style.transform      = 'scale(1)';
      icon.style.borderColor    = '#FED7AA';
    });
  });
})();


/* ==============================================
   11. NEWSLETTER FORM — email validation + feedback
   ============================================== */
(function initNewsletter() {
  const emailInput = document.getElementById('about-email');
  const subBtn     = document.getElementById('about-sub-btn');
  const msgEl      = document.getElementById('about-msg');
  if (!emailInput || !subBtn) return;

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function showMessage(text, type) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className   = 'newsletter-msg ' + type;
  }

  subBtn.addEventListener('click', function () {
    const value = emailInput.value.trim();

    if (!value) {
      showMessage('Please enter your email address.', 'err');
      emailInput.focus();
      return;
    }
    if (!isValidEmail(value)) {
      showMessage('Please enter a valid email address.', 'err');
      emailInput.focus();
      return;
    }

    /* Simulate submission */
    subBtn.disabled       = true;
    subBtn.style.opacity  = '0.7';
    showMessage('Sending...', '');

    setTimeout(function () {
      showMessage('Thank you! We\'ll be in touch soon.', 'ok');
      emailInput.value  = '';
      subBtn.disabled   = false;
      subBtn.style.opacity = '1';
    }, 900);
  });

  /* Allow submit with Enter key */
  emailInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') subBtn.click();
  });
})();


/* ==============================================
   12. LOGO ICON HOVER LIFT
   Gentle lift on logo-meaning-block icons
   ============================================== */
(function initLogoIconHover() {
  document.querySelectorAll('.logo-meaning-block').forEach(function (block) {
    const icon = block.querySelector('.logo-icon');
    if (!icon) return;

    block.addEventListener('mouseenter', function () {
      icon.style.transform  = 'translateY(-4px)';
      icon.style.transition = 'transform 0.3s ease';
    });
    block.addEventListener('mouseleave', function () {
      icon.style.transform  = 'translateY(0)';
    });
  });
})();


/* ==============================================
   13. MISSION BLOCK HOVER GLOW
   ============================================== */
(function initMissionHover() {
  document.querySelectorAll('.mission-block').forEach(function (block) {
    block.addEventListener('mouseenter', function () {
      block.style.transition  = 'box-shadow 0.3s ease';
      block.style.boxShadow   = '0 8px 32px rgba(249,115,22,0.08)';
      block.style.borderRadius = '16px';
    });
    block.addEventListener('mouseleave', function () {
      block.style.boxShadow   = '';
    });
  });
})();

// ─────────────────────────────────────────
// 1. DRAW CURVED DASHED LINES
// ─────────────────────────────────────────

function drawLines() {

  const svg    = document.getElementById('ecosystemLines');
  const center = document.getElementById('logoCenter');
  const grid   = document.getElementById('ecosystemGrid');

  // Only draw on desktop (wider than 900px)
  if (window.innerWidth <= 900) {
    svg.innerHTML = '';
    return;
  }

  // Get bounding rectangles relative to the page
  const sectionRect = svg.closest('.logo-section').getBoundingClientRect();
  const centerRect  = center.getBoundingClientRect();

  // Center point of the logo
  const cx = centerRect.left - sectionRect.left + centerRect.width  / 2;
  const cy = centerRect.top  - sectionRect.top  + centerRect.height / 2;

  // All cards to connect
  const cardIds = ['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6'];

  // Clear previous lines
  svg.innerHTML = '';

  cardIds.forEach(function(id) {

    const card     = document.getElementById(id);
    const cardRect = card.getBoundingClientRect();

    // Card center point
    const cardX = cardRect.left - sectionRect.left + cardRect.width  / 2;
    const cardY = cardRect.top  - sectionRect.top  + cardRect.height / 2;

    // Control point for the curve (midpoint, pulled slightly inward)
    const cpX = (cx + cardX) / 2;
    const cpY = (cy + cardY) / 2 - 30;  // Pull curve upward a bit

    // Build the SVG path string (quadratic Bezier curve)
    const pathData = `M ${cx} ${cy} Q ${cpX} ${cpY} ${cardX} ${cardY}`;

    // Create <path> element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#1a2b5e');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-dasharray', '6 5');   // Dashed pattern: 6px dash, 5px gap
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.25');

    // Animate the line drawing in
    const length = 600; // approx path length
    path.style.strokeDashoffset = length;
    path.style.transition = 'stroke-dashoffset 1.2s ease 0.8s';

    // Arrow at the end of the line
    const markerId = 'arrow-' + id;
    const defs     = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker   = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');

    const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowHead.setAttribute('d', 'M0,0 L0,6 L8,3 z');
    arrowHead.setAttribute('fill', '#1a2b5e');
    arrowHead.setAttribute('opacity', '0.4');

    marker.appendChild(arrowHead);
    defs.appendChild(marker);
    svg.appendChild(defs);

    path.setAttribute('marker-end', `url(#${markerId})`);

    svg.appendChild(path);

    // Trigger animation after a tiny delay (so CSS transition fires)
    requestAnimationFrame(function() {
      setTimeout(function() {
        path.style.strokeDashoffset = '0';
      }, 50);
    });

  });
}


// ─────────────────────────────────────────
// 2. REDRAW ON RESIZE (debounced)
// ─────────────────────────────────────────

let resizeTimer;

window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawLines, 150);
});


// ─────────────────────────────────────────
// 3. SCROLL REVEAL
//    Cards fade in when they enter the viewport
// ─────────────────────────────────────────

function setupScrollReveal() {

  // We only run this if the browser supports IntersectionObserver
  if (!('IntersectionObserver' in window)) return;

  const cards = document.querySelectorAll('.logo-card');

  const observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Add a class to trigger CSS animations
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    {
      threshold: 0.15  // Trigger when 15% of the card is visible
    }
  );

  cards.forEach(function(card) {
    observer.observe(card);
  });
}


// ─────────────────────────────────────────
// 4. SUBTLE CARD TILT ON MOUSE MOVE
//    Each card tilts slightly toward the cursor
// ─────────────────────────────────────────

function setupCardTilt() {

  // Only on desktop
  if (window.innerWidth <= 900) return;

  const cards = document.querySelectorAll('.logo-card');

  cards.forEach(function(card) {

    card.addEventListener('mousemove', function(e) {
      const rect   = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;

      // How far from center (−1 to 1)
      const dx = (e.clientX - centerX) / (rect.width  / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);

      // Max tilt in degrees
      const maxTilt = 6;

      card.style.transform =
        `translateY(-6px) rotateY(${dx * maxTilt}deg) rotateX(${-dy * maxTilt}deg)`;
    });

    card.addEventListener('mouseleave', function() {
      // Reset to normal hover state
      card.style.transform = '';
    });

  });
}


// ─────────────────────────────────────────
// 5. LOGO GENTLE PARALLAX on mouse move
// ─────────────────────────────────────────

function setupLogoParallax() {

  if (window.innerWidth <= 900) return;

  const logoCenter = document.getElementById('logoCenter');

  document.addEventListener('mousemove', function(e) {
    const cx   = window.innerWidth  / 2;
    const cy   = window.innerHeight / 2;
    const dx   = (e.clientX - cx) / cx;   // −1 to 1
    const dy   = (e.clientY - cy) / cy;   // −1 to 1
    const move = 8; // max px movement

    // Keep the float animation base, add subtle parallax on top
    logoCenter.style.marginLeft = `${dx * move}px`;
    logoCenter.style.marginTop  = `${dy * move}px`;
  });
}


// ─────────────────────────────────────────
// 6. INIT — Run everything on page load
// ─────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
  drawLines();
  setupScrollReveal();
  setupCardTilt();
  setupLogoParallax();
});


/* =====================================================
   TEXT ANIMATION SYSTEM — About Page
   ===================================================== */
(function initTextAnimations() {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
        document.querySelectorAll('.txt-hero-word,.txt-section-word,.txt-para-word,.txt-badge-anim')
            .forEach(function(el) { el.classList.add('txt-in'); el.style.opacity = '1'; });
        return;
    }

    /* ── word splitter ── */
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

    /* ── HERO heading — fires on load ── */
    var heroH1 = document.querySelector('.hero-heading');
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

    /* ── Section headings — IntersectionObserver ── */
    var headingEls = document.querySelectorAll([
        '.section-heading',
        '.section-title',
        '.mission-heading',
        '.value-title',
        '.process-title',
        '.card-title'
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

    /* ── Paragraphs — IntersectionObserver ── */
    var paraEls = document.querySelectorAll([
        '.hero-subtext',
        '.section-text',
        '.mission-text',
        '.value-text',
        '.process-text',
        '.card-text',
        '.story-quote p',
        '.why-content p'
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

    /* Hero subtext fires right after heading */
    var heroSub = document.querySelector('.hero-subtext');
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
        '.mission-label',
        '.process-number',
        '.value-number'
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


/* =====================================================
   WHY CHECKLIST — staggered slide-in after paragraph
   ===================================================== */
(function initWhyChecklist() {
    'use strict';

    var whyContent = document.querySelector('.why-content');
    if (!whyContent) return;

    /* Wait until the paragraph text (.why-para) has entered
       the viewport, then trigger the checklist items         */
    var para = whyContent.querySelector('.why-para');
    var target = para || whyContent;

    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            /* Small delay so checklist fires AFTER the paragraph
               words have had a chance to start animating          */
            setTimeout(function() {
                whyContent.classList.add('why-visible');
            }, 320);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });

    obs.observe(target);
})();
