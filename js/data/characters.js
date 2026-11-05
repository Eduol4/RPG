/* ============================================================
   data/characters.js — as personagens jogáveis, como DADOS.

   Adicione uma personagem = adicione um objeto aqui. O motor
   lê isto; você nunca precisa mexer na lógica para criar gente nova.

   Campos:
   - id:         identificador único (usado como chave do save). Não repita.
   - name:       nome exibido.
   - portrait:   arquivo em assets/img/ (pode ainda não existir).
   - defeatImg:  tela de derrota desta personagem, em assets/img/.
   - difficulty: rótulo livre + multiplicadores que afetam a run.
   - stats:      status BASE (o nível/EXP retido soma por cima).
   - startingKit: itens com que ela começa cada run (ids de data/items.js).
   - intro:      linha curta mostrada ao escolher a personagem.
   ============================================================ */

export const CHARACTERS = {

  juri_han: {
    id: "juri_han",
    name: "Juri Han",
    portrait: "juri_han_retrato.jpeg",
    defeatImg: "juri_han_derrota.jpeg",
    difficulty: {
      label: "Equilibrada",
      enemyHpMult: 1.0,
      enemyDmgMult: 1.0,
    },
    stats: { maxHp: 15, atk: 5, def: 0 },
    startingKit: [],
    intro: "Forte e ágil, equilibrada em todos os atributos.",
  },

  mina_ha: {
    id: "mina_ha",
    name: "Mina Ha",
    portrait: "mina_ha_retrato.jpg",
    defeatImg: "mina_ha_derrota.jpeg",
    difficulty: {
      label: "Difícil",
      enemyHpMult: 1.0,
      enemyDmgMult: 1.0,
    },
    stats: { maxHp: 10, atk: 3, def: 0 },
    startingKit: ["pocao_pequena"],
    intro: "Frágil, mas tem outras vantagens em comparação.",
  },

};

export function getCharacter(id) {
  return CHARACTERS[id];
}
