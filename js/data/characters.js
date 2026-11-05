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

  personagem_a: {
    id: "personagem_a",
    name: "Personagem A",
    portrait: "personagem_a_retrato.png",
    defeatImg: "personagem_a_derrota.png",
    difficulty: {
      label: "Equilibrada",
      enemyHpMult: 1.0,
      enemyDmgMult: 1.0,
    },
    stats: { maxHp: 30, atk: 6, def: 3 },
    startingKit: ["pocao_pequena"],
    intro: "Uma combatente versátil. Bom ponto de partida.",
  },

  personagem_b: {
    id: "personagem_b",
    name: "Personagem B",
    portrait: "personagem_b_retrato.png",
    defeatImg: "personagem_b_derrota.png",
    difficulty: {
      label: "Difícil",
      enemyHpMult: 1.3,
      enemyDmgMult: 1.2,
    },
    stats: { maxHp: 22, atk: 9, def: 2 },
    startingKit: ["pocao_pequena", "pocao_pequena"],
    intro: "Frágil, mas golpeia forte. Para quem quer desafio.",
  },

};

export function getCharacter(id) {
  return CHARACTERS[id];
}
