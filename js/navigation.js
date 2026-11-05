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

   LOG: as mensagens vivem em run.logLines (no estado da run), e NÃO
   mais em elementos soltos do DOM. Isso é o que conserta o bug do
   diálogo do NPC: antes, pushLog escrevia no DOM e o Game.render()
   seguinte apagava tudo. Agora o log sobrevive ao re-render.
   ============================================================ */

import { getItem } from "./data/items.js";
import { getNpc } from "./data/rooms.js";
import { Save } from "./state.js";
import { renderInventory } from "./inventory.js";
import { image } from "./assets.js";

const ICON = { enemy: "⚔️", item: "🎁", npc: "💬", exit: "🚪" };
const MAX_LOG = 8;   // quantas linhas de log manter visíveis por sala

/* Texto de abertura ao entrar numa sala. Sem "de N" — mostra só o
   número da sala atual, como pedido. */
function roomIntro(run) {
  return `Sala ${run.currentRoom + 1}. Você observa os arredores.`;
}

/* Acrescenta uma linha ao log da run (e corta as mais antigas). */
export function pushLog(run, text) {
  if (!run.logLines) run.logLines = [];
  run.logLines.push(text);
  while (run.logLines.length > MAX_LOG) run.logLines.shift();
}

/* Uma sala está "limpa" quando não há inimigos pendentes.
   Itens e NPCs NÃO bloqueiam mais o avanço — só inimigos. */
function enemiesCleared(room) {
  return !room.pois.some(p => p.type === "enemy" && !p.resolved);
}

/* Troca de sala, reiniciando o log com a abertura da nova sala.
   O estado dos POIs (inimigos derrotados, itens pegos) fica gravado
   em run.rooms, então voltar a uma sala preserva tudo que já foi feito. */
function enterRoom(run, index, Game) {
  run.currentRoom = index;
  run.logLines = [roomIntro(run)];
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
    if (!run.logLines) run.logLines = [roomIntro(run)];

    const cleared = enemiesCleared(room);

    // ---------- HUD ----------
    root.appendChild(renderHud(run));

    // ---------- Barra de log com setas de navegação nas bordas ----------
    root.appendChild(renderLogBar(run, cleared, Game));

    // ---------- Fundo da sala (opcional) ----------
    if (room.bg) {
      const bg = image(room.bg, { height: "140px", alt: "cenário" });
      bg.style.marginBottom = "16px";
      root.appendChild(bg);
    }

    // ---------- Colunas: POIs à esquerda, inventário à direita ----------
    const columns = document.createElement("div");
    columns.className = "run-columns";

    const list = document.createElement("div");
    list.className = "panel btn-col poi-panel";

    room.pois.forEach(poi => {
      if (poi.resolved) return;

      if (poi.type === "exit") {
        // A saída só avança quando os inimigos foram derrotados.
        if (!cleared) {
          list.appendChild(makePoi(poi, "A saída (derrote os inimigos para avançar)", true));
          return;
        }
        const btn = makePoi(poi, "Seguir para a próxima sala", false);
        btn.onclick = () => advance(run, Game);
        list.appendChild(btn);
        return;
      }

      const btn = makePoi(poi, labelFor(poi), false);
      btn.onclick = () => handlePoi(poi, run, Game);
      list.appendChild(btn);
    });

    columns.appendChild(list);

    const inv = document.createElement("div");
    inv.className = "panel inv-panel";
    renderInventory(inv, run, {
      onLog: (msg) => pushLog(run, msg),
      onChange: () => Game.render(),
    });
    columns.appendChild(inv);

    root.appendChild(columns);

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

function renderLogBar(run, cleared, Game) {
  const bar = document.createElement("div");
  bar.className = "log";

  // Seta esquerda: retroceder para a sala anterior (já explorada).
  const left = document.createElement("button");
  left.className = "nav-arrow";
  left.textContent = "←";
  left.title = "Voltar à sala anterior";
  left.disabled = run.currentRoom <= 0;
  left.onclick = () => goBack(run, Game);

  // Texto do log (todas as linhas acumuladas na sala atual).
  const text = document.createElement("div");
  text.className = "log-text";
  run.logLines.forEach(linha => {
    const p = document.createElement("p");
    p.className = "line";
    p.textContent = linha;
    text.appendChild(p);
  });

  // Seta direita: avançar (alternativa ao botão de saída). Só quando
  // os inimigos da sala atual foram derrotados.
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

    case "npc": {
      const npc = getNpc(poi.ref);
      const charId = run.character.id;
      // MEMÓRIA: primeira vez vs. reencontro, lido do save permanente.
      const jaConheceu = Save.hasFlag(charId, npc.memoryFlag);
      pushLog(run, jaConheceu ? npc.reunion : npc.firstMeet);
      if (!jaConheceu) Save.setFlag(charId, npc.memoryFlag, true);
      if (npc.reward?.gold) {
        run.runGold += npc.reward.gold;
        pushLog(run, `(+${npc.reward.gold} ouro)`);
      }
      poi.resolved = true;
      Game.render();
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
