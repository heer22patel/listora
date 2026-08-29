/* ============================================================
   LISTORA — contact.js
   Premium contact page interactions · Vanilla JS only
   ============================================================
   01. Mobile Drawer
   02. Sticky Navbar + Logo Swap
   03. Hero Word Reveal
   04. Scroll Reveal (IntersectionObserver)
   05. Bento Card Mouse Spotlight
   06. Service Card Selection + Form Sync
   07. Floating Label Select
   08. Form Validation + Submit
   09. Animated Counters
   10. FAQ Accordion
   11. Magnetic Buttons
   12. Final CTA Particles
   13. Smooth Scroll
   ============================================================ */

'use strict';

/* ── 01. MOBILE DRAWER (handled by drawer.js) ──────────────── */


/* ── 02. STICKY NAVBAR + LOGO SWAP ───────────────────────── */
(function initNavbar() {
    var nav  = document.getElementById('ctNav');
    var logo = document.getElementById('navLogo');
    if (!nav) return;

    var lightLogo = 'logo 2.png'; /* white logo for dark hero */
    var darkLogo  = 'logo.png';   /* colour logo on white navbar */
    var scrolled  = false;

    function onScroll() {
        var shouldScroll = window.scrollY > 40;
        if (shouldScroll === scrolled) return;
        scrolled = shouldScroll;

        nav.classList.toggle('scrolled', scrolled);

        if (logo) {
            logo.src = scrolled ? darkLogo : lightLogo;
            logo.alt = 'Listora home';
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* run once on load */
})();


/* ── 03. HERO WORD REVEAL ─────────────────────────────────── */
(function initWordReveal() {
    var headline  = "Let's Build Your Growth Engine";
    var container = document.querySelector('.ct-hero__headline .ct-word-wrap');
    if (!container) return;

    var words    = headline.split(' ');
    var fragment = document.createDocumentFragment();

    words.forEach(function (word) {
        var wrap  = document.createElement('span');
        wrap.className = 'ct-word';
        wrap.setAttribute('aria-hidden', 'true');

        var inner = document.createElement('span');
        inner.textContent = word;

        wrap.appendChild(inner);
        fragment.appendChild(wrap);
    });

    container.appendChild(fragment);

    /* Update accessible heading text */
    var h1 = document.querySelector('.ct-hero__headline');
    if (h1) h1.setAttribute('aria-label', headline);

    /* Staggered reveal */
    var spans = document.querySelectorAll('.ct-word span');
    spans.forEach(function (s, i) {
        setTimeout(function () { s.classList.add('ct-word-in'); }, 420 + i * 95);
    });
})();


/* ── 04. SCROLL REVEAL ────────────────────────────────────── */
(function initReveal() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.ct-reveal').forEach(function (el) {
            el.classList.add('ct-visible');
        });
        return;
    }

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var delay = parseInt(entry.target.dataset.delay || '0', 10);
            setTimeout(function () {
                entry.target.classList.add('ct-visible');
            }, delay);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.ct-reveal').forEach(function (el) {
        obs.observe(el);
    });
})();


/* ── 05. BENTO CARD MOUSE SPOTLIGHT ──────────────────────── */
(function initSpotlight() {
    if (!window.matchMedia('(hover: hover)').matches) return;

    var cards = document.querySelectorAll('.ct-bento-card, .ct-why-card');

    cards.forEach(function (card) {
        var tx = 50, ty = 50, cx = 50, cy = 50;
        var rafId = null;
        var active = false;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function tick() {
            if (!active) return;
            cx = lerp(cx, tx, 0.10);
            cy = lerp(cy, ty, 0.10);
            card.style.setProperty('--mx', cx.toFixed(1) + '%');
            card.style.setProperty('--my', cy.toFixed(1) + '%');
            rafId = requestAnimationFrame(tick);
        }

        card.addEventListener('mouseenter', function () {
            active = true;
            rafId  = requestAnimationFrame(tick);
        });

        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            tx = ((e.clientX - rect.left)  / rect.width)  * 100;
            ty = ((e.clientY - rect.top)   / rect.height) * 100;
        });

        card.addEventListener('mouseleave', function () {
            active = false;
            cancelAnimationFrame(rafId);
            rafId = null;
        });
    });
})();


