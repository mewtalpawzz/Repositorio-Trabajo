document.addEventListener('DOMContentLoaded', () => {
  const overlay     = document.getElementById('modal');
  if (!overlay) return;
  const panel       = overlay.querySelector('.modal-panel');
  const modalTag    = overlay.querySelector('#modal-tag');
  const modalTitle  = overlay.querySelector('#modal-title');
  const videoLink   = overlay.querySelector('#modal-video-link');
  const videoTitulo = overlay.querySelector('#modal-video-titulo');
  const resena      = overlay.querySelector('#modal-resena');
  const input       = overlay.querySelector('#comment-input');
  const btnComment  = overlay.querySelector('#btn-comment');
  const commentList = overlay.querySelector('#comment-list');

  // [NUEVO] Referencia al elemento de audio
  const audioPlayer = document.getElementById('modal-audio');

  /* ── Abrir ── */
  const open = (card) => {
    if (modalTag)    modalTag.textContent    = card.dataset.tag   || '';
    if (modalTitle)  modalTitle.textContent  = card.dataset.title || '';
    if (videoLink)   videoLink.href          = card.dataset.video || '#';
    if (videoTitulo) videoTitulo.textContent = card.dataset.title || '';

    // [NUEVO] Reproducir música al abrir
   if (audioPlayer && card.dataset.audio) {
      audioPlayer.pause(); 
      audioPlayer.src = ""; // Vaciamos primero
      audioPlayer.load(); 
      
      // Asignamos la nueva ruta
      audioPlayer.src = card.dataset.audio;
      audioPlayer.volume = 0.4;

      setTimeout(() => {
        audioPlayer.play().catch(e => console.error("Error al reproducir:", e));
      }, 200); // Damos un poco más de tiempo para la carga
    }

    if (resena) {
      const parrafos = (card.dataset.review || '').split(/<br\s*\/?>\s*<br\s*\/?>/i);
      resena.innerHTML = parrafos.map(p => `<p>${p.trim()}</p>`).join('');
    }

    if (commentList) commentList.innerHTML = '<p class="no-comments">Sé el primero en comentar.</p>';
    if (input) input.value = '';

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('abierto')));
  };

  /* ── Cerrar ── */
  const close = () => {
    // [NUEVO] Detener música al salir
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      audioPlayer.src = ""; // Limpiar fuente para evitar ruidos residuales
    }

    overlay.classList.remove('abierto');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 400); // 400ms para coincidir con la transición CSS
  };

  /* ── Cards ── */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      open(card);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });

  /* ── Eventos de Cierre ── */
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
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `<strong>Visitante</strong><span>${txt}</span>`;
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