/* ============================================================
   navigation.js — ESTADO de run / exploração (modelo ABSTRATO).

   A sala é mostrada como uma lista de pontos de interesse (POIs).
   Você clica no que quer abordar; não há avatar nem grade.

   LOG em três camadas:
   - transient : o que acabou de acontecer. Cada linha aparece na
     barra de log por ~3s e some sozinha.
   - roomLog   : tudo que aconteceu na sala atual (reinicia por sala).
   - runLog    : tudo que aconteceu na run inteira.
   O botão "Log" (acima do inventário) abre um modal com roomLog e runLog.

   Fluxo dos POIs:
   - inimigo -> estado de combate
   - item    -> adiciona ao inventário
   - npc     -> estado de interação com NPC (tela própria)
   - saída   -> próxima sala (ou vitória)
   ============================================================ */

import { getItem } from "./data/items.js";
import { getNpc } from "./data/rooms.js";
import { Save } from "./state.js";
import { renderInventory } from "./inventory.js";
import { image } from "./assets.js";
import { openModal } from "./ui.js";

const ICON = { enemy: "⚔️", item: "🎁", npc: "💬", exit: "🚪" };
const TRANSIENT_MS = 3000;   // quanto tempo cada evento fica visível na barra

function roomIntro(run) {
  return `Sala ${run.currentRoom + 1}. Você observa os arredores.`;
}

/* Garante que os três logs existam no objeto da run. */
function ensureLogs(run) {
  if (!run.runLog) run.runLog = [];
  if (!run.roomLog) run.roomLog = [];
  if (!run.transient) run.transient = [];
}

/* Registra um EVENTO transitório: aparece na barra por ~3s e some.
   Também entra no histórico (roomLog/runLog), visível no modal de Log.
   O diálogo de NPC NÃO passa por aqui — só as recompensas passam. */
export function pushLog(run, text) {
  ensureLogs(run);
  run.runLog.push(text);
  run.roomLog.push(text);
  run.transient.push({ text, expiresAt: Date.now() + TRANSIENT_MS });
}

/* Define a linha PERMANENTE da sala (ex.: "Sala 1. Você observa os
   arredores."). Diferente dos eventos, ela não some da barra. Também
   entra no histórico, mas nunca na lista de transitórios. */
function announceRoom(run) {
  ensureLogs(run);
  const text = roomIntro(run);
  run.roomHeader = text;
  run.roomLog.push(text);
  run.runLog.push(text);
}

function enemiesCleared(room) {
  return !room.pois.some(p => p.type === "enemy" && !p.resolved);
}

/* Troca de sala: reinicia roomLog/transient e anuncia a nova sala.
   O estado dos POIs fica gravado em run.rooms, então voltar preserva
   inimigos derrotados, itens pegos, etc. */
function enterRoom(run, index, Game) {
  run.currentRoom = index;
  run.roomLog = [];
  run.transient = [];
  announceRoom(run);
  Game.go("run", { run });
}

function advance(run, Game) {
  if (run.currentRoom + 1 >= run.rooms.length) { Game.go("victory", { run }); return; }
  enterRoom(run, run.currentRoom + 1, Game);
}

function goBack(run, Game) {
  if (run.currentRoom <= 0) return;
  enterRoom(run, run.currentRoom - 1, Game);
}

export const RunState = {
  render(root, ctx, Game) {
    const run = ctx.run;
    const room = run.rooms[run.currentRoom];

    ensureLogs(run);
    if (!run.roomHeader) announceRoom(run);   // 1ª entrada da run (ou run retomada antiga)

    const cleared = enemiesCleared(room);

    // ---------- HUD ----------
    root.appendChild(renderHud(run));

    // ---------- Barra de log (transiente) com setas nas bordas ----------
    root.appendChild(renderLogBar(run, cleared, Game));

    // ---------- Fundo da sala (opcional) ----------
    if (room.bg) {
      const bg = image(room.bg, { height: "140px", alt: "cenário" });
      bg.style.marginBottom = "16px";
      root.appendChild(bg);
    }

    // ---------- Colunas: POIs à esquerda, (log + inventário) à direita ----------
    const columns = document.createElement("div");
    columns.className = "run-columns";

    const list = document.createElement("div");
    list.className = "panel btn-col poi-panel";

    room.pois.forEach(poi => {
      if (poi.resolved) return;

      if (poi.type === "exit") {
        if (!cleared) {
          list.appendChild(makePoi(poi, "A saída (derrote os inimigos para avançar)", true));
          return;
        }
        // Botão de avançar visualmente distinto dos demais POIs.
        const btn = makePoi(poi, "Seguir para a próxima sala", false, "poi-advance");
        btn.onclick = () => advance(run, Game);
        list.appendChild(btn);
        return;
      }

      const btn = makePoi(poi, labelFor(poi), false);
      btn.onclick = () => handlePoi(poi, run, Game);
      list.appendChild(btn);
    });

    columns.appendChild(list);

    // Coluna direita: botão de Log em cima, retângulo do inventário embaixo.
    const rightCol = document.createElement("div");
    rightCol.className = "right-col";

    const logBtn = document.createElement("button");
    logBtn.className = "log-btn";
    logBtn.textContent = "📜 Log";
    logBtn.onclick = () => openLogModal(run);
    rightCol.appendChild(logBtn);

    const inv = document.createElement("div");
    inv.className = "panel inv-panel";
    renderInventory(inv, run, {
      onLog: (msg) => pushLog(run, msg),
      onChange: () => Game.render(),
    });
    rightCol.appendChild(inv);

    columns.appendChild(rightCol);
    root.appendChild(columns);

    // ---------- Rodapé: abandonar (assume derrota) vs voltar ao menu ----------
    const foot = document.createElement("div");
    foot.className = "btn-row";

    const abandon = document.createElement("button");
    abandon.className = "danger";
    abandon.textContent = "Abandonar run (assumir derrota)";
    abandon.onclick = () => {
      if (confirm("Abandonar a run? Isso conta como derrota.")) {
        Game.go("defeat", { run });
      }
    };

    const toMenu = document.createElement("button");
    toMenu.textContent = "Voltar ao menu (continuar depois)";
    toMenu.onclick = () => {
      // Salva a run em progresso (para o botão "Continuar" no menu),
      // sem os campos transitórios de tempo.
      const { character, transient, ...rest } = run;
      Save.setActiveRun(character.id, { ...rest, characterId: character.id });
      Game.go("menu", {});
    };

    foot.appendChild(abandon);
    foot.appendChild(toMenu);
    root.appendChild(foot);
  },
};