/* ── 06. SERVICE CARD SELECTION + FORM SYNC ──────────────── */
(function initServiceCards() {
    var svcCards  = document.querySelectorAll('.ct-svc-card');
    var svcSelect = document.getElementById('service');
    var display   = document.getElementById('selectedServicesDisplay');
    var selected  = [];

    function updateDisplay() {
        if (!display) return;
        display.innerHTML = '';
        if (selected.length === 0) return;

        selected.forEach(function (svc) {
            var pill = document.createElement('span');
            pill.className = 'ct-svc-pill';
            pill.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>' + svc;
            display.appendChild(pill);
        });
    }

    function updateSelect() {
        if (!svcSelect) return;

        if (selected.length === 0) {
            svcSelect.value = '';
        } else if (selected.length === 1) {
            for (var i = 0; i < svcSelect.options.length; i++) {
                if (svcSelect.options[i].value === selected[0]) {
                    svcSelect.value = selected[0];
                    break;
                }
            }
        } else {
            svcSelect.value = 'Multiple Services';
        }

        if (svcSelect.value) {
            svcSelect.classList.add('has-value');
        } else {
            svcSelect.classList.remove('has-value');
        }
    }

    svcCards.forEach(function (card) {
        card.addEventListener('click', function () {
            var svc = card.dataset.service;
            var idx = selected.indexOf(svc);

            if (idx === -1) {
                selected.push(svc);
                card.classList.add('selected');
                card.setAttribute('aria-pressed', 'true');
            } else {
                selected.splice(idx, 1);
                card.classList.remove('selected');
                card.setAttribute('aria-pressed', 'false');
            }

            updateDisplay();
            updateSelect();

            /* Scroll to form on first selection */
            if (selected.length === 1) {
                var formSection = document.getElementById('contact-form');
                if (formSection) {
                    setTimeout(function () {
                        var offset = 80;
                        var top = formSection.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top: top, behavior: 'smooth' });
                    }, 350);
                }
            }
        });
    });
})();


/* ── 07. FLOATING LABEL SELECT ────────────────────────────── */
(function initSelectLabels() {
    document.querySelectorAll('.ct-select').forEach(function (sel) {
        /* Initial state */
        if (sel.value) sel.classList.add('has-value');

        sel.addEventListener('change', function () {
            sel.classList.toggle('has-value', !!sel.value);
        });
    });
})();


/* ── 08. FORM VALIDATION + SUBMIT ─────────────────────────── */
(function initForm() {
    var form      = document.getElementById('contactForm');
    var submitBtn = document.getElementById('submitBtn');
    var success   = document.getElementById('formSuccess');

    if (!form) return;

    function validateField(field) {
        var errEl = field.parentElement.querySelector('.ct-field-err');
        var val   = field.value.trim();
        var ok    = true;
        var msg   = '';

        if (field.required && !val) {
            ok  = false;
            msg = 'This field is required.';
        } else if (field.type === 'email' && val &&
                   !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
            ok  = false;
            msg = 'Please enter a valid email address.';
        } else if (field.type === 'tel' && val &&
                   !/^[\d\s+\-().]{7,20}$/.test(val)) {
            ok  = false;
            msg = 'Please enter a valid phone number.';
        } else if (field.tagName === 'SELECT' && field.required && !val) {
            ok  = false;
            msg = 'Please select an option.';
        }

        field.classList.toggle('ct-input--err', !ok);
        if (errEl) errEl.textContent = msg;
        return ok;
    }

    /* Live validation on blur / input */
    form.querySelectorAll('.ct-input, .ct-select').forEach(function (field) {
        field.addEventListener('blur', function () { validateField(field); });
        field.addEventListener('input', function () {
            if (field.classList.contains('ct-input--err')) validateField(field);
        });
        field.addEventListener('change', function () {
            if (field.classList.contains('ct-input--err')) validateField(field);
        });
    });

})(); /* ── end initForm ── */


/* ── 09. ANIMATED COUNTERS ────────────────────────────────── */
(function initCounters() {
    if (!('IntersectionObserver' in window)) return;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);

            var el     = entry.target;
            var target = parseFloat(el.dataset.target);
            var suffix = el.dataset.suffix || '';
            var dur    = 1800;
            var start  = performance.now();

            function step(now) {
                var elapsed  = Math.min(now - start, dur);
                var progress = easeOut(elapsed / dur);
                var current  = Math.round(progress * target);
                el.textContent = current + suffix;
                if (elapsed < dur) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target + suffix;
                }
            }

            requestAnimationFrame(step);
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.ct-stat-card__num[data-target]').forEach(function (el) {
        obs.observe(el);
    });
})();


