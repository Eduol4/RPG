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

  const col = document.createElement("div");
  col.className = "btn-col";   // vertical, para caber no retângulo lateral
  runState.inventory.forEach((itemId, idx) => {
    const item = getItem(itemId);
    const btn = document.createElement("button");
    btn.textContent = `${item.icon} ${item.name}`;
    btn.title = item.desc;
    btn.onclick = () => {
      const msg = item.use(runState);
      runState.inventory.splice(idx, 1);   // consome
      onLog?.(msg);
      onChange?.();
    };
    col.appendChild(btn);
  });
  container.appendChild(col);
}
