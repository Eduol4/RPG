/* ============================================================
   main.js — ponto de entrada. Registra os estados e inicia o jogo.

   Estados registrados:
   - menu      : seleção de personagem (Modo 2 — jogar COMO a personagem)
   - run       : exploração/navegação (navigation.js)
   - combat    : combate placeholder (combat.js)
   - npc       : interação com NPC em tela própria (npc.js)
   - defeat    : derrota -> aplica retenção -> volta ao menu
   - victory   : vitória -> aplica retenção -> volta ao menu

   Obs.: o Modo 1 (jogar consigo mesmo, com recrutamento e mais
   diálogos) ainda NÃO existe. Quando ele vier, será uma nova casca
   que monta uma run com party de vários — reaproveitando run/combat
   /navigation sem reescrever. É por isso que começamos pelo Modo 2.
   ============================================================ */

import { Game, Save } from "./state.js";
import { CHARACTERS, getCharacter } from "./data/characters.js";
import { generateRun } from "./roguelike.js";
import { RunState } from "./navigation.js";
import { CombatState } from "./combat.js";
import { NpcState } from "./npc.js";
import { applyRunResult } from "./meta.js";
import { image } from "./assets.js";
import { openModal } from "./ui.js";

/* ---------------- MENU: seleção de personagem ---------------- */
const MenuState = {
  render(root) {
    const wrap = document.createElement("div");

    const title = document.createElement("div");
    title.className = "panel center";
    title.innerHTML = `<h1>RPG Text</h1>
      <p class="muted">Escolha uma personagem para jogar</p>`;
    wrap.appendChild(title);

    Object.values(CHARACTERS).forEach(char => {
      const meta = Save.forCharacter(char.id);
      const card = document.createElement("div");
      card.className = "panel";

      const row = document.createElement("div");
      row.className = "poi";
      row.style.alignItems = "flex-start";

      const portrait = image(char.portrait, { width: "120px", height: "120px", alt: char.name });
      portrait.style.flex = "none";
      row.appendChild(portrait);

      const info = document.createElement("div");
      info.style.flex = "1";
      info.innerHTML = `
        <h3 style="margin:0 0 4px">${char.name}
          <span class="muted" style="font-size:13px">— ${char.difficulty.label}</span></h3>
        <p style="margin:0 0 8px" class="muted">${char.intro}</p>
        <p style="margin:0" class="poi-sub">
          HP ${char.stats.maxHp} · ATK ${char.stats.atk} · DEF ${char.stats.def}
          &nbsp;|&nbsp; Runs: ${meta.runsPlayed}
          · EXP retido: ${meta.retainedExp} · Ouro retido: ${meta.retainedGold}
        </p>`;
      row.appendChild(info);
      card.appendChild(row);

      // Ações: à esquerda Jogar / Continuar / Resetar; à direita Perfil.
      const actions = document.createElement("div");
      actions.className = "card-actions";

      const leftBtns = document.createElement("div");
      leftBtns.className = "btn-row";

      const play = document.createElement("button");
      play.className = "primary";
      play.textContent = "▶ Jogar";
      play.onclick = () => startRun(char.id);
      leftBtns.appendChild(play);

      // "Continuar" só aparece quando há uma run em progresso para esta
      // personagem (entre Jogar e Resetar).
      const active = Save.getActiveRun(char.id);
      if (active) {
        const cont = document.createElement("button");
        cont.className = "primary";
        cont.textContent = "⏯ Continuar";
        cont.onclick = () => {
          const run = { ...active, character: getCharacter(active.characterId), transient: [] };
          Game.go("run", { run });
        };
        leftBtns.appendChild(cont);
      }

      const reset = document.createElement("button");
      reset.className = "danger";
      reset.textContent = "Resetar progresso";
      reset.onclick = () => {
        if (confirm(`Apagar TODO o progresso de ${char.name}?`)) {
          Save.wipe(char.id);
          Game.render();
        }
      };
      leftBtns.appendChild(reset);

      const rightBtns = document.createElement("div");
      rightBtns.className = "btn-row";
      const perfil = document.createElement("button");
      perfil.textContent = "Perfil";
      perfil.onclick = () => openProfile(char);
      rightBtns.appendChild(perfil);

      actions.appendChild(leftBtns);
      actions.appendChild(rightBtns);
      card.appendChild(actions);
      wrap.appendChild(card);
    });

    root.appendChild(wrap);
  },
};

