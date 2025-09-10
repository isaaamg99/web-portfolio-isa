document.addEventListener('DOMContentLoaded', () => {
  const faders = document.querySelectorAll('.fade-in');
  const navbar = document.getElementById('navbar');

  // Observer para elementos fade-in
  const appearOptions = { threshold: 0.1 };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => appearOnScroll.observe(fader));

  // Mostrar la barra de navegación al hacer scroll
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      navbar.classList.add('visible');
    } else {
      navbar.classList.remove('visible');
    }
  });

  // Zoom del hero en función del scroll
  const hero = document.getElementById('hero');
  const maxScale = 1.1; // escala máxima (1.0 a 1.1)

  function updateHeroScale() {
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const progress = Math.min(Math.max((window.scrollY || window.pageYOffset) / (viewportH * 0.8), 0), 1);
    const scale = 1 + (maxScale - 1) * progress;
    document.documentElement.style.setProperty('--hero-scale', scale.toFixed(3));
  }

  updateHeroScale();
  window.addEventListener('scroll', updateHeroScale, { passive: true });
  window.addEventListener('resize', updateHeroScale);

  // Eliminado retraso escalonado en las tarjetas para no retrasar el hover

  // Blur del resto de la página mientras una tarjeta está en hover (sin foco/ventana)
  const pageBlur = document.querySelector('.page-blur-overlay');
  function attachHoverBlurHandlers(container) {
    const items = container.querySelectorAll('.gallery-item');
    items.forEach(item => {
      item.addEventListener('mouseenter', () => { pageBlur && pageBlur.classList.add('visible'); });
      item.addEventListener('mouseleave', () => { pageBlur && pageBlur.classList.remove('visible'); });
    });
  }
  const gallery = document.querySelector('#gallery');
  attachHoverBlurHandlers(gallery);

  // Datos por estilo y despliegue bajo la galería
  const STYLE_DATA = {
    'ilustracion-digital': [
      'ilustracion-digital/chica-ordenador-flat.png',
      'ilustracion-digital/personaje-verde-digital.png',
      'ilustracion-digital/retrato-cartoon-1.jpg',
      'ilustracion-digital/nino-osito-cartoon.jpg',
      'ilustracion-digital/retrato-comic-noir.jpg',
      'ilustracion-digital/pop-art-mosaico-azul.jpg'
    ],
    'acuarela': [
      'acuarela/gato-acuarela.png',
      'acuarela/acuarela-animal.jpg',
      'acuarela/acuarela-decorativa-figura.jpg',
      'acuarela/acuarela-fruta-botanica.jpg'
    ],
    'oleo-acrilico': [
      'oleo-acrilico/paisaje-rio-arbol.jpg',
      'oleo-acrilico/paisaje-costa-barca.jpg',
      'oleo-acrilico/marina-velero.jpg',
      'oleo-acrilico/puerto-casa-agua.jpg',
      'oleo-acrilico/bodegon-limones.jpg',
      'oleo-acrilico/paisaje-invernal-nieve.jpg',
      'oleo-acrilico/paisaje-invernal-boceto.png',
      'oleo-acrilico/valle-campo-luminoso.png'
    ],
    'lapiz': [
      'lapiz/dibujo-lapiz-figura.png'
    ]
  };

  const styleResults = document.getElementById('style-results');

  function renderStyleResults(styleKey, coverSrc) {
    const list = STYLE_DATA[styleKey] || [];
    const items = list.filter(src => !coverSrc || !src.endsWith(coverSrc.split('/').pop()));
    const titleMap = {
      'ilustracion-digital': 'Ilustración Digital',
      'acuarela': 'Acuarela',
      'oleo-acrilico': 'Óleo / Acrílico',
      'lapiz': 'Lápiz'
    };
    styleResults.innerHTML = `
      <div class="title">${titleMap[styleKey] || ''}</div>
    `;
    items.forEach((src, idx) => {
      const el = document.createElement('div');
      el.className = 'gallery-item appear';
      el.innerHTML = `
        <img src="${src}" alt="${titleMap[styleKey] || 'Obra'} ${idx+1}">
        <div class="item-caption"><h3>${titleMap[styleKey] || ''}</h3><p>Obra ${idx+1}</p></div>
      `;
      styleResults.appendChild(el);
    });
    styleResults.classList.add('open');
    requestAnimationFrame(() => {
      styleResults.querySelectorAll('.appear').forEach((el, i) => {
        setTimeout(() => el.classList.add('show'), i * 60);
      });
    });
    attachHoverBlurHandlers(styleResults);
    styleResults.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // preparar apertura de visor al hacer click en cualquier obra
    const cards = Array.from(styleResults.querySelectorAll('.gallery-item'));
    setupLightbox(cards.map(card => card.querySelector('img')?.getAttribute('src') || ''), titleMap[styleKey] || styleKey);
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => openLightbox(idx));
    });
  }

  // Click en tarjetas principales
  gallery.querySelectorAll('.gallery-item').forEach(card => {
    card.addEventListener('click', () => {
      const styleKey = card.getAttribute('data-style');
      const img = card.querySelector('img');
      const coverSrc = img ? img.getAttribute('src') : '';
      renderStyleResults(styleKey, coverSrc);
    });
  });

  // Lightbox (visor) con navegación
  const LB = {
    root: document.getElementById('lightbox'),
    backdrop: document.querySelector('#lightbox .lightbox-backdrop'),
    content: document.querySelector('#lightbox .lightbox-content'),
    img: document.querySelector('#lightbox .lightbox-image'),
    title: document.querySelector('#lightbox .info-title'),
    metaDate: document.querySelector('#lightbox .meta-date'),
    metaTechnique: document.querySelector('#lightbox .meta-technique'),
    metaStyle: document.querySelector('#lightbox .meta-style'),
    btnClose: document.querySelector('#lightbox .lightbox-close'),
    btnPrev: document.querySelector('#lightbox .lightbox-nav.prev'),
    btnNext: document.querySelector('#lightbox .lightbox-nav.next')
  };

  let lbSources = [];
  let lbTitle = '';
  let lbIndex = 0;

  function setupLightbox(sources, title) {
    lbSources = sources.filter(Boolean);
    lbTitle = title;
  }

  function updateLightbox() {
    const src = lbSources[lbIndex];
    if (!src) return;
    LB.img.style.opacity = 0;
    setTimeout(() => {
      LB.img.setAttribute('src', src);
      LB.img.onload = () => { LB.img.style.opacity = 1; };
    }, 80);
    LB.title.textContent = lbTitle;
    // Datos ficticios
    LB.metaDate.textContent = new Date().toISOString().slice(0,10);
    LB.metaTechnique.textContent = 'Mixta / Digital';
    LB.metaStyle.textContent = lbTitle;
  }

  function openLightbox(index) {
    lbIndex = index;
    updateLightbox();
    LB.root.hidden = false;
    LB.root.classList.add('open');
  }

  function closeLightbox() {
    LB.root.classList.remove('open');
    setTimeout(() => { LB.root.hidden = true; }, 180);
  }

  LB.btnClose.addEventListener('click', closeLightbox);
  LB.backdrop.addEventListener('click', closeLightbox);
  LB.btnPrev.addEventListener('click', () => { lbIndex = (lbIndex - 1 + lbSources.length) % lbSources.length; updateLightbox(); });
  LB.btnNext.addEventListener('click', () => { lbIndex = (lbIndex + 1) % lbSources.length; updateLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (LB.root.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbSources.length) % lbSources.length; updateLightbox(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbSources.length; updateLightbox(); }
  });
});
 
