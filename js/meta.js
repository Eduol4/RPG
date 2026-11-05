/* ============================================================
   meta.js — a ponte entre o fim de uma run e a progressão permanente.

   Quando uma run termina (derrota OU vitória), parte do que foi
   ganho é RETIDO no save permanente. Quanto é retido são estes
   números aqui embaixo — é O BOTÃO que vamos calibrar depois.
   A ARQUITETURA já está pronta; só os valores mudam.
   ============================================================ */

import { Save } from "./state.js";

/* >>> AJUSTE AQUI quando formos balancear <<<
   Fração do ganho da run que fica guardada. Valores de EXEMPLO,
   só para você VER o ciclo funcionando. Troque à vontade.
   (0 = não retém nada; 1 = retém tudo.) */
export const RETENTION = {
  defeat: { exp: 0.25, gold: 0.25 },   // ao ser derrotada
  victory:{ exp: 1.00, gold: 1.00 },   // ao vencer a run
};

/* Aplica o resultado de uma run ao save permanente do personagem.
   `outcome` é "defeat" ou "victory". Retorna um resumo para exibir. */
export function applyRunResult(run, outcome) {
  const rate = RETENTION[outcome];
  const charId = run.character.id;
  const meta = Save.forCharacter(charId);

  const gainedExp  = Math.floor(run.runExp  * rate.exp);
  const gainedGold = Math.floor(run.runGold * rate.gold);

  Save.update(charId, {
    runsPlayed:   meta.runsPlayed + 1,
    retainedExp:  meta.retainedExp  + gainedExp,
    retainedGold: meta.retainedGold + gainedGold,
  });

  return {
    gainedExp, gainedGold,
    totalExp:  meta.retainedExp  + gainedExp,
    totalGold: meta.retainedGold + gainedGold,
    runsPlayed: meta.runsPlayed + 1,
  };
}
