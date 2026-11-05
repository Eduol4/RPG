/* ============================================================
   state.js — o coração do motor.

   Duas responsabilidades:
   1) A MÁQUINA DE ESTADOS: em que "modo" o jogo está agora
      (menu, run, combate, derrota) e como trocar entre eles.
   2) O SAVE: a separação sagrada entre o que é TEMPORÁRIO (morre
      a cada run) e o que é PERMANENTE (sobrevive à derrota).

   Esta separação run/meta é a fundação de todo roguelite.
   Não misture as duas coisas — é o que torna possível reter
   EXP/dinheiro/memórias entre runs sem bagunça.
   ============================================================ */

/* ---------- SAVE PERMANENTE (meta) ----------
   Indexado por personagem. Cada personagem tem sua própria
   progressão, totalmente independente. Vive no localStorage. */

const SAVE_KEY = "rpgtext_saves_v1";

/* Estrutura de um save de personagem recém-criado.
   É AQUI que entram EXP retido, dinheiro retido, desbloqueios
   permanentes e as flags de memória dos NPCs. */
function freshMetaSave(characterId) {
  return {
    characterId,
    runsPlayed: 0,
    // --- progressão permanente (os números de retenção a calibrar depois) ---
    retainedExp: 0,
    retainedGold: 0,
    permanentUnlocks: [],   // ex.: ["espada_rara", "atalho_floresta"]
    // --- memória do mundo: fatos que os NPCs consultam para reagir ---
    memoryFlags: {},        // ex.: { conheceu_ferreiro: true }
  };
}

export const Save = {
  _all: null,

  _load() {
    if (this._all) return this._all;
    try { this._all = JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
    catch { this._all = {}; }
    return this._all;
  },

  _persist() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this._all));
  },

  /* Pega (ou cria) o save permanente de um personagem. */
  forCharacter(characterId) {
    const all = this._load();
    if (!all[characterId]) { all[characterId] = freshMetaSave(characterId); this._persist(); }
    return all[characterId];
  },

  /* Salva as mudanças feitas no objeto de meta. */
  update(characterId, patch) {
    const all = this._load();
    all[characterId] = { ...all[characterId], ...patch };
    this._persist();
    return all[characterId];
  },

  setFlag(characterId, flag, value = true) {
    const save = this.forCharacter(characterId);
    save.memoryFlags[flag] = value;
    this._persist();
  },

  hasFlag(characterId, flag) {
    return !!this.forCharacter(characterId).memoryFlags[flag];
  },

  /* ---------- RUN EM PROGRESSO (pausável) ----------
     Guarda um "snapshot" da run atual para o botão "Continuar" do menu.
     Fica no save da personagem, então sobrevive a recarregar a página.
     É limpa ao vencer, perder ou abandonar a run. */
  setActiveRun(characterId, snapshot) {
    const save = this.forCharacter(characterId);
    save.activeRun = snapshot;
    this._persist();
  },

  getActiveRun(characterId) {
    return this.forCharacter(characterId).activeRun || null;
  },

  clearActiveRun(characterId) {
    const save = this.forCharacter(characterId);
    save.activeRun = null;
    this._persist();
  },

  /* Apaga TUDO (botão de reset). A derrota NUNCA chama isto —
     derrota é progressão, não permadeath. */
  wipe(characterId) {
    const all = this._load();
    delete all[characterId];
    this._persist();
  },
};


/* ---------- MÁQUINA DE ESTADOS ----------
   O jogo está sempre em exatamente um estado. Cada estado sabe
   se desenhar (render) e lidar com input. Trocar de estado é
   só chamar Game.go("nomeDoEstado", dados). */

export const Game = {
  root: null,          // o <div id="screen"> onde tudo é desenhado
  states: {},          // registro de estados: { nome: objetoEstado }
  current: null,       // estado ativo
  ctx: {},             // "contexto" compartilhado: personagem atual, run atual, etc.

  init(rootEl) {
    this.root = rootEl;
    return this;
  },

  /* Registra um estado. Um estado é um objeto com um método render(root, ctx). */
  register(name, stateObj) {
    this.states[name] = stateObj;
    return this;
  },

  /* Troca de estado e redesenha. `data` é mesclado no contexto. */
  go(name, data = {}) {
    const state = this.states[name];
    if (!state) { console.error("Estado desconhecido:", name); return; }
    this.ctx = { ...this.ctx, ...data };
    this.current = state;
    this.render();
  },

  /* Redesenha o estado atual (chame após mudar dados que afetam a tela). */
  render() {
    this.root.innerHTML = "";
    this.current.render(this.root, this.ctx, this);
  },
};
