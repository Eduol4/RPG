/* ============================================================
   roguelike.js — a camada procedural.

   Monta uma RUN nova a partir dos dados em data/rooms.js.
   Uma run é uma lista de salas; cada sala é uma lista de POIs
   (pontos de interesse). Tudo sorteado com uma SEED, para que a
   mesma seed gere a mesma run (útil pra testar e reproduzir bugs).
   ============================================================ */

import { ROOM_THEMES } from "./data/rooms.js";

/* Gerador de números pseudo-aleatórios com seed (mulberry32).
   Determinístico: mesma seed => mesma sequência. */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;

/* Sorteia uma entrada da pool respeitando os pesos. */
function weightedPick(rng, pool) {
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = rng() * total;
  for (const e of pool) { if ((r -= e.weight) < 0) return e; }
  return pool[pool.length - 1];
}

/* Gera uma sala a partir de um tema. */
function generateRoom(rng, theme, roomIndex) {
  const [minP, maxP] = theme.poiCount;
  const count = randInt(rng, minP, maxP);
  const pois = [];
  for (let i = 0; i < count; i++) {
    const pick = weightedPick(rng, theme.pool);
    pois.push({ type: pick.type, ref: pick.ref, id: `r${roomIndex}_p${i}`, resolved: false });
  }
  // Toda sala termina com uma saída para a próxima.
  pois.push({ type: "exit", ref: null, id: `r${roomIndex}_exit`, resolved: false });
  return { index: roomIndex, themeId: Object.keys(ROOM_THEMES).find(k => ROOM_THEMES[k] === theme), bg: theme.bg, pois };
}

/* Gera uma run inteira.
   - character: objeto de data/characters.js
   - meta:      save permanente (influencia dificuldade/variações no futuro)
   - length:    número de salas
   - seed:      opcional; se omitida, aleatória */
export function generateRun(character, meta, { length = 3, seed } = {}) {
  seed = seed ?? (Math.random() * 1e9) | 0;
  const rng = makeRng(seed);

  // Por enquanto há um tema só; quando houver vários, sorteia-se aqui.
  const theme = ROOM_THEMES.floresta;

  const rooms = [];
  for (let i = 0; i < length; i++) rooms.push(generateRoom(rng, theme, i));

  return {
    seed,
    character,
    rooms,
    currentRoom: 0,
    // ---- ESTADO DE RUN (temporário; zera na derrota/vitória) ----
    maxHp: character.stats.maxHp,
    hp: character.stats.maxHp,
    atk: character.stats.atk,
    def: character.stats.def,
    runGold: 0,     // dinheiro ganho NESTA run
    runExp: 0,      // exp ganho NESTA run
    inventory: [...character.startingKit],
  };
}