function openProfile(char) {
  const body = document.createElement("div");

  const img = image(char.portrait, { width: "160px", alt: char.name });
  img.style.margin = "0 auto 16px";
  body.appendChild(img);

  const desc = document.createElement("p");
  desc.style.lineHeight = "1.6";
  desc.textContent = char.profile || "(sem descrição ainda — preencha o campo 'profile' em data/characters.js)";
  body.appendChild(desc);

  openModal({ title: char.name, bodyNode: body });
}

function startRun(charId) {
  const char = getCharacter(charId);
  const meta = Save.forCharacter(charId);
  Save.clearActiveRun(charId);   // começar uma nova run descarta a pausada
  const run = generateRun(char, meta, { length: 3 });
  Game.go("run", { run });
}

/* ---------------- DERROTA ---------------- */
const DefeatState = {
  render(root, ctx) {
    const run = ctx.run;
    const result = applyRunResult(run, "defeat");
    Save.clearActiveRun(run.character.id);

    const box = document.createElement("div");
    box.className = "defeat";
    box.innerHTML = `<h1>Derrotada</h1>`;

    // Tela de derrota específica da personagem, maior e centralizada.
    const defeatImg = image(run.character.defeatImg, { width: "100%", alt: "derrota" });
    defeatImg.style.maxWidth = "420px";
    defeatImg.style.margin = "16px auto 0";
    box.appendChild(defeatImg);

    const defeatMsg = run.character.defeatMessage
      || `${run.character.name} foi derrotada — mas não morreu. Ela recomeça.`;

    const ouroTexto = result.goldPerdido > 0
      ? `Todo o ouro retido foi perdido (−${result.goldPerdido}).`
      : `Nenhum ouro retido a perder.`;

    const summary = document.createElement("div");
    summary.className = "panel";
    summary.style.marginTop = "20px";
    summary.innerHTML = `
      <p>${defeatMsg}</p>
      <p class="muted">EXP retido desta run: +${result.gainedExp}. ${ouroTexto}</p>
      <p class="poi-sub">Permanente — EXP: ${result.totalExp} · Ouro: ${result.totalGold} · Runs: ${result.runsPlayed}</p>`;
    box.appendChild(summary);

    box.appendChild(endButtons(run));
    root.appendChild(box);
  },
};

/* ---------------- VITÓRIA ---------------- */
const VictoryState = {
  render(root, ctx) {
    const run = ctx.run;
    const result = applyRunResult(run, "victory");
    Save.clearActiveRun(run.character.id);

    const box = document.createElement("div");
    box.className = "defeat";
    box.innerHTML = `<h1 style="color:var(--ok)">Run concluída!</h1>`;

    const summary = document.createElement("div");
    summary.className = "panel";
    summary.innerHTML = `
      <p>${run.character.name} completou a run.</p>
      <p class="muted">Por enquanto, vencer reinicia o EXP e o ouro retidos.</p>
      <p class="poi-sub">Permanente — EXP: ${result.totalExp} · Ouro: ${result.totalGold} · Runs: ${result.runsPlayed}</p>`;
    box.appendChild(summary);

    box.appendChild(endButtons(run));
    root.appendChild(box);
  },
};

/* Botões comuns às telas de fim de run. */
function endButtons(run) {
  const row = document.createElement("div");
  row.className = "btn-row";
  row.style.justifyContent = "center";

  const again = document.createElement("button");
  again.className = "primary";
  again.textContent = "Nova run";
  again.onclick = () => startRun(run.character.id);

  const menu = document.createElement("button");
  menu.textContent = "Voltar ao menu";
  menu.onclick = () => Game.go("menu", {});

  row.appendChild(again);
  row.appendChild(menu);
  return row;
}

/* ---------------- BOOT ---------------- */
Game.init(document.getElementById("screen"))
  .register("menu", MenuState)
  .register("run", RunState)
  .register("combat", CombatState)
  .register("npc", NpcState)
  .register("defeat", DefeatState)
  .register("victory", VictoryState)
  .go("menu");
