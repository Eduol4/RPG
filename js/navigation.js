/* ============================================================
   navigation.js — ESTADO de run / exploração (modelo ABSTRATO).

   A sala é mostrada como uma lista de pontos de interesse (POIs).
   Você clica no que quer abordar; não há avatar nem grade. Isso é
   a "navegação espacial expressa por texto". Se um dia quisermos o
   avatar numa grade, esta estrutura continua valendo por baixo.

   Fluxo:
   - inimigo -> entra no estado de combate
   - item    -> adiciona ao inventário
   - npc     -> diálogo simples (com memória de reencontro)
   - saída   -> próxima sala, ou vitória se for a última
   ============================================================ */

import { getItem } from "./data/items.js";
import { getNpc } from "./data/rooms.js";
import { Save } from "./state.js";
import { renderInventory } from "./inventory.js";
import { image, sfx } from "./assets.js";

const ICON = { enemy: "⚔️", item: "🎁", npc: "💬", exit: "🚪" };

export const RunState = {
  render(root, ctx, Game) {
    const run = ctx.run;
    const room = run.rooms[run.currentRoom];

    // ---------- HUD ----------
    root.appendChild(renderHud(run));

    // ---------- Log narrativo ----------
    const log = document.createElement("div");
    log.className = "log";
    const firstLine = document.createElement("p");
    firstLine.className = "line";
    firstLine.textContent = ctx.pendingLog
      ? ctx.pendingLog
      : `Sala ${run.currentRoom + 1} de ${run.rooms.length}. Você observa os arredores.`;
    log.appendChild(firstLine);
    ctx.pendingLog = null;   // consome a mensagem pendente
    root.appendChild(log);
    const pushLog = (text) => {
      const p = document.createElement("p");
      p.className = "line";
      p.textContent = text;
      log.appendChild(p);
    };

    // ---------- Fundo da sala (opcional) ----------
    if (room.bg) {
      const bg = image(room.bg, { height: "140px", alt: "cenário" });
      bg.style.marginBottom = "16px";
      root.appendChild(bg);
    }

    // ---------- Pontos de interesse ----------
    const list = document.createElement("div");
    list.className = "panel btn-col";

    const unresolved = room.pois.filter(p => !p.resolved && p.type !== "exit");

    room.pois.forEach(poi => {
      if (poi.resolved) return;

      // A saída só fica disponível quando a sala está "limpa".
      if (poi.type === "exit" && unresolved.length > 0) {
        list.appendChild(makePoi(poi, "A saída (limpe a sala para avançar)", true));
        return;
      }

      const label = labelFor(poi);
      const btn = makePoi(poi, label, false);
      btn.onclick = () => handlePoi(poi, run, ctx, Game, pushLog);
      list.appendChild(btn);
    });

    root.appendChild(list);

    // ---------- Inventário ----------
    const inv = document.createElement("div");
    inv.className = "panel";
    root.appendChild(inv);
    renderInventory(inv, run, {
      onLog: pushLog,
      onChange: () => { Game.render(); },
    });

    // ---------- Rodapé: abandonar run ----------
    const foot = document.createElement("div");
    foot.className = "btn-row";
    const quit = document.createElement("button");
    quit.textContent = "Abandonar run (voltar ao menu)";
    quit.onclick = () => Game.go("menu", {});
    foot.appendChild(quit);
    root.appendChild(foot);
  },
};

/* ---------- helpers ---------- */

function labelFor(poi) {
  switch (poi.type) {
    case "enemy": return "Um inimigo à espreita";
    case "item":  return `Um item: ${getItem(poi.ref)?.name ?? poi.ref}`;
    case "npc":   return `Alguém: ${getNpc(poi.ref)?.name ?? poi.ref}`;
    case "exit":  return "Seguir para a próxima sala";
    default:      return poi.type;
  }
}

function makePoi(poi, label, disabled) {
  const btn = document.createElement("button");
  btn.className = "poi " + poi.type;
  btn.disabled = disabled;
  btn.innerHTML = `
    <span class="poi-icon">${ICON[poi.type] ?? "?"}</span>
    <span class="poi-label">${label}</span>`;
  return btn;
}

function handlePoi(poi, run, ctx, Game, pushLog) {
  switch (poi.type) {
    case "enemy":
      Game.go("combat", { combat: { run, enemyRef: poi.ref, poiId: poi.id } });
      return;

    case "item": {
      run.inventory.push(poi.ref);
      poi.resolved = true;
      sfx("item_pegar.wav");
      pushLog(`Você pegou: ${getItem(poi.ref)?.name ?? poi.ref}.`);
      Game.render();
      return;
    }

    case "npc": {
      const npc = getNpc(poi.ref);
      const charId = run.character.id;
      // MEMÓRIA: primeira vez vs. reencontro, lido do save permanente.
      const jaConheceu = Save.hasFlag(charId, npc.memoryFlag);
      pushLog(jaConheceu ? npc.reunion : npc.firstMeet);
      if (!jaConheceu) Save.setFlag(charId, npc.memoryFlag, true);
      if (npc.reward?.gold) {
        run.runGold += npc.reward.gold;
        pushLog(`(+${npc.reward.gold} ouro)`);
      }
      poi.resolved = true;
      Game.render();
      return;
    }

    case "exit": {
      if (run.currentRoom + 1 >= run.rooms.length) {
        Game.go("victory", { run });
      } else {
        run.currentRoom++;
        Game.go("run", { run, pendingLog: "Você avança para a próxima sala." });
      }
      return;
    }
  }
}

function renderHud(run) {
  const hud = document.createElement("div");
  hud.className = "hud";
  const hpPct = Math.max(0, (run.hp / run.maxHp) * 100);
  hud.innerHTML = `
    <div class="stat"><span>${run.character.name}</span></div>
    <div class="stat"><span>HP</span> <b>${run.hp}/${run.maxHp}</b></div>
    <div class="hp-bar"><div style="width:${hpPct}%"></div></div>
    <div class="stat"><span>Ouro (run)</span> <b>${run.runGold}</b></div>
    <div class="stat"><span>EXP (run)</span> <b>${run.runExp}</b></div>`;
  return hud;
}
