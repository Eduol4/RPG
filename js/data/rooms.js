/* ============================================================
   data/rooms.js — os "ingredientes" das salas, como DADOS.

   A geração procedural (roguelike.js) monta cada sala sorteando
   a partir destas listas. Você controla a "cara" das runs editando
   aqui: que tipos de ponto de interesse podem aparecer, com que
   peso, quantos por sala, etc. Sem tocar na lógica de geração.

   Tipos de POI (ponto de interesse):
   - "enemy": abre combate.      ref = id de data/enemies.js
   - "item":  dá um item.        ref = id de data/items.js
   - "npc":   diálogo simples.    ref = id em NPCS (abaixo)
   - "exit":  avança de sala.     (inserido automaticamente)
   ============================================================ */

/* Pools de conteúdo por "tema" de sala. Comece com um tema só;
   adicione mais e a geração passa a variá-los. */
export const ROOM_THEMES = {
  floresta: {
    name: "Floresta",
    bg: "sala_floresta.png",          // fundo opcional em assets/img/
    // quantos POIs (fora a saída) por sala, faixa [min, max]
    poiCount: [2, 4],
    // tabela de sorteio: cada entrada tem um peso relativo
    pool: [
      { type: "enemy", ref: "slime",   weight: 4 },
      { type: "enemy", ref: "morcego", weight: 3 },
      { type: "item",  ref: "pocao_pequena", weight: 2 },
      { type: "npc",   ref: "andarilho", weight: 1 },
    ],
  },
};

/* NPCs benéficos. O diálogo aqui é mínimo de propósito — o sistema
   de diálogo rico vem depois. Repare no gancho de MEMÓRIA: o NPC
   tem uma fala de primeira vez e uma de reencontro. O motor escolhe
   com base na flag salva. É assim que "o NPC lembra" entre runs. */
export const NPCS = {
  andarilho: {
    id: "andarilho",
    name: "Andarilho",
    sprite: "npc_andarilho.png",
    memoryFlag: "conheceu_andarilho",   // flag gravada no save ao conhecer
    firstMeet: "Um andarilho encapuzado acena. \"Primeira vez por aqui? Cuidado com os slimes.\"",
    reunion:   "O andarilho sorri ao te reconhecer. \"De volta? Eu sabia que você não desistiria.\"",
    reward: { gold: 3 },   // pequeno benefício ao interagir
  },
};

export function getNpc(id) { return NPCS[id]; }
