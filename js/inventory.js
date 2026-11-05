/* ============================================================
   inventory.js — uso de itens dentro da run.
   Simples de propósito: lista os itens do runState e os usa.
   ============================================================ */

import { getItem } from "./data/items.js";

/* Desenha a lista de itens como botões. Ao clicar, usa o item,
   registra a mensagem via onLog e redesenha via onChange. */
export function renderInventory(container, runState, { onLog, onChange }) {
  container.innerHTML = "";
  const title = document.createElement("div");
  title.className = "muted";
  title.style.marginBottom = "8px";
  title.textContent = "Inventário";
  container.appendChild(title);

  if (runState.inventory.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "(vazio)";
    container.appendChild(empty);
    return;
  }

  // Agrupa itens repetidos: em vez de listar um embaixo do outro, mostra
  // "Nome (xN)". A ordem segue a primeira aparição de cada item.
  const counts = {};
  const ordem = [];
  runState.inventory.forEach(id => {
    if (counts[id] === undefined) { counts[id] = 0; ordem.push(id); }
    counts[id]++;
  });

  const col = document.createElement("div");
  col.className = "btn-col";   // vertical, para caber no retângulo lateral
  ordem.forEach(itemId => {
    const item = getItem(itemId);
    const qtd = counts[itemId];
    const btn = document.createElement("button");
    btn.textContent = `${item.icon} ${item.name}` + (qtd > 1 ? ` (x${qtd})` : "");
    btn.title = item.desc;
    btn.onclick = () => {
      const msg = item.use(runState);
      // Consome UMA unidade (remove a primeira ocorrência deste item).
      const idx = runState.inventory.indexOf(itemId);
      if (idx >= 0) runState.inventory.splice(idx, 1);
      onLog?.(msg);
      onChange?.();
    };
    col.appendChild(btn);
  });
  container.appendChild(col);
}