/* ── 10. FAQ ACCORDION ────────────────────────────────────── */
(function initFAQ() {
    var btns = document.querySelectorAll('.ct-faq-q');
    if (!btns.length) return;

    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var isOpen = btn.getAttribute('aria-expanded') === 'true';
            var answer = btn.nextElementSibling;

            /* Close all others */
            btns.forEach(function (b) {
                b.setAttribute('aria-expanded', 'false');
                var a = b.nextElementSibling;
                if (a) a.classList.remove('open');
            });

            /* Toggle clicked one open */
            if (!isOpen) {
                btn.setAttribute('aria-expanded', 'true');
                if (answer) answer.classList.add('open');
            }
        });
    });
})();


/* ── 11. MAGNETIC BUTTONS ─────────────────────────────────── */
(function initMagnetic() {
    if (!window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('.ct-btn--magnetic').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            var rect = btn.getBoundingClientRect();
            var dx   = e.clientX - (rect.left + rect.width  / 2);
            var dy   = e.clientY - (rect.top  + rect.height / 2);
            btn.style.transform = 'translate(' + (dx * 0.22) + 'px, ' + (dy * 0.22) + 'px)';
        });

        btn.addEventListener('mouseleave', function () {
            btn.style.transform = '';
        });
    });
})();


/* ── 12. FINAL CTA PARTICLES ──────────────────────────────── */
(function initParticles() {
    var container = document.getElementById('ctaParticles');
    if (!container) return;

    var count = 18;

    for (var i = 0; i < count; i++) {
        var p        = document.createElement('div');
        p.className  = 'ct-particle';
        var left     = Math.random() * 100;
        var duration = 9  + Math.random() * 12;
        var delay    = Math.random() * 10;
        var drift    = (Math.random() - 0.5) * 130;
        var size     = 2 + Math.random() * 3.5;
        var opacity  = 0.3 + Math.random() * 0.5;

        p.style.cssText = [
            'left:'                 + left.toFixed(1) + '%',
            'width:'                + size.toFixed(1) + 'px',
            'height:'               + size.toFixed(1) + 'px',
            'opacity:'              + opacity.toFixed(2),
            'animation-duration:'  + duration.toFixed(1) + 's',
            'animation-delay:-'    + delay.toFixed(1) + 's',
            '--drift:'              + drift.toFixed(0) + 'px'
        ].join(';');

        container.appendChild(p);
    }
})();


/* ── 13. SMOOTH SCROLL ────────────────────────────────────── */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href   = link.getAttribute('href');
            var target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            var offset = 80;
            var top    = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });
})();


/* ==========================================================
   GLOBAL CONTENT PROTECTION
   Works on any website
   ========================================================== */

(function () {

    // Disable right click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // Disable copy
    document.addEventListener('copy', function (e) {
        e.preventDefault();
    });

    // Disable cut
    document.addEventListener('cut', function (e) {
        e.preventDefault();
    });

    // Disable drag
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
    });

    // Disable text selection
    document.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });

    // Disable common shortcuts
    document.addEventListener('keydown', function (e) {

        const key = e.key.toLowerCase();

        if (
            (e.ctrlKey || e.metaKey) &&
            (
                key === 'c' ||
                key === 'x' ||
                key === 'a' ||
                key === 'u' ||
                key === 's' ||
                key === 'p'
            )
        ) {
            e.preventDefault();
        }

        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }

        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && key === 'i') {
            e.preventDefault();
        }

        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && key === 'j') {
            e.preventDefault();
        }

        // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && key === 'c') {
            e.preventDefault();
        }

    });

})();


