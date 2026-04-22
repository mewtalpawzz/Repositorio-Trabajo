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

  /* ── Abrir ── */
  const open = (card) => {
    if (modalTag)    modalTag.textContent    = card.dataset.tag   || '';
    if (modalTitle)  modalTitle.textContent  = card.dataset.title || '';
    if (videoLink)   videoLink.href          = card.dataset.video || '#';
    if (videoTitulo) videoTitulo.textContent = card.dataset.title || '';

    // Reseña: convierte <br><br> en párrafos reales
    if (resena) {
      const parrafos = (card.dataset.review || '').split(/<br\s*\/?>\s*<br\s*\/?>/i);
      resena.innerHTML = parrafos.map(p => `<p>${p.trim()}</p>`).join('');
    }

    if (commentList) commentList.innerHTML = '<p class="no-comments">Sé el primero en comentar.</p>';
    if (input) input.value = '';

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Doble rAF garantiza que display:flex esté pintado antes de activar la transición CSS
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('abierto')));
  };

  /* ── Cerrar ── */
  const close = () => {
    overlay.classList.remove('abierto');
    panel.addEventListener('transitionend', () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, { once: true });
  };

  /* ── Cards ── */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });

  /* ── Cerrar ── */
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
    const strong = document.createElement('strong');
    strong.textContent = 'Visitante';
    const span = document.createElement('span');
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
