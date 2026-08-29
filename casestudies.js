/* ════════════════════════════════════════════════════════════════
   CASE-STUDIES.JS  — v3 (bug-fix release)
   Fixes:
     1. Modal closes on overlay click (not just ESC)
     2. Video pauses correctly on mid-play click
     3. Overlay guard on expandBtn null-check
     4. Proper pause-guard so native controls don't re-trigger play
════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     1. SCROLL REVEAL
  ══════════════════════════════════════════════════════════════ */
  function reveal(selector, className, options) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          obs.unobserve(entry.target);
        }
      });
    }, options || { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }

  reveal('.cs-video-card.service-card', 'show');
  reveal('.cs-story', 'show');
  reveal('.cs-workflow-comparison.listora-advantage-card', 'listora-card-visible');
  reveal('.cs-feedback-card.listora-advantage-card', 'listora-card-visible');


  /* ══════════════════════════════════════════════════════════════
     2. FAQ ACCORDION
  ══════════════════════════════════════════════════════════════ */
  var faqTriggers = document.querySelectorAll('.cs-faq-trigger');

  faqTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var answerId = trigger.getAttribute('aria-controls');
      var answer   = document.getElementById(answerId);

      faqTriggers.forEach(function (other) {
        if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
          var otherId  = other.getAttribute('aria-controls');
          var otherAns = document.getElementById(otherId);
          other.setAttribute('aria-expanded', 'false');
          if (otherAns) { otherAns.style.maxHeight = '0px'; otherAns.setAttribute('aria-hidden', 'true'); }
        }
      });

      if (expanded) {
        trigger.setAttribute('aria-expanded', 'false');
        if (answer) { answer.style.maxHeight = '0px'; answer.setAttribute('aria-hidden', 'true'); }
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        if (answer) { answer.setAttribute('aria-hidden', 'false'); answer.style.maxHeight = answer.scrollHeight + 'px'; }
      }
    });
  });

  window.addEventListener('resize', function () {
    faqTriggers.forEach(function (trigger) {
      if (trigger.getAttribute('aria-expanded') === 'true') {
        var answerId = trigger.getAttribute('aria-controls');
        var answer   = document.getElementById(answerId);
        if (answer) { answer.style.maxHeight = answer.scrollHeight + 'px'; }
      }
    });
  });


  /* ══════════════════════════════════════════════════════════════
     3. VIDEO MANAGER
  ══════════════════════════════════════════════════════════════ */

  /* ── DOM ── */
  var modal        = document.getElementById('csVideoModal');
  var modalOverlay = document.getElementById('csModalOverlay');
  var modalClose   = document.getElementById('csModalClose');
  var modalVid     = document.getElementById('csModalVid');

  if (!modal || !modalVid) return;

  /* ── State ── */
  var activeInlineVideo = null;
  var sourceCard        = null;
  var modalIsOpen       = false;
  var scrollbarWidth    = 0;

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */

  /* Hard-stop: mute first so audio dies instantly, then pause */
  function hardStop(vid) {
    if (!vid) return;
    vid.muted = true;
    vid.pause();
    vid.muted = false;
  }

  /* Lazy-load: set src only when first needed */
  function ensureSrc(vid) {
    var src = vid.getAttribute('data-src');
    if (src && !vid.getAttribute('src')) {
      vid.setAttribute('src', src);
      vid.load();
    }
  }

  /* Show / hide the play-button overlay */
  function setOverlayVisible(card, visible) {
    var overlay = card.querySelector('.cs-vid-overlay');
    if (!overlay) return;
    if (visible) {
      overlay.classList.remove('is-hidden');
      overlay.removeAttribute('aria-hidden');
      overlay.style.pointerEvents = '';
    } else {
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
      /* pointer-events:none on overlay so native controls get clicks.
         The expand button overrides this with pointer-events:auto!important */
      overlay.style.pointerEvents = 'none';
    }
  }

  /* Buffering spinner */
  function setSpinner(card, show) {
    var wrap = card.querySelector('.cs-vid-wrap');
    if (wrap) wrap.classList.toggle('is-buffering', show);
  }

  /* Stop the currently-playing inline video and restore its overlay */
  function pauseActiveInline() {
    if (!activeInlineVideo) return;
    var card = activeInlineVideo.closest('.cs-video-card');
    hardStop(activeInlineVideo);
    activeInlineVideo.removeAttribute('controls');
    activeInlineVideo.classList.remove('is-playing');
    if (card) {
      setOverlayVisible(card, true);
      setSpinner(card, false);
    }
    activeInlineVideo = null;
  }

  /* ─────────────────────────────────────────────
     INLINE PLAYBACK
  ───────────────────────────────────────────── */
  function playInline(card) {
    var vid = card.querySelector('.cs-vid');
    if (!vid) return;

    /* Stop any other playing video first */
    if (activeInlineVideo && activeInlineVideo !== vid) {
      pauseActiveInline();
    }

    ensureSrc(vid);
    setSpinner(card, true);
    vid.setAttribute('controls', '');
    vid.classList.add('is-playing');

    var p = vid.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        setSpinner(card, false);
        setOverlayVisible(card, false);
        activeInlineVideo = vid;
      }).catch(function () {
        setSpinner(card, false);
        setOverlayVisible(card, true);
        vid.removeAttribute('controls');
        vid.classList.remove('is-playing');
      });
    } else {
      setSpinner(card, false);
      setOverlayVisible(card, false);
      activeInlineVideo = vid;
    }
  }

  /* ─────────────────────────────────────────────
     MODAL
  ───────────────────────────────────────────── */
  function measureScrollbar() {
    scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  }
  measureScrollbar();

  function openModal(card) {
    var vid = card.querySelector('.cs-vid');
    if (!vid) return;

    pauseActiveInline();
    ensureSrc(vid);

    /* Use data-src as source so modal always gets the right file */
    var src = vid.getAttribute('data-src') || vid.getAttribute('src') || '';
    modalVid.src = src;
    modalVid.currentTime = 0;

    measureScrollbar();
    document.documentElement.style.setProperty('--scrollbar-w', scrollbarWidth + 'px');
    document.body.classList.add('cs-modal-open');

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modalIsOpen = true;
    sourceCard  = card;

    var p = modalVid.play();
    if (p && typeof p.then === 'function') {
      p.catch(function () { /* autoplay policy – user can press play */ });
    }

    setTimeout(function () { if (modalClose) modalClose.focus(); }, 60);
  }

  function closeModal() {
    if (!modalIsOpen) return;

    /* Kill audio + playback immediately */
    hardStop(modalVid);
    modalVid.removeAttribute('src');   /* fully detach so browser drops audio track */
    modalVid.load();

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cs-modal-open');
    document.documentElement.style.removeProperty('--scrollbar-w');
    modalIsOpen = false;

    /* Return focus to the expand button that opened the modal */
    if (sourceCard) {
      var btn = sourceCard.querySelector('.cs-expand-btn');
      if (btn) btn.focus();
      sourceCard = null;
    }
  }

  /* ─────────────────────────────────────────────
     FOCUS TRAP (keyboard accessibility inside modal)
  ───────────────────────────────────────────── */
  function trapFocus(e) {
    if (!modalIsOpen || e.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(
      modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  /* ─────────────────────────────────────────────
     PER-CARD EVENT BINDING
  ───────────────────────────────────────────── */
  var cards = document.querySelectorAll('.cs-video-card');

  cards.forEach(function (card) {
    var vid       = card.querySelector('.cs-vid');
    var wrap      = card.querySelector('.cs-vid-wrap');
    var playBtn   = card.querySelector('.cs-play-btn');
    var expandBtn = card.querySelector('.cs-expand-btn');

    if (!vid || !wrap || !playBtn) return;

    /* ── Play button: always start playback ── */
    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      playInline(card);
    });

    /* ── Click on wrap → toggle play/pause
         Guard: ignore clicks that land on the expand button,
         the native video controls area (when video is playing),
         or the video element itself (native controls handle those). ── */
    wrap.addEventListener('click', function (e) {
      /* Ignore if click is on / inside the expand button */
      if (expandBtn && (e.target === expandBtn || expandBtn.contains(e.target))) return;

      /* When video is playing and controls are showing,
         clicks on the video element itself are handled by native controls
         (play/pause bar, seek, etc.) – don't interfere. */
      if (e.target === vid && !vid.paused) return;

      /* Toggle */
      if (vid.paused) {
        playInline(card);
      } else {
        pauseActiveInline();
      }
    });

    /* ── Expand button → open modal ── */
    if (expandBtn) {
      expandBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openModal(card);
      });
      expandBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
      });
    }

    /* ── Keyboard on play button ── */
    playBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playInline(card); }
    });

    /* ── Video native pause event → restore overlay
         But only if WE triggered the pause (not a programmatic one
         from pauseActiveInline which already restores the overlay). ── */
    vid.addEventListener('pause', function () {
      /* If activeInlineVideo was already cleared by pauseActiveInline,
         this event fires after the UI was already restored – skip. */
      if (activeInlineVideo !== vid) return;
      setOverlayVisible(card, true);
      vid.removeAttribute('controls');
      vid.classList.remove('is-playing');
      activeInlineVideo = null;
    });

    vid.addEventListener('ended', function () {
      setOverlayVisible(card, true);
      vid.removeAttribute('controls');
      vid.classList.remove('is-playing');
      setSpinner(card, false);
      if (activeInlineVideo === vid) activeInlineVideo = null;
    });

    /* ── Buffering ── */
    vid.addEventListener('waiting', function () { setSpinner(card, true); });
    vid.addEventListener('playing', function () { setSpinner(card, false); });
    vid.addEventListener('canplay', function () { setSpinner(card, false); });
  });

  /* ─────────────────────────────────────────────
     MODAL CLOSE TRIGGERS
  ───────────────────────────────────────────── */

  /* Close button */
  if (modalClose) {
    modalClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeModal();
    });
  }

  /* ── FIX 1: Clicking the dark backdrop closes the modal.
     The overlay div IS the backdrop — listen directly on it.
     The shell sits on top (z-index:1) so clicks on the video
     do NOT bubble to the overlay. ── */
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function () {
      closeModal();
    });
  }

  /* Also close if user clicks the modal container itself
     (the semi-transparent padding area outside the shell) */
  modal.addEventListener('click', function (e) {
    /* Only close if the click landed directly on .cs-modal (the flex wrapper),
       not on any child (shell, close button, video) */
    if (e.target === modal) {
      closeModal();
    }
  });

  /* ESC key + focus trap */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalIsOpen) { closeModal(); return; }
    trapFocus(e);
  });

  /* ─────────────────────────────────────────────
     AUTO-PAUSE: card leaves viewport
  ───────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var vpObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          var c   = entry.target;
          var v   = c.querySelector('.cs-vid');
          if (v && activeInlineVideo === v && !v.paused) {
            pauseActiveInline();
          }
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(function (card) { vpObserver.observe(card); });
  }

  /* ─────────────────────────────────────────────
     NAVBAR SCROLL
  ───────────────────────────────────────────── */
  (function () {
    var nav = document.getElementById('ctNav');
    if (!nav) return;
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 50); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }());

})();

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     1. SCROLL REVEAL
  ══════════════════════════════════════════════════════════════ */
  function reveal(selector, className, options) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          obs.unobserve(entry.target);
        }
      });
    }, options || { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }

  reveal('.cs-video-card.service-card', 'show');
  reveal('.cs-story', 'show');
  reveal('.cs-workflow-comparison.listora-advantage-card', 'listora-card-visible');
  reveal('.cs-feedback-card.listora-advantage-card', 'listora-card-visible');


  /* ══════════════════════════════════════════════════════════════
     2. FAQ ACCORDION
  ══════════════════════════════════════════════════════════════ */
  var faqTriggers = document.querySelectorAll('.cs-faq-trigger');

  faqTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var answerId = trigger.getAttribute('aria-controls');
      var answer = document.getElementById(answerId);

      faqTriggers.forEach(function (other) {
        if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
          var otherId = other.getAttribute('aria-controls');
          var otherAns = document.getElementById(otherId);
          other.setAttribute('aria-expanded', 'false');
          if (otherAns) { otherAns.style.maxHeight = '0px'; otherAns.setAttribute('aria-hidden', 'true'); }
        }
      });

      if (expanded) {
        trigger.setAttribute('aria-expanded', 'false');
        if (answer) { answer.style.maxHeight = '0px'; answer.setAttribute('aria-hidden', 'true'); }
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        if (answer) { answer.setAttribute('aria-hidden', 'false'); answer.style.maxHeight = answer.scrollHeight + 'px'; }
      }
    });
  });

  window.addEventListener('resize', function () {
    faqTriggers.forEach(function (trigger) {
      if (trigger.getAttribute('aria-expanded') === 'true') {
        var answerId = trigger.getAttribute('aria-controls');
        var answer = document.getElementById(answerId);
        if (answer) { answer.style.maxHeight = answer.scrollHeight + 'px'; }
      }
    });
  });


  /* ══════════════════════════════════════════════════════════════
     3. VIDEO MANAGER — complete rebuild
  ══════════════════════════════════════════════════════════════ */

  /* ── DOM references ── */
  var modal       = document.getElementById('csVideoModal');
  var modalOverlay = document.getElementById('csModalOverlay');
  var modalClose  = document.getElementById('csModalClose');
  var modalVid    = document.getElementById('csModalVid');

  if (!modal || !modalVid) return; // safety: bail if HTML not present

  /* ── State ── */
  var activeInlineVideo = null;   // currently playing inline <video>
  var sourceCard        = null;   // card whose expand opened the modal
  var modalIsOpen       = false;
  var scrollbarWidth    = 0;

  /* ── Helpers ── */

  /**
   * Hard-stop a <video>: pause + mute simultaneously so audio
   * cannot linger even on browsers that defer pause resolution.
   */
  function hardStop(vid) {
    if (!vid) return;
    vid.muted = true;          // kill audio instantly
    vid.pause();               // stop playback
    vid.muted = false;         // restore mute state for next play
  }

  /**
   * Load lazy video src when first needed.
   */
  function ensureSrc(vid) {
    var src = vid.getAttribute('data-src');
    if (src && !vid.src) {
      vid.src = src;
      vid.load();
    }
  }

  /**
   * Show/hide the overlay on a card.
   * visible=true  → show overlay (play button visible)
   * visible=false → hide overlay (video playing, controls visible)
   */
  function setOverlayVisible(card, visible) {
    var overlay = card.querySelector('.cs-vid-overlay');
    if (!overlay) return;
    if (visible) {
      overlay.classList.remove('is-hidden');
      overlay.removeAttribute('aria-hidden');
      // Restore pointer events for play button
      overlay.style.pointerEvents = '';
    } else {
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
      // Disable pointer events on overlay so native video controls work,
      // but expand button uses pointer-events:auto!important to stay clickable
      overlay.style.pointerEvents = 'none';
    }
  }

  /**
   * Show/hide the buffering spinner on a card.
   */
  function setSpinner(card, show) {
    var wrap = card.querySelector('.cs-vid-wrap');
    if (!wrap) return;
    wrap.classList.toggle('is-buffering', show);
  }

  /**
   * Pause whichever inline video is currently playing.
   */
  function pauseActiveInline() {
    if (!activeInlineVideo) return;
    var card = activeInlineVideo.closest('.cs-video-card');
    hardStop(activeInlineVideo);
    activeInlineVideo.removeAttribute('controls');
    activeInlineVideo.classList.remove('is-playing');
    if (card) {
      setOverlayVisible(card, true);
      setSpinner(card, false);
    }
    activeInlineVideo = null;
  }

  /* ─────────────────────────────────────────────
     INLINE PLAYBACK
  ───────────────────────────────────────────── */
  function playInline(card) {
    var vid = card.querySelector('.cs-vid');
    if (!vid) return;

    // Pause any other inline video that is playing
    if (activeInlineVideo && activeInlineVideo !== vid) {
      pauseActiveInline();
    }

    ensureSrc(vid);
    setSpinner(card, true);

    vid.setAttribute('controls', '');
    vid.classList.add('is-playing');

    var playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        setSpinner(card, false);
        setOverlayVisible(card, false);
        activeInlineVideo = vid;
      }).catch(function () {
        // Autoplay blocked or file not found — restore overlay
        setSpinner(card, false);
        setOverlayVisible(card, true);
        vid.removeAttribute('controls');
        vid.classList.remove('is-playing');
      });
    } else {
      // Older browsers without Promise-based play()
      setSpinner(card, false);
      setOverlayVisible(card, false);
      activeInlineVideo = vid;
    }
  }

  /* ─────────────────────────────────────────────
     MODAL LOGIC
  ───────────────────────────────────────────── */

  /** Measure scrollbar width once (avoids layout shift on open) */
  function measureScrollbar() {
    scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  }
  measureScrollbar();

  function openModal(card) {
    var vid = card.querySelector('.cs-vid');
    if (!vid) return;

    // Pause inline video before opening modal
    pauseActiveInline();
    ensureSrc(vid);

    // Transfer src to modal video
    var src = vid.getAttribute('data-src') || vid.src || '';
    modalVid.src = src;
    modalVid.currentTime = 0;

    // Prevent body scroll — reserve scrollbar space
    measureScrollbar();
    document.documentElement.style.setProperty('--scrollbar-w', scrollbarWidth + 'px');
    document.body.classList.add('cs-modal-open');

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modalIsOpen = true;
    sourceCard = card;

    // Start playback in modal
    var openPromise = modalVid.play();
    if (openPromise !== undefined) {
      openPromise.catch(function () { /* user gesture required on some browsers */ });
    }

    // Move focus to close button
    setTimeout(function () { if (modalClose) modalClose.focus(); }, 50);
  }

  function closeModal() {
    if (!modalIsOpen) return;

    // CRITICAL: hard-stop modal video immediately
    hardStop(modalVid);
    modalVid.src = '';          // detach src so browser releases audio track
    modalVid.load();            // reset decoder

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cs-modal-open');
    document.documentElement.style.removeProperty('--scrollbar-w');

    modalIsOpen = false;

    // Return focus to the expand button on the source card
    if (sourceCard) {
      var expandBtn = sourceCard.querySelector('.cs-expand-btn');
      if (expandBtn) { expandBtn.focus(); }
      sourceCard = null;
    }
  }

  /* ─────────────────────────────────────────────
     FOCUS TRAP inside modal
  ───────────────────────────────────────────── */
  function trapFocus(e) {
    if (!modalIsOpen) return;
    var focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }

  /* ─────────────────────────────────────────────
     EVENT BINDING — per card
  ───────────────────────────────────────────── */
  var cards = document.querySelectorAll('.cs-video-card');

  cards.forEach(function (card) {
    var vid      = card.querySelector('.cs-vid');
    var wrap     = card.querySelector('.cs-vid-wrap');
    var playBtn  = card.querySelector('.cs-play-btn');
    var expandBtn = card.querySelector('.cs-expand-btn');

    if (!vid || !wrap || !playBtn) return;

    /* Click on play button → play inline */
    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      playInline(card);
    });

    /* Click anywhere on the video wrap (except expand btn) → toggle play/pause */
    wrap.addEventListener('click', function (e) {
      if (e.target === expandBtn || expandBtn.contains(e.target)) return;
      if (vid.paused) {
        playInline(card);
      } else {
        pauseActiveInline();
      }
    });

    /* Expand button → open modal */
    if (expandBtn) {
      expandBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openModal(card);
      });
    }

    /* Keyboard: Enter/Space on play button */
    playBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playInline(card);
      }
    });

    /* Keyboard: Enter/Space on expand button */
    if (expandBtn) {
      expandBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card);
        }
      });
    }

    /* Native pause/ended → restore overlay */
    vid.addEventListener('pause', function () {
      if (activeInlineVideo !== vid) return; // paused by pauseActiveInline()
      setOverlayVisible(card, true);
      vid.removeAttribute('controls');
      vid.classList.remove('is-playing');
      activeInlineVideo = null;
    });

    vid.addEventListener('ended', function () {
      setOverlayVisible(card, true);
      vid.removeAttribute('controls');
      vid.classList.remove('is-playing');
      setSpinner(card, false);
      if (activeInlineVideo === vid) activeInlineVideo = null;
    });

    /* Buffering states */
    vid.addEventListener('waiting', function () { setSpinner(card, true); });
    vid.addEventListener('playing', function () { setSpinner(card, false); });
    vid.addEventListener('canplay', function () { setSpinner(card, false); });
  });

  /* ─────────────────────────────────────────────
     MODAL CLOSE TRIGGERS
  ───────────────────────────────────────────── */

  /* Close button click */
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  /* Overlay (backdrop) click */
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  /* ESC key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalIsOpen) {
      closeModal();
    }
    trapFocus(e);
  });

  /* ─────────────────────────────────────────────
     AUTO-PAUSE: VIEWPORT INTERSECTION
     Pause inline video when card leaves screen
  ───────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var vpObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          var card = entry.target;
          var vid = card.querySelector('.cs-vid');
          if (vid && activeInlineVideo === vid && !vid.paused) {
            pauseActiveInline();
          }
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(function (card) { vpObserver.observe(card); });
  }

  /* ─────────────────────────────────────────────
     NAVBAR SCROLL HANDLER (shared with index.html)
  ───────────────────────────────────────────── */
  (function () {
    var nav = document.getElementById('ctNav');
    if (!nav) return;
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 50); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }());

})();