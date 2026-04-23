/* Beldi Fusion - interactions editoriales */
(function () {
  'use strict';

  // ---------- Annee ----------
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // ---------- Nav mobile ----------
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ---------- Marquee : dupliquer le contenu pour un loop sans saut ----------
  document.querySelectorAll('.marquee-track').forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  // ---------- Tabs menu ----------
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.menu-pane');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panes.forEach((p) => {
        const match = p.dataset.pane === target;
        p.classList.toggle('is-active', match);
        if (match) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    });
  });

  // ---------- Reveal au scroll ----------
  const revealables = document.querySelectorAll(
    '.section-tag, .hero-title, .hero-lede, .hero-stats, .editorial-split, .ritual, .dish, .gallery-collage figure, .info-block, .contact-form, .pull-quote, .quote-attribution, .delivery-platforms, .media-arch, .arch-frame'
  );
  revealables.forEach((el) => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Lightbox galerie ----------
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbClose = lightbox.querySelector('.lightbox-close');
    const items = document.querySelectorAll('.gallery-collage figure, .gallery-hscroll .gphoto');

    const openLB = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeLB = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
    };

    items.forEach((el) => {
      const img = el.querySelector('img');
      if (!img) return;
      el.setAttribute('tabindex', '0');
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', () => openLB(img.src, img.alt));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(img.src, img.alt); }
      });
    });
    lbClose.addEventListener('click', closeLB);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLB(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLB();
    });
  }

  // ---------- Image fallback ----------
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent) {
        parent.style.background = 'linear-gradient(135deg, var(--terra), var(--terra-dark))';
      }
    });
  });

  // ---------- Video background intelligente ----------
  // Respecte prefers-reduced-motion et data-saver
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = connection && (connection.saveData || /2g|slow/i.test(connection.effectiveType || ''));

  const videos = document.querySelectorAll('video[data-video-candidates]');
  videos.forEach((video) => {
    if (prefersReducedMotion || saveData) {
      video.remove();
      return;
    }
    let candidates = [];
    try { candidates = JSON.parse(video.dataset.videoCandidates || '[]'); } catch (_) {}
    if (!candidates.length) return;

    const tryLoad = (idx) => {
      if (idx >= candidates.length) {
        // Aucune URL n'a charge : on retire la video, le poster/SVG prend le relais
        video.style.display = 'none';
        return;
      }
      const src = candidates[idx];
      video.src = src;
      const onReady = () => {
        video.classList.add('is-ready');
        video.removeEventListener('loadeddata', onReady);
      };
      const onError = () => {
        video.removeEventListener('error', onError);
        tryLoad(idx + 1);
      };
      video.addEventListener('loadeddata', onReady, { once: true });
      video.addEventListener('error', onError, { once: true });
      // Timeout : si la video met plus de 6s a demarrer, on tente la suivante
      setTimeout(() => {
        if (!video.classList.contains('is-ready')) {
          video.removeEventListener('loadeddata', onReady);
          tryLoad(idx + 1);
        }
      }, 6000);
      video.load();
    };

    // Charge la video uniquement quand elle devient visible (IntersectionObserver)
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryLoad(0);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '100px' });
      obs.observe(video);
    } else {
      tryLoad(0);
    }
  });

  // ---------- Draw SVG au scroll (arabesque / motifs qui se dessinent) ----------
  const drawables = document.querySelectorAll('.draw-svg');
  if (drawables.length && 'IntersectionObserver' in window) {
    const drawObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          drawObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    drawables.forEach((el) => drawObs.observe(el));
  }

  // ============================================================
  // RAFFINEMENTS PREMIUM : CURSEUR, PARALLAX, MAGNETIC, TILT,
  // WORD-REVEAL
  // ============================================================

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  // ---------- Curseur custom + LABEL CONTEXTUEL ----------
  if (isFinePointer && !prefersReducedMotion) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    const label = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    label.className = 'cursor-label';
    label.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.appendChild(label);
    document.documentElement.classList.add('has-custom-cursor');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let labelX = 0, labelY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
    });

    // Anneau + label avec easing (suivent avec delai different)
    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      // label : suit un peu plus lentement, decale en haut a droite du curseur
      labelX += (mouseX - labelX) * 0.22;
      labelY += (mouseY - labelY) * 0.22;
      label.style.transform = `translate3d(${labelX + 18}px, ${labelY - 28}px, 0) scale(${label.classList.contains('is-visible') ? 1 : 0.8})`;
      requestAnimationFrame(loop);
    };
    loop();

    // Heuristique : inferer le label d'apres l'element hovered
    const inferLabel = (el) => {
      // Override explicite
      const explicit = el.closest('[data-cursor-label]');
      if (explicit) return explicit.dataset.cursorLabel;

      const btn = el.closest('button, [role="button"], .btn');
      if (btn) {
        const t = (btn.textContent || '').trim().toLowerCase();
        if (t.includes('commander'))   return 'Commander';
        if (t.includes('appel'))       return 'Appeler';
        if (t.includes('envoyer'))     return 'Envoyer';
        if (t.includes('itin'))        return 'Y aller';
        if (t.includes('r&eacute;server') || t.includes('reserver')) return 'Reserver';
        return 'Cliquer';
      }
      const link = el.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('tel:'))       return 'Appeler';
        if (href.startsWith('mailto:'))    return 'Ecrire';
        if (href.includes('ubereats') || href.includes('deliveroo')) return 'Commander';
        if (href.includes('instagram'))    return 'Ouvrir';
        if (href.includes('maps'))         return 'Y aller';
        if (href.startsWith('#'))          return null;
        if (/^https?:/.test(href))         return 'Ouvrir';
        return 'Voir';
      }
      if (el.closest('input, textarea, select')) return 'Ecrire';
      if (el.closest('.polaroid, [data-lightbox]')) return 'Agrandir';
      if (el.closest('.ed-list-item, .ed-tab')) return 'Afficher';
      return null;
    };

    // Hover sur les elements interactifs (selector large + label inference)
    const hoverSelectors = 'a, button, .btn, input, textarea, select, [role=button], [data-cursor-label], .ritual, .feature-illus, .polaroid, .stamp, .ed-list-item, .ed-tab';
    const addHover = (text, dark = false) => {
      ring.classList.add('is-hover');
      if (dark) ring.classList.add('is-hover-dark');
      dot.classList.add('is-hover');
      if (text) {
        label.textContent = text;
        label.classList.add('is-visible');
        if (dark) label.classList.add('on-dark');
      }
    };
    const removeHover = () => {
      ring.classList.remove('is-hover', 'is-hover-dark');
      dot.classList.remove('is-hover');
      label.classList.remove('is-visible', 'on-dark');
    };

    document.querySelectorAll(hoverSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const onDark = el.closest('.section-dark, .section-majorelle, .section-video, .hero-desert, .site-footer');
        const text = inferLabel(el);
        addHover(text, !!onDark);
      });
      el.addEventListener('mouseleave', removeHover);
    });

    // Click
    document.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
    document.addEventListener('mouseup', () => ring.classList.remove('is-clicking'));

    // Cache le curseur quand souris sort de la fenetre
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = 0;
      ring.style.opacity = 0;
      label.style.opacity = 0;
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '';
      ring.style.opacity = '';
      label.style.opacity = '';
    });
  }

  // ---------- Film grain ----------
  if (!prefersReducedMotion && !isTouch) {
    const grain = document.createElement('div');
    grain.className = 'film-grain';
    grain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(grain);
  }

  // ---------- Parallaxe scroll ----------
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !prefersReducedMotion) {
    let ticking = false;
    const updateParallax = () => {
      const winH = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Seulement si visible
        if (rect.bottom < 0 || rect.top > winH) return;
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        // Offset base sur la position relative a la fenetre
        const center = rect.top + rect.height / 2 - winH / 2;
        const translateY = -center * speed;
        el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateParallax();
  }

  // ---------- Magnetic buttons ----------
  const magnets = document.querySelectorAll('.btn-magnetic, .magnetic');
  if (magnets.length && isFinePointer && !prefersReducedMotion) {
    magnets.forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.28;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ---------- Tilt 3D cards ----------
  const tilts = document.querySelectorAll('.tilt');
  if (tilts.length && isFinePointer && !prefersReducedMotion) {
    tilts.forEach((el) => {
      const max = parseFloat(el.dataset.tiltMax) || 8; // degres max
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const ry = dx * max;
        const rx = -dy * max;
        el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.02,1.02,1.02)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ---------- Word reveal (split titres + intersection observer) ----------
  const wordTargets = document.querySelectorAll('.word-reveal');
  if (wordTargets.length) {
    // Fonction qui wrap chaque mot dans un <span class="word">
    const splitWords = (el) => {
      if (el.dataset.split === 'done') return;
      el.dataset.split = 'done';
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach((node) => {
        const parent = node.parentNode;
        const text = node.textContent;
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((part) => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else if (part.length) {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        parent.replaceChild(frag, node);
      });
    };

    wordTargets.forEach(splitWords);

    if ('IntersectionObserver' in window) {
      const wordObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            wordObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      wordTargets.forEach((el) => wordObs.observe(el));
    } else {
      wordTargets.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // ---------- Scroll progress bar (gold thin line, haut de page) ----------
  (() => {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrolled / max)) : 0;
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  // ---------- SIGNATURES EDITORIALES (liste + photo sticky) ---------- 
  // Pattern Mister Pio : hover/click sur un item ou un tab -> change la photo,
  // le caption et le counter. Accessible clavier via tabindex + Enter/Space.
  (() => {
    const section = document.querySelector('.signatures');
    if (!section) return;

    const items  = section.querySelectorAll('.ed-list-item');
    const tabs   = section.querySelectorAll('.ed-tab');
    const photos = section.querySelectorAll('.ed-photo img');
    const kicker = section.querySelector('[data-kicker]');
    const title  = section.querySelector('[data-title]');
    const counter = section.querySelector('[data-counter]');

    // Donnees des plats (captions contextuels)
    const data = {
      brunch:   { kicker: 'Le matin, servi jusqu\'a 14h', title: 'Brunch Beldi',    num: '\u0661' },
      kefta:    { kicker: 'A midi, a emporter ou sur place', title: 'Pain, Kefta',   num: '\u0662' },
      tajine:   { kicker: 'Le soir, plat en terre cuite',   title: 'Tajine kefta',  num: '\u0663' },
      couscous: { kicker: 'Vendredi midi, comme au bled',   title: 'Couscous royal', num: '\u0664' },
    };
    const order = ['brunch', 'kefta', 'tajine', 'couscous'];
    const total = '\u0664'; // 4 en chiffres arabes

    const activate = (sig) => {
      if (!data[sig]) return;
      items.forEach((it) => it.classList.toggle('is-active', it.dataset.sig === sig));
      tabs.forEach((tb) => tb.classList.toggle('is-active', tb.dataset.sig === sig));
      photos.forEach((ph) => ph.classList.toggle('is-active', ph.dataset.sig === sig));
      if (kicker) kicker.textContent = data[sig].kicker;
      if (title)  title.textContent  = data[sig].title;
      if (counter) counter.textContent = `${data[sig].num} / ${total}`;
    };

    // Hover + click sur items
    items.forEach((item) => {
      item.addEventListener('mouseenter', () => activate(item.dataset.sig));
      item.addEventListener('focus',      () => activate(item.dataset.sig));
      item.addEventListener('click',      () => activate(item.dataset.sig));
      // Accessibilite clavier
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(item.dataset.sig);
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const idx = order.indexOf(item.dataset.sig);
          const next = order[(idx + 1) % order.length];
          activate(next);
          (section.querySelector(`.ed-list-item[data-sig="${next}"]`) || {}).focus?.();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = order.indexOf(item.dataset.sig);
          const prev = order[(idx - 1 + order.length) % order.length];
          activate(prev);
          (section.querySelector(`.ed-list-item[data-sig="${prev}"]`) || {}).focus?.();
        }
      });
    });

    // Click sur tabs
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activate(tab.dataset.sig));
    });
  })();
})();
