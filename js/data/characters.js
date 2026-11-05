/* ============================================================
   data/characters.js — as personagens jogáveis, como DADOS.

   Adicione uma personagem = adicione um objeto aqui. O motor
   lê isto; você nunca precisa mexer na lógica para criar gente nova.

   Campos:
   - id:         identificador único (usado como chave do save). Não repita.
   - name:       nome exibido.
   - portrait:   arquivo em assets/img/ (pode ainda não existir). Usado no menu.
   - combatImg:  imagem usada nas telas de combate e de NPC (substitui o
                 retrato SÓ nessas telas). Se faltar, cai no portrait.
   - defeatImg:  tela de derrota desta personagem, em assets/img/.
   - profile:    descrição longa, mostrada no modal de Perfil (menu).
   - difficulty: rótulo livre + multiplicadores que afetam a run.
   - stats:      status BASE (o nível/EXP retido soma por cima).
   - startingKit: itens com que ela começa cada run (ids de data/items.js).
   - intro:      linha curta mostrada ao escolher a personagem.
   - defeatMessage: frase mostrada na tela de derrota desta personagem.
                 (No futuro dá para ter mensagens por situação; por ora,
                  uma por personagem. Se faltar, usa um texto genérico.)
   ============================================================ */

export const CHARACTERS = {

  juri_han: {
    id: "juri_han",
    name: "Juri Han",
    portrait: "juri_han_retrato.jpeg",
    combatImg: "juri_han_combate.jpeg",
    defeatImg: "juri_han_derrota.jpeg",
    profile: "Escreva aqui a descrição longa da Juri Han: história, personalidade, estilo de luta, motivações. Este texto aparece no modal de Perfil.",
    difficulty: {
      label: "Normal",
      enemyHpMult: 1.0,
      enemyDmgMult: 1.0,
    },
    stats: { maxHp: 15, atk: 5, def: 0 },
    startingKit: [],
    intro: "Forte e ágil, equilibrada em todos os atributos.",
    defeatMessage: "Juri Han foi derrotada — mas não morreu. Ela recomeça.",
  },

  mina_ha: {
    id: "mina_ha",
    name: "Mina Ha",
    portrait: "mina_ha_retrato.jpeg",
    combatImg: "mina_ha_combate.jpeg",
    defeatImg: "mina_ha_derrota.jpeg",
    profile: "Escreva aqui a descrição longa da Mina Ha: história, personalidade, estilo de luta, motivações. Este texto aparece no modal de Perfil.",
    difficulty: {
      label: "Difícil",
      enemyHpMult: 1.0,
      enemyDmgMult: 1.0,
    },
    stats: { maxHp: 10, atk: 3, def: 0 },
    startingKit: ["pocao_pequena"],
    intro: "Frágil, mas tem outras vantagens em comparação.",
    defeatMessage: "Mina Ha foi derrotada — mas não morreu. Ela recomeça.",
  },

};

export function getCharacter(id) {
  return CHARACTERS[id];
}
