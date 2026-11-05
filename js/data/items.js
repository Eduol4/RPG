/* ============================================================
   data/items.js — itens, como DADOS.

   `use(runState)` é a função que o item executa quando usado.
   Recebe o estado da RUN atual (HP, etc.) e o modifica.
   Retorna uma string curta para o log. Mantê-la aqui deixa o
   efeito do item junto da definição dele.
   ============================================================ */

export const ITEMS = {
  pocao_pequena: {
    id: "pocao_pequena",
    name: "Poção Pequena",
    icon: "🧪",
    desc: "Recupera 10 de HP.",
    use(runState) {
      const antes = runState.hp;
      runState.hp = Math.min(runState.maxHp, runState.hp + 10);
      return `Usou Poção Pequena. +${runState.hp - antes} HP.`;
    },
  },
};

export function getItem(id) {
  return ITEMS[id];
}
