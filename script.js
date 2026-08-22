
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.getElementById('hero');
  const header = document.querySelector('.top');
  const progress = document.getElementById('scrollProgress');
  const intro = document.getElementById('introLoader');

  // Intro appears once per tab/session, then hands off to HERO.
  const finishIntro = () => {
    if (intro) intro.classList.add('is-hidden');
    if (hero) hero.classList.add('is-ready');
  };
  if (reduceMotion) {
    finishIntro();
  } else {
    const alreadySeen = sessionStorage.getItem('uzumasa-intro-seen') === '1';
    if (alreadySeen) {
      if (intro) intro.style.display = 'none';
      requestAnimationFrame(() => hero && hero.classList.add('is-ready'));
    } else {
      sessionStorage.setItem('uzumasa-intro-seen', '1');
      window.setTimeout(finishIntro, 1750);
    }
  }

  // Section reveal
  const revealSections = document.querySelectorAll('.reveal-section');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealSections.forEach(section => io.observe(section));
  } else {
    revealSections.forEach(section => section.classList.add('is-visible'));
  }

  // Lightweight scroll effects: progress, header, subtle image parallax.
  const parallaxImages = [...document.querySelectorAll('.parallax-img')];
  let ticking = false;
  const updateScrollEffects = () => {
    ticking = false;
    const y = window.scrollY || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.width = `${Math.min(100, (y / max) * 100)}%`;
    if (header) header.classList.toggle('is-scrolled', y > 30);

    if (!reduceMotion) {
      parallaxImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const center = rect.top + rect.height / 2;
        const normalized = (center - window.innerHeight / 2) / window.innerHeight;
        const amount = Math.max(-10, Math.min(10, normalized * -8));
        const base = img.classList.contains('hero-img') ? 1.015 : 1.0;
        img.style.transform = `translate3d(0, ${amount}px, 0) scale(${base})`;
      });
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollEffects);
    }
  }, { passive: true });
  updateScrollEffects();

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const closeBtn = lightbox?.querySelector('.lightbox-close');

  const openLightbox = (src, alt='') => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('img.zoomable').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  // Floor-plan switch with a gentle crossfade
  const activePlan = document.getElementById('activePlan');
  const planCaption = document.getElementById('planCaption');
  const planView = document.querySelector('.plan-transition');
  const planMap = {
    '1': ['assets/plan1.png', '1階平面図'],
    '2': ['assets/plan2.png', '2階平面図'],
    '3': ['assets/plan3.png', '3階平面図']
  };

  document.querySelectorAll('.plan-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!activePlan || !planCaption || !planMap[btn.dataset.plan]) return;
      document.querySelectorAll('.plan-tab').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected','false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected','true');

      const [src, caption] = planMap[btn.dataset.plan];
      const commit = () => {
        activePlan.src = src;
        activePlan.alt = caption;
        planCaption.textContent = caption;
        requestAnimationFrame(() => planView?.classList.remove('is-switching'));
      };
      if (reduceMotion || !planView) {
        commit();
      } else {
        planView.classList.add('is-switching');
        window.setTimeout(commit, 180);
      }
    });
  });

  document.querySelector('.plan-image-button')?.addEventListener('click', () => {
    if (activePlan) openLightbox(activePlan.src, activePlan.alt);
  });

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
})();
