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

/* Abre um modal com ABAS. topNode é um conteúdo fixo no topo (ex.: um
   retrato). tabs = [{ label, render: () => DOMNode }]. A 1ª aba fica ativa
   por default; clicar numa aba troca o conteúdo abaixo dos botões. */
export function openTabbedModal({ title = "", topNode = null, tabs = [] }) {
  const body = document.createElement("div");
  if (topNode) body.appendChild(topNode);

  const tabRow = document.createElement("div");
  tabRow.className = "modal-tabs";

  const content = document.createElement("div");
  content.className = "modal-tab-content";

  const btns = [];
  function select(i) {
    btns.forEach((b, j) => b.classList.toggle("active", j === i));
    content.replaceChildren(tabs[i].render());
  }

  tabs.forEach((tab, i) => {
    const b = document.createElement("button");
    b.className = "tab-btn";
    b.textContent = tab.label;
    b.onclick = () => select(i);
    btns.push(b);
    tabRow.appendChild(b);
  });

  body.appendChild(tabRow);
  body.appendChild(content);
  if (tabs.length) select(0);   // 1ª aba ativa por default

  return openModal({ title, bodyNode: body });
}

/* Abre um modal de confirmação com dois botões (Sim/Não).
   onConfirm é chamado só se o jogador confirmar. */
export function openConfirm({ title = "Confirmar", message = "", confirmLabel = "Sim", cancelLabel = "Não", onConfirm }) {
  const body = document.createElement("div");

  const msg = document.createElement("p");
  msg.style.margin = "0 0 16px";
  msg.style.lineHeight = "1.5";
  msg.textContent = message;
  body.appendChild(msg);

  const row = document.createElement("div");
  row.className = "btn-row";
  row.style.justifyContent = "flex-end";

  const no = document.createElement("button");
  no.textContent = cancelLabel;

  const yes = document.createElement("button");
  yes.className = "danger";
  yes.textContent = confirmLabel;

  row.appendChild(no);
  row.appendChild(yes);
  body.appendChild(row);

  const { close } = openModal({ title, bodyNode: body });
  no.onclick = () => close();
  yes.onclick = () => { close(); onConfirm?.(); };
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
