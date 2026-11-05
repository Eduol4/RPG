/* ============================================================
   ui.js — peças de interface reutilizáveis: modais.

   Sem dependências e sem conteúdo de jogo: só "janelas" que abrem
   por cima de tudo. Usado pelo log, pelo perfil da personagem e
   pela visualização de imagem em tela cheia.
   ============================================================ */

/* Abre um modal genérico por cima da tela.
   - title: texto do cabeçalho (opcional).
   - bodyNode: um elemento DOM com o conteúdo.
   Fecha no X, clicando fora, ou com Esc. */
export function openModal({ title = "", bodyNode }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  const header = document.createElement("div");
  header.className = "modal-header";
  const h = document.createElement("h3");
  h.className = "modal-title";
  h.textContent = title;
  const close = document.createElement("button");
  close.className = "modal-close";
  close.textContent = "✕";
  close.title = "Fechar";
  header.appendChild(h);
  header.appendChild(close);

  const body = document.createElement("div");
  body.className = "modal-body";
  if (bodyNode) body.appendChild(bodyNode);

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function dismiss() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") dismiss(); }

  close.onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };
  document.addEventListener("keydown", onKey);

  return { overlay, close: dismiss };
}

/* Abre uma imagem em tela cheia, com X para fechar. `src` é a URL
   já resolvida (a função image() de assets.js passa img.src). */
export function openImageModal(src, alt = "") {
  const overlay = document.createElement("div");
  overlay.className = "image-overlay";

  const close = document.createElement("button");
  close.className = "image-close";
  close.textContent = "✕";
  close.title = "Fechar";

  const img = document.createElement("img");
  img.className = "image-full";
  img.src = src;
  img.alt = alt;

  overlay.appendChild(close);
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  function dismiss() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") dismiss(); }

  close.onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };
  document.addEventListener("keydown", onKey);
}
