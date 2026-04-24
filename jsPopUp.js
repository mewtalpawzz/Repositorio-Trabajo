document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     MÚSICA DE FONDO
     Arranca en el primer click del usuario
     (obligatorio por política del navegador)
  ══════════════════════════════════════════ */
  const bgAudio   = document.getElementById('bg-audio');
  const bgControl = document.getElementById('bg-control');
  const bgIcon    = document.getElementById('bg-icon');
  let bgStarted   = false;
  let bgMuted     = false;
  const BG_VOL    = 0.15;

  const fadeIn = (audio, target, ms = 1500) => {
    audio.volume = 0;
    const steps    = 40;
    const stepVol  = target / steps;
    const stepTime = ms / steps;
    let i = 0;
    const t = setInterval(() => {
      i++;
      audio.volume = Math.min(target, audio.volume + stepVol);
      if (i >= steps) clearInterval(t);
    }, stepTime);
  };

  const fadeTo = (audio, target, ms = 800) => {
    const start    = audio.volume;
    const diff     = target - start;
    const steps    = 20;
    const stepTime = ms / steps;
    let i = 0;
    const t = setInterval(() => {
      i++;
      audio.volume = Math.max(0, Math.min(1, start + diff * (i / steps)));
      if (i >= steps) clearInterval(t);
    }, stepTime);
  };

  if (bgAudio && bgControl) {
    bgAudio.loop    = true;
    bgAudio.volume  = 0;

    const startBg = () => {
      if (bgStarted) return;
      bgStarted = true;
      bgAudio.play()
        .then(() => {
          fadeIn(bgAudio, BG_VOL);
          bgControl.classList.add('visible');
        })
        .catch(() => {
          // Algunos navegadores bloquean incluso con interacción; lo intentamos 1 vez más
          setTimeout(() => {
            bgAudio.play().then(() => {
              fadeIn(bgAudio, BG_VOL);
              bgControl.classList.add('visible');
            }).catch(() => {});
          }, 500);
        });
    };

    // Primer gesto del usuario
    ['click','keydown','touchstart'].forEach(ev =>
      document.addEventListener(ev, startBg, { once: true })
    );

    bgControl.addEventListener('click', (e) => {
      e.stopPropagation(); // no activa startBg de nuevo
      bgMuted = !bgMuted;
      if (bgMuted) {
        fadeTo(bgAudio, 0);
        bgIcon.textContent    = '🔇';
        bgControl.title       = 'Activar música';
      } else {
        fadeTo(bgAudio, BG_VOL);
        bgIcon.textContent    = '🎵';
        bgControl.title       = 'Silenciar música';
      }
    });
  }

  /* ══════════════════════════════════════════
     MODAL + AUDIO DEL POPUP
  ══════════════════════════════════════════ */
  const overlay     = document.getElementById('modal');
  if (!overlay) return;

  const modalTag    = overlay.querySelector('#modal-tag');
  const modalTitle  = overlay.querySelector('#modal-title');
  const videoLink   = overlay.querySelector('#modal-video-link');
  const videoTitulo = overlay.querySelector('#modal-video-titulo');
  const resena      = overlay.querySelector('#modal-resena');
  const input       = overlay.querySelector('#comment-input');
  const btnComment  = overlay.querySelector('#btn-comment');
  const commentList = overlay.querySelector('#comment-list');
  const popupAudio  = document.getElementById('modal-audio');

  let isClosing = false;

  /* ── Abrir modal ── */
  const open = (card) => {
    if (isClosing) return;

    if (modalTag)    modalTag.textContent    = card.dataset.tag   || '';
    if (modalTitle)  modalTitle.textContent  = card.dataset.title || '';
    if (videoLink)   videoLink.href          = card.dataset.video || '#';
    if (videoTitulo) videoTitulo.textContent = card.dataset.title || '';

    if (resena) {
      const parrafos = (card.dataset.review || '').split(/<br\s*\/?>\s*<br\s*\/?>/i);
      resena.innerHTML = parrafos.map(p => `<p>${p.trim()}</p>`).join('');
    }
    if (commentList) commentList.innerHTML = '<p class="no-comments">Sé el primero en comentar.</p>';
    if (input) input.value = '';

    // Bajar fondo mientras está el popup
    if (bgAudio && !bgAudio.paused) fadeTo(bgAudio, 0.04);

    // Audio del popup
    if (popupAudio && card.dataset.audio) {
      popupAudio.pause();
      popupAudio.src = '';
      popupAudio.load();           // resetea estado interno antes de cambiar src
      popupAudio.volume = 0.5;
      popupAudio.src = card.dataset.audio;

      // Intentamos play() en cuanto el navegador lo permita.
      // play() devuelve una Promise; la encadenamos para no perder el gesto de usuario.
      const tryPlay = () => popupAudio.play().catch(() => {});

      // readyState >= 3 → HAVE_FUTURE_DATA: ya hay suficiente para reproducir
      if (popupAudio.readyState >= 3) {
        tryPlay();
      } else {
        popupAudio.addEventListener('canplay', tryPlay, { once: true });
        // Fallback por si canplay nunca llega (red lenta / formato no soportado)
        popupAudio.load();
      }
    }

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('abierto')));
  };

  /* ── Cerrar modal ── */
  const close = () => {
    if (isClosing) return;
    isClosing = true;

    // Parar audio del popup
    if (popupAudio) {
      popupAudio.pause();
      popupAudio.currentTime = 0;
      // No borramos src: borrar src provoca errores de media en algunos navegadores
    }

    // Restaurar volumen de fondo
    if (bgAudio && !bgAudio.paused && !bgMuted) fadeTo(bgAudio, BG_VOL);

    overlay.classList.remove('abierto');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      isClosing = false;
    }, 450);
  };

  /* ── Cards ── */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });

  /* ── Cierre ── */
  overlay.querySelector('.close-btn')?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('abierto')) close();
  });

  /* ── Comentarios ── */
  const addComment = () => {
    const txt = input?.value.trim();
    if (!txt) return;
    overlay.querySelector('.no-comments')?.remove();
    const item   = document.createElement('div');
    item.className = 'comment-item';
    const strong = document.createElement('strong');
    strong.textContent = 'Visitante';
    const span   = document.createElement('span');
    span.textContent = txt;
    item.append(strong, span);
    commentList.prepend(item);
    input.value = '';
    const orig = btnComment.textContent;
    btnComment.textContent = '✓ Enviado';
    btnComment.classList.add('enviado');
    setTimeout(() => { btnComment.textContent = orig; btnComment.classList.remove('enviado'); }, 1800);
  };

  btnComment?.addEventListener('click', addComment);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') addComment(); });
});
