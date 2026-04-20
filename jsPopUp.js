document.addEventListener('DOMContentLoaded', () => {
  const modal        = document.getElementById('dynamicModal');
  if (!modal) return;

  const closeBtn     = modal.querySelector('.close-btn');
  const modalTag     = modal.querySelector('.modal-tag');
  const modalTitle   = modal.querySelector('#modal-title');
  const modalVideo   = modal.querySelector('#modal-video');
  const videoWrapper = modal.querySelector('.video-wrapper');
  const videoAviso   = modal.querySelector('.video-aviso');
  const modalResena  = modal.querySelector('#modal-resena');
  const commentInput = modal.querySelector('#comment-input');
  const btnComment   = modal.querySelector('#btn-add-comment');
  const commentList  = modal.querySelector('#comment-list');
  const cards        = document.querySelectorAll('.card');

  /* Detecta si la página está siendo servida en local (file://) */
  const esLocal = location.protocol === 'file:';

  /* ── Abrir modal ── */
  const openModal = (card) => {
    const title  = card.dataset.title  || '';
    const video  = card.dataset.video  || '';
    const review = card.dataset.review || '';
    const tag    = card.querySelector('.card-tag')?.textContent || '';

    /* Cabecera */
    if (modalTag)   modalTag.textContent  = tag;
    if (modalTitle) modalTitle.textContent = title;

    /* Vídeo */
    if (esLocal) {
      /* En local YouTube rechaza la conexión — mostramos aviso y enlace directo */
      videoWrapper.classList.add('sin-servidor');
      if (videoAviso) {
        const ytUrl = video.replace('/embed/', '/watch?v=');
        videoAviso.innerHTML = `
          <span class="aviso-icono">▶</span>
          <p>Los vídeos de YouTube no se pueden cargar<br>al abrir el archivo en local.</p>
          <a href="${ytUrl}" target="_blank" rel="noopener">Abrir en YouTube →</a>`;
        videoAviso.style.display = 'flex';
      }
      modalVideo.src = '';
    } else {
      videoWrapper.classList.remove('sin-servidor');
      if (videoAviso) videoAviso.style.display = 'none';
      modalVideo.src = video + '?autoplay=1&rel=0';
    }

    /* Reseña — los párrafos separados por <br><br> se convierten en <p> */
    if (modalResena) {
      const parrafos = review.split(/<br\s*\/?><br\s*\/?>/i);
      modalResena.innerHTML = parrafos.map(p => `<p>${p.trim()}</p>`).join('');
    }

    /* Comentarios */
    commentList.innerHTML = '<p class="no-comments">Sé el primero en comentar.</p>';
    if (commentInput) commentInput.value = '';

    /* Mostrar */
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add('modal--visible'));
    });
  };

  /* ── Cerrar modal ── */
  const closeModal = () => {
    modal.classList.remove('modal--visible');
    setTimeout(() => {
      modal.style.display = 'none';
      modalVideo.src = '';
      document.body.style.overflow = '';
    }, 300);
  };

  /* ── Eventos de cierre ── */
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── Clicks en cards ── */
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });

  /* ── Añadir comentario ── */
  const addComment = () => {
    const text = commentInput?.value.trim();
    if (!text) {
      commentInput?.classList.add('shake');
      setTimeout(() => commentInput?.classList.remove('shake'), 400);
      return;
    }

    /* Quitar placeholder si existe */
    const placeholder = commentList.querySelector('.no-comments');
    if (placeholder) placeholder.remove();

    /* Crear elemento */
    const item = document.createElement('div');
    item.classList.add('comment-item');
    const textNode = document.createTextNode(text); // evita XSS
    const strong = document.createElement('strong');
    strong.textContent = 'Visitante';
    item.appendChild(strong);
    item.appendChild(textNode);
    commentList.prepend(item);

    /* Feedback visual en el botón */
    const originalText = btnComment.textContent;
    btnComment.textContent = '✓ Publicado';
    btnComment.classList.add('enviado');
    setTimeout(() => {
      btnComment.textContent = originalText;
      btnComment.classList.remove('enviado');
    }, 1800);

    commentInput.value = '';
    commentInput.focus();
  };

  btnComment?.addEventListener('click', addComment);
  commentInput?.addEventListener('keydown', e => { if (e.key === 'Enter') addComment(); });
});
