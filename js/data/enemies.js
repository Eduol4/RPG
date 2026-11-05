/* ============================================================
   data/enemies.js — inimigos, como DADOS.
   O combate (combat.js) ainda é um placeholder; estes valores
   já existem para quando ele for construído de verdade.
   ============================================================ */

export const ENEMIES = {
  slime: {
    id: "slime",
    name: "Slime",
    sprite: "inimigo_slime.png",
    hp: 12, atk: 4, def: 1,
    goldReward: 5, expReward: 8,
  },
  morcego: {
    id: "morcego",
    name: "Morcego",
    sprite: "inimigo_morcego.png",
    hp: 8, atk: 6, def: 0,
    goldReward: 7, expReward: 10,
  },
};

export function getEnemy(id) {
  return ENEMIES[id];
}