/* ---------- helpers ---------- */

function renderLogBar(run, cleared, Game) {
  const bar = document.createElement("div");
  bar.className = "log";

  const left = document.createElement("button");
  left.className = "nav-arrow";
  left.textContent = "←";
  left.title = "Voltar à sala anterior";
  left.disabled = run.currentRoom <= 0;
  left.onclick = () => goBack(run, Game);

  const text = document.createElement("div");
  text.className = "log-text";

  // Linha PERMANENTE da sala (não some): "Sala N. Você observa os arredores."
  if (run.roomHeader) {
    const head = document.createElement("p");
    head.className = "line";
    head.textContent = run.roomHeader;
    text.appendChild(head);
  }

  // EVENTOS transitórios: mostra só os ainda "frescos" (dentro da janela de
  // 3s) e agenda a remoção visual de cada um quando expira.
  const now = Date.now();
  run.transient = run.transient.filter(e => e.expiresAt > now);
  run.transient.forEach(entry => {
    const p = document.createElement("p");
    p.className = "line log-event";
    p.textContent = entry.text;
    text.appendChild(p);
    const remaining = Math.max(0, entry.expiresAt - now);
    setTimeout(() => { if (p && p.remove) p.remove(); }, remaining);
  });

  const right = document.createElement("button");
  right.className = "nav-arrow";
  right.textContent = "→";
  right.disabled = !cleared;
  right.title = cleared ? "Avançar para a próxima sala" : "Derrote os inimigos para avançar";
  right.onclick = () => advance(run, Game);

  bar.appendChild(left);
  bar.appendChild(text);
  bar.appendChild(right);
  return bar;
}

/* Modal com o log da sala e o log da run. */
function openLogModal(run) {
  ensureLogs(run);
  const body = document.createElement("div");

  const makeSection = (titulo, linhas) => {
    const sec = document.createElement("div");
    sec.className = "log-section";
    const h = document.createElement("h4");
    h.textContent = titulo;
    sec.appendChild(h);
    if (linhas.length === 0) {
      const vazio = document.createElement("p");
      vazio.className = "muted";
      vazio.textContent = "(nada ainda)";
      sec.appendChild(vazio);
    } else {
      linhas.forEach(l => {
        const p = document.createElement("p");
        p.className = "line";
        p.textContent = l;
        sec.appendChild(p);
      });
    }
    return sec;
  };

  body.appendChild(makeSection("Log da sala", run.roomLog));
  body.appendChild(makeSection("Log da run", run.runLog));
  openModal({ title: "Log", bodyNode: body });
}

function labelFor(poi) {
  switch (poi.type) {
    case "enemy": return "Um inimigo à espreita";
    case "item":  return `Um item: ${getItem(poi.ref)?.name ?? poi.ref}`;
    case "npc":   return `Alguém: ${getNpc(poi.ref)?.name ?? poi.ref}`;
    case "exit":  return "Seguir para a próxima sala";
    default:      return poi.type;
  }
}

function makePoi(poi, label, disabled, extraClass = "") {
  const btn = document.createElement("button");
  btn.className = "poi " + poi.type + (extraClass ? " " + extraClass : "");
  btn.disabled = disabled;
  btn.innerHTML = `
    <span class="poi-icon">${ICON[poi.type] ?? "?"}</span>
    <span class="poi-label">${label}</span>`;
  return btn;
}

function handlePoi(poi, run, Game) {
  switch (poi.type) {
    case "enemy":
      Game.go("combat", { combat: { run, enemyRef: poi.ref, poiId: poi.id } });
      return;

    case "item": {
      run.inventory.push(poi.ref);
      poi.resolved = true;
      pushLog(run, `Você pegou: ${getItem(poi.ref)?.name ?? poi.ref}.`);
      Game.render();
      return;
    }

    case "npc":
      // Interação do NPC agora tem tela própria; o diálogo não vai ao log.
      Game.go("npc", { npc: { run, npcRef: poi.ref, poiId: poi.id } });
      return;
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