/* =====================================================
   TEXT ANIMATION SYSTEM — Contact Page
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

    /* ── Section headings ── */
    var headingEls = document.querySelectorAll([
        '.ct-section-title',
        '.ct-form-heading',
        '.ct-bento-card__title',
        '.ct-why-card h3',
        '.ct-faq-item h3',
        '.ct-footer__col h3'
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
        '.ct-hero__sub',
        '.ct-section-sub',
        '.ct-bento-card__desc',
        '.ct-form-copy',
        '.ct-why-card p',
        '.ct-footer__newsletter-desc'
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

    var heroSub = document.querySelector('.ct-hero__sub');
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
        '.ct-badge',
        '.ct-hero__trust span'
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

/* ── FORM SUBMIT + SUCCESS MODAL ─────────────────────────── */
(function initFormSubmit() {

    var form      = document.getElementById('contactForm');
    var submitBtn = document.getElementById('submitBtn');
    var overlay   = document.getElementById('formSuccess');
    var timerEl   = document.getElementById('ctSuccessTimer');

    if (!form || !submitBtn || !overlay) return;

    var countdownTimer = null;

    /* Validate a single field, returns true if valid */
    function validateField(field) {
        var errEl = field.parentElement.querySelector('.ct-field-err');
        var val   = field.value.trim();
        var ok    = true;
        var msg   = '';

        if (field.required && !val) {
            ok = false; msg = 'This field is required.';
        } else if (field.type === 'email' && val &&
                   !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
            ok = false; msg = 'Please enter a valid email address.';
        } else if (field.type === 'tel' && val &&
                   !/^[\d\s+\-().]{7,20}$/.test(val)) {
            ok = false; msg = 'Please enter a valid phone number.';
        } else if (field.tagName === 'SELECT' && field.required && !val) {
            ok = false; msg = 'Please select an option.';
        }

        field.classList.toggle('ct-input--err', !ok);
        if (errEl) errEl.textContent = msg;
        return ok;
    }

    /* Show modal, lock scroll, start countdown */
    function showSuccess() {
        /* Re-trigger animations by cloning the inner card */
        var inner = overlay.querySelector('.ct-success-overlay__inner');
        if (inner) {
            var clone = inner.cloneNode(true);
            inner.parentNode.replaceChild(clone, inner);
            timerEl = overlay.querySelector('#ctSuccessTimer');
        }

        /* Show: inline style takes priority, class adds flex layout */
        overlay.style.display = 'flex';
        overlay.classList.add('is-visible');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        var seconds = 20;
        if (timerEl) timerEl.textContent = seconds;

        countdownTimer = setInterval(function() {
            seconds -= 1;
            if (timerEl) timerEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(countdownTimer);
                hideSuccess();
            }
        }, 1000);
    }

    /* Hide modal, restore scroll, reset form */
    function hideSuccess() {
        clearInterval(countdownTimer);
        countdownTimer = null;

        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.display = 'none';
        document.body.style.overflow = '';

        /* Reset all form fields */
        form.reset();
        form.querySelectorAll('.ct-select').forEach(function(s) {
            s.classList.remove('has-value');
        });
        form.querySelectorAll('.ct-input--err').forEach(function(f) {
            f.classList.remove('ct-input--err');
        });
        form.querySelectorAll('.ct-field-err').forEach(function(e) {
            e.textContent = '';
        });

        /* Reset service card selections */
        document.querySelectorAll('.ct-svc-card.selected').forEach(function(card) {
            card.classList.remove('selected');
            card.setAttribute('aria-pressed', 'false');
        });
        var svcDisplay = document.getElementById('selectedServicesDisplay');
        if (svcDisplay) svcDisplay.innerHTML = '';

        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }

    /* Close on backdrop click */
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) hideSuccess();
    });

    /* Submit handler */
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        /* Validate all fields */
        var allOk = true;
        form.querySelectorAll('.ct-input, .ct-select').forEach(function(field) {
            if (!validateField(field)) allOk = false;
        });
        if (!allOk) return;

        /* Loading state */
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        /* Send to PHP */
        var formData = new FormData(form);
        fetch('contact-process.php', { method: 'POST', body: formData })
            .then(function(res) { return res.json(); })
            .then(function(result) {
                submitBtn.classList.remove('loading');
                if (result.status === 'success') {
                    showSuccess();
                } else {
                    submitBtn.disabled = false;
                    alert(result.message || 'Something went wrong. Please try again.');
                }
            })
            .catch(function(err) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                console.error('Form error:', err);
                alert('Unable to submit. Please check your connection and try again.');
            });
    });

})();