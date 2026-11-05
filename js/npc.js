/* ============================================================
   npc.js — ESTADO de interação com NPC.

   Tela dedicada, montada na mesma base da tela de combate: imagem
   da personagem à esquerda, imagem do NPC à direita, e o diálogo
   mostrado AQUI (não mais no log). O log só registra o que o NPC
   dá ou tira da personagem (ouro, itens...), nunca a fala.

   Memória: a fala de reencontro aparece a partir da 2ª vez,
   lendo a flag salva no save permanente da personagem.
   ============================================================ */

import { getNpc } from "./data/rooms.js";
import { getItem } from "./data/items.js";
import { image } from "./assets.js";
import { Save } from "./state.js";
import { pushLog } from "./navigation.js";

export const NpcState = {
  render(root, ctx, Game) {
    const { run, npcRef, poiId } = ctx.npc;
    const npc = getNpc(npcRef);
    const charId = run.character.id;
    const jaConheceu = Save.hasFlag(charId, npc.memoryFlag);

    const panel = document.createElement("div");
    panel.className = "panel center";
    panel.innerHTML = `<h2>💬 ${npc.name}</h2>`;

    // Mesma estrutura visual da tela de combate: duas figuras, metade cada.
    const figures = document.createElement("div");
    figures.className = "combat-figures";

    const figHero = document.createElement("div");
    figHero.className = "combat-fig";
    const heroImg = run.character.combatImg || run.character.portrait;
    figHero.appendChild(image(heroImg, { width: "100%", alt: run.character.name }));
    const capHero = document.createElement("div");
    capHero.className = "poi-sub";
    capHero.textContent = run.character.name;
    figHero.appendChild(capHero);

    const figNpc = document.createElement("div");
    figNpc.className = "combat-fig";
    figNpc.appendChild(image(npc.sprite, { width: "100%", alt: npc.name }));
    const capNpc = document.createElement("div");
    capNpc.className = "poi-sub";
    capNpc.textContent = npc.name;
    figNpc.appendChild(capNpc);

    figures.appendChild(figHero);
    figures.appendChild(figNpc);
    panel.appendChild(figures);

    // Diálogo (fica SÓ nesta tela, não vai para o log).
    const fala = document.createElement("p");
    fala.className = "npc-dialogue";
    fala.textContent = jaConheceu ? npc.reunion : npc.firstMeet;
    panel.appendChild(fala);

    // Continuar: aplica recompensa, grava memória, registra no log APENAS
    // o que mudou no inventário/recursos, e volta para a run.
    const row = document.createElement("div");
    row.className = "btn-row";
    row.style.justifyContent = "center";

    const cont = document.createElement("button");
    cont.className = "primary";
    cont.textContent = "Continuar";
    cont.onclick = () => {
      if (!jaConheceu) Save.setFlag(charId, npc.memoryFlag, true);

      if (npc.reward?.gold) {
        run.runGold += npc.reward.gold;
        pushLog(run, `${npc.name}: +${npc.reward.gold} ouro.`);
      }
      if (Array.isArray(npc.reward?.items)) {
        npc.reward.items.forEach(itemId => {
          run.inventory.push(itemId);
          pushLog(run, `${npc.name}: recebeu ${getItem(itemId)?.name ?? itemId}.`);
        });
      }
      if (Array.isArray(npc.reward?.removeItems)) {
        npc.reward.removeItems.forEach(itemId => {
          const idx = run.inventory.indexOf(itemId);
          if (idx >= 0) {
            run.inventory.splice(idx, 1);
            pushLog(run, `${npc.name}: levou ${getItem(itemId)?.name ?? itemId}.`);
          }
        });
      }

      markResolved(run, poiId);
      Game.go("run", { run });
    };

    row.appendChild(cont);
    panel.appendChild(row);
    root.appendChild(panel);
  },
};

function markResolved(run, poiId) {
  const room = run.rooms[run.currentRoom];
  const poi = room.pois.find(p => p.id === poiId);
  if (poi) poi.resolved = true;
}
