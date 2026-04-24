/* ═══════════════════════════════════════════════
   interactions.js — Age of The Dead · PlayAlmi
   jQuery + IntersectionObserver + Form Validation
   ═══════════════════════════════════════════════ */

/* ─── 1. INTERSECTION OBSERVER — Fade In on Scroll ─── */
(function initReveal() {
  // Añade clase .reveal a todos los elementos candidatos
  const selectors = [
    '.feat-card', '.top3-card', '.section-header',
    '.lb-table-card', '.podium-card', '.card',
    '.profile-header-card', '.stat-card', '.admin-card',
    '.auth-card'
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        // Escalonado automático según posición en grupo
        if (i % 4 === 1) el.classList.add('delay-1');
        if (i % 4 === 2) el.classList.add('delay-2');
        if (i % 4 === 3) el.classList.add('delay-3');
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Solo anima una vez
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ─── 2. JQUERY — Efectos Fade para modales y transiciones ─── */
$(function () {

  /* ── 2a. Fade In de página al cargar ── */
  $('body').hide().fadeIn(350);

  /* ── 2b. Fade Out al navegar a otro enlace ── */
  $(document).on('click', 'a[href]:not([href^="#"]):not([href^="javascript"]):not([target])', function (e) {
    const href = $(this).attr('href');
    if (!href || href === '#' || href === '') return;
    e.preventDefault();
    $('body').fadeOut(220, function () {
      window.location.href = href;
    });
  });

  /* ── 2c. Fade In/Out para modal-overlay (admin / perfil) ── */
  // Abrir modal con fadeIn
  $(document).on('click', '[data-modal-open]', function () {
    const target = $('#' + $(this).data('modal-open'));
    target.css({ display: 'flex', opacity: 0 }).animate({ opacity: 1 }, 280);
  });

  // Cerrar modal con fadeOut (clic en overlay o botón [data-modal-close])
  $(document).on('click', '.modal-overlay', function (e) {
    if ($(e.target).is('.modal-overlay')) {
      $(this).animate({ opacity: 0 }, 220, function () {
        $(this).css('display', 'none');
      });
    }
  });
  $(document).on('click', '[data-modal-close]', function () {
    $(this).closest('.modal-overlay').animate({ opacity: 0 }, 220, function () {
      $(this).css('display', 'none');
    });
  });

  /* ── 2d. Fade In en mensajes de error de formularios ── */
  // Observa cambios de texto en .form-error para animar su aparición
  document.querySelectorAll('.form-error').forEach(el => {
    const mo = new MutationObserver(() => {
      if (el.textContent.trim() !== '') {
        $(el).hide().fadeIn(300);
      }
    });
    mo.observe(el, { childList: true, characterData: true, subtree: true });
  });

  /* ── 2e. Efecto shake + borde rojo en inputs inválidos ── */
  $(document).on('blur', 'input[required]', function () {
    const val = $(this).val().trim();
    if (val === '') {
      $(this).addClass('input-error');
    } else {
      $(this).removeClass('input-error');
    }
  });
  $(document).on('input', 'input.input-error', function () {
    if ($(this).val().trim() !== '') {
      $(this).removeClass('input-error');
    }
  });

  /* ── 2f. Navbar: highlight enlace activo ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $('.nav-links a').each(function () {
    const href = $(this).attr('href');
    if (href && currentPage.includes(href.replace('.html', ''))) {
      $(this).addClass('active');
    }
  });

  /* ── 2g. Menú hamburguesa en móvil (si se añade el botón) ── */
  $(document).on('click', '#nav-hamburger', function () {
    const $menu = $('#nav-mobile-menu');
    if ($menu.is(':visible')) {
      $menu.slideUp(220);
      $(this).attr('aria-expanded', 'false');
    } else {
      $menu.slideDown(220);
      $(this).attr('aria-expanded', 'true');
    }
  });

  /* ── 2h. Toast con fadeIn/fadeOut controlado por jQuery ── */
  // Reemplaza showToast global para que use jQuery si está disponible
  if (typeof showToast === 'function') {
    window._origShowToast = window.showToast;
  }
  window.showToast = function (msg, type = 'success') {
    let $t = $('#toast');
    if (!$t.length) {
      $t = $('<div id="toast"></div>').appendTo('body');
    }
    clearTimeout(window._toastTimer);
    $t.text(msg)
      .attr('class', `toast ${type}`)
      .css({ transform: 'translateY(110px)', opacity: 0, display: 'block' })
      .animate({ opacity: 1 }, 280)
      .css('transform', 'translateY(0)');
    window._toastTimer = setTimeout(() => {
      $t.animate({ opacity: 0 }, 280, function () {
        $(this).css('display', 'none');
      });
    }, 3500);
  };

});


/* ─── 3. REVEAL tardío para elementos cargados dinámicamente (API) ─── */
// Llama a esta función tras renderizar contenido dinámico (ranking, users, etc.)
window.revealNewElements = function () {
  const selectors = '.feat-card, .top3-card, .card, .lb-row, .podium-card, .stat-card';
  $(selectors).not('.reveal').each(function (i) {
    const el = this;
    el.classList.add('reveal');
    setTimeout(() => el.classList.add('visible'), i * 60);
  });
};