/* ============================================================
   main.js — ponto de entrada. Registra os estados e inicia o jogo.

   Estados registrados:
   - menu      : seleção de personagem (Modo 2 — jogar COMO a personagem)
   - run       : exploração/navegação (navigation.js)
   - combat    : combate placeholder (combat.js)
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
import { applyRunResult } from "./meta.js";
import { image } from "./assets.js";

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

      const actions = document.createElement("div");
      actions.className = "btn-row";
      actions.style.marginTop = "12px";

      const play = document.createElement("button");
      play.className = "primary";
      play.textContent = "▶ Jogar";
      play.onclick = () => startRun(char.id);
      actions.appendChild(play);

      const reset = document.createElement("button");
      reset.className = "danger";
      reset.textContent = "Resetar progresso";
      reset.onclick = () => {
        if (confirm(`Apagar TODO o progresso de ${char.name}?`)) {
          Save.wipe(char.id);
          Game.render();
        }
      };
      actions.appendChild(reset);

      card.appendChild(actions);
      wrap.appendChild(card);
    });

    root.appendChild(wrap);
  },
};

function startRun(charId) {
  const char = getCharacter(charId);
  const meta = Save.forCharacter(charId);
  const run = generateRun(char, meta, { length: 3 });
  Game.go("run", { run, pendingLog: null });
}

/* ---------------- DERROTA ---------------- */
const DefeatState = {
  render(root, ctx) {
    const run = ctx.run;
    const result = applyRunResult(run, "defeat");

    const box = document.createElement("div");
    box.className = "defeat";
    box.innerHTML = `<h1>Derrotada</h1>`;

    // Tela de derrota específica da personagem (placeholder se faltar).
    // Maior e centralizada na tela.
    const defeatImg = image(run.character.defeatImg, { width: "100%", alt: "derrota" });
    defeatImg.style.maxWidth = "420px";
    defeatImg.style.margin = "16px auto 0";
    box.appendChild(defeatImg);

    // Mensagem de derrota individual por personagem (campo defeatMessage em
    // data/characters.js). Se a personagem ainda não tiver uma, usa um texto
    // genérico — assim nada quebra enquanto você escreve as mensagens.
    const defeatMsg = run.character.defeatMessage
      || `${run.character.name} foi derrotada — mas não morreu. Ela recomeça.`;

    const summary = document.createElement("div");
    summary.className = "panel";
    summary.style.marginTop = "20px";
    summary.innerHTML = `
      <p>${defeatMsg}</p>
      <p class="muted">Retido desta run: +${result.gainedExp} EXP, +${result.gainedGold} ouro.</p>
      <p class="poi-sub">Totais permanentes — EXP: ${result.totalExp} · Ouro: ${result.totalGold} · Runs: ${result.runsPlayed}</p>`;
    box.appendChild(summary);

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
    row.appendChild(again); row.appendChild(menu);
    box.appendChild(row);

    root.appendChild(box);
  },
};

/* ---------------- VITÓRIA ---------------- */
const VictoryState = {
  render(root, ctx) {
    const run = ctx.run;
    const result = applyRunResult(run, "victory");

    const box = document.createElement("div");
    box.className = "defeat";
    box.innerHTML = `<h1 style="color:var(--ok)">Run concluída!</h1>`;

    const summary = document.createElement("div");
    summary.className = "panel";
    summary.innerHTML = `
      <p>${run.character.name} completou a run.</p>
      <p class="muted">Ganho retido: +${result.gainedExp} EXP, +${result.gainedGold} ouro.</p>
      <p class="poi-sub">Totais permanentes — EXP: ${result.totalExp} · Ouro: ${result.totalGold} · Runs: ${result.runsPlayed}</p>`;
    box.appendChild(summary);

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
    row.appendChild(again); row.appendChild(menu);
    box.appendChild(row);

    root.appendChild(box);
  },
};

/* ---------------- BOOT ---------------- */
Game.init(document.getElementById("screen"))
  .register("menu", MenuState)
  .register("run", RunState)
  .register("combat", CombatState)
  .register("defeat", DefeatState)
  .register("victory", VictoryState)
  .go("menu");
