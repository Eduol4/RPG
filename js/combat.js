/* ============================================================
   combat.js — ESTADO de combate (ainda PLACEHOLDER).

   Já é um estado de verdade na máquina de estados: a navegação
   entra aqui (Game.go("combat", ...)) e, ao resolver, volta para
   a run (Game.go("run", ...)). A lógica interna é mínima: um botão
   que resolve o combate na hora. Quando formos construir o combate
   real (turnos, habilidades, etc.), trocamos só o miolo deste
   arquivo — o resto do jogo não precisa saber.
   ============================================================ */

import { getEnemy } from "./data/enemies.js";
import { image } from "./assets.js";
import { pushLog } from "./navigation.js";

export const CombatState = {
  render(root, ctx, Game) {
    const { run, enemyRef, poiId } = ctx.combat;
    const enemy = getEnemy(enemyRef);

    // --- dificuldade da juri han afeta o inimigo ---
    const diff = run.character.difficulty;
    const enemyHp  = Math.round(enemy.hp  * diff.enemyHpMult);
    const enemyDmg = Math.round(enemy.atk * diff.enemyDmgMult);

    const panel = document.createElement("div");
    panel.className = "panel center";
    panel.innerHTML = `<h2>⚔️ Combate</h2>`;

    // Retrato (esquerda) + inimigo (direita), lado a lado e centralizados,
    // cada um ocupando metade da área central.
    const figures = document.createElement("div");
    figures.className = "combat-figures";

    const figHero = document.createElement("div");
    figHero.className = "combat-fig";
    figHero.appendChild(image(run.character.portrait, { width: "100%", alt: run.character.name }));
    const capHero = document.createElement("div");
    capHero.className = "poi-sub";
    capHero.textContent = run.character.name;
    figHero.appendChild(capHero);

    const figEnemy = document.createElement("div");
    figEnemy.className = "combat-fig";
    figEnemy.appendChild(image(enemy.sprite, { width: "100%", alt: enemy.name }));
    const capEnemy = document.createElement("div");
    capEnemy.className = "poi-sub";
    capEnemy.textContent = enemy.name;
    figEnemy.appendChild(capEnemy);

    figures.appendChild(figHero);
    figures.appendChild(figEnemy);
    panel.appendChild(figures);

    const info = document.createElement("p");
    info.innerHTML = `Você encontrou <b>${enemy.name}</b> (HP ${enemyHp}, ATK ${enemyDmg}).`;
    panel.appendChild(info);

    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "[ PLACEHOLDER — o sistema de combate real entra aqui depois ]";
    panel.appendChild(note);

    // --- resolução instantânea (placeholder) ---
    const row = document.createElement("div");
    row.className = "btn-row";
    row.style.justifyContent = "center";

    const win = document.createElement("button");
    win.className = "primary";
    win.textContent = "Vencer (simular)";
    win.onclick = () => {
      run.runGold += enemy.goldReward;
      run.runExp  += enemy.expReward;
      pushLog(run, `Derrotou ${enemy.name}. +${enemy.goldReward} ouro, +${enemy.expReward} EXP.`);
      markResolved(run, poiId);
      Game.go("run", { run });
    };

    const hurt = document.createElement("button");
    hurt.className = "danger";
    hurt.textContent = "Tomar dano (simular)";
    hurt.onclick = () => {
      const dano = Math.max(1, enemyDmg - run.def);
      run.hp -= dano;
      if (run.hp <= 0) {
        run.hp = 0;
        Game.go("defeat", { run });
        return;
      }
      pushLog(run, `${enemy.name} acertou você. -${dano} HP. (combate continua no sistema real)`);
      markResolved(run, poiId);
      Game.go("run", { run });
    };

    row.appendChild(win);
    row.appendChild(hurt);
    panel.appendChild(row);
    root.appendChild(panel);
  },
};

function markResolved(run, poiId) {
  const room = run.rooms[run.currentRoom];
  const poi = room.pois.find(p => p.id === poiId);
  if (poi) poi.resolved = true;
}
