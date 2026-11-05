/* ============================================================
   ui.js — peças de interface reutilizáveis: modais.

   Implementado com o elemento NATIVO <dialog> + showModal(). Isso
   coloca o modal na "top layer" do navegador, que fica ACIMA de tudo
   e é imune a: transform/filter em ancestrais (extensões como Dark
   Reader quebram position:fixed), guerras de z-index e clipping de
   overflow. É o jeito mais robusto de garantir que o modal apareça.

   Esc fecha (comportamento nativo do <dialog>); clicar no fundo
   (backdrop) também fecha.
   ============================================================ */

/* Abre um modal genérico. title = cabeçalho; bodyNode = conteúdo DOM. */
export function openModal({ title = "", bodyNode }) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal-dialog";

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
  dialog.appendChild(modal);
  document.body.appendChild(dialog);

  close.onclick = () => dialog.close();
  // Clique no backdrop (fora do conteúdo) fecha: o alvo é o próprio <dialog>.
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  // Ao fechar (X, Esc, backdrop), remove do DOM.
  dialog.addEventListener("close", () => dialog.remove());

  dialog.showModal();
  return { dialog, close: () => dialog.close() };
}

/* Abre uma imagem em tela cheia, com X para fechar. */
export function openImageModal(src, alt = "") {
  const dialog = document.createElement("dialog");
  dialog.className = "image-dialog";

  const close = document.createElement("button");
  close.className = "image-close";
  close.textContent = "✕";
  close.title = "Fechar";

  const img = document.createElement("img");
  img.className = "image-full";
  img.src = src;
  img.alt = alt;

  dialog.appendChild(close);
  dialog.appendChild(img);
  document.body.appendChild(dialog);

  close.onclick = () => dialog.close();
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => dialog.remove());

  dialog.showModal();
}
