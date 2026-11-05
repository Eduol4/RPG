/* ============================================================
   meta.js — a ponte entre o fim de uma run e a progressão permanente.

   Regras ATUAIS (provisórias; fáceis de mudar depois):
   - DERROTA: retém 25% do EXP ganho na run. Todo o OURO retido é
     PERDIDO (zera). O número do EXP é o botão a calibrar.
   - VITÓRIA: por enquanto, REINICIA tanto o EXP quanto o ouro retidos
     (ambos voltam a zero).

   A arquitetura é a mesma de sempre; só a política de retenção muda.
   ============================================================ */

import { Save } from "./state.js";

/* >>> AJUSTE AQUI <<< fração do EXP da run retida ao ser derrotada. */
export const EXP_DEFEAT_RETENTION = 0.25;

/* Aplica o resultado de uma run ao save permanente da personagem.
   `outcome` é "defeat" ou "victory". Retorna um resumo para exibir. */
export function applyRunResult(run, outcome) {
  const charId = run.character.id;
  const meta = Save.forCharacter(charId);

  if (outcome === "defeat") {
    const gainedExp = Math.floor(run.runExp * EXP_DEFEAT_RETENTION);
    const totalExp = meta.retainedExp + gainedExp;
    const goldPerdido = meta.retainedGold;   // tudo que havia é perdido

    Save.update(charId, {
      runsPlayed: meta.runsPlayed + 1,
      retainedExp: totalExp,
      retainedGold: 0,
    });

    return {
      outcome, gainedExp, totalExp,
      goldPerdido, totalGold: 0,
      runsPlayed: meta.runsPlayed + 1,
    };
  }

  // victory: reinicia EXP e ouro retidos (provisório).
  Save.update(charId, {
    runsPlayed: meta.runsPlayed + 1,
    retainedExp: 0,
    retainedGold: 0,
  });

  return {
    outcome, gainedExp: 0, totalExp: 0,
    goldPerdido: 0, totalGold: 0,
    runsPlayed: meta.runsPlayed + 1,
    reset: true,
  };
}
