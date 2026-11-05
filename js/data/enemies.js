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
    hp: 12, atk: 3, def: 0,
    goldReward: 3, expReward: 5,
  },
  bandido_pequeno: {
    id: "bandido_pequeno",
    name: "Bandido pequeno",
    sprite: "inimigo_bandido_pequeno.png",
    hp: 18, atk: 6, def: 0,
    goldReward: 7, expReward: 8,
  },
};

export function getEnemy(id) {
  return ENEMIES[id];
}
