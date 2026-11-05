# RPG Text — esqueleto

Esqueleto jogável de um RPG de texto roguelite, feito em HTML/CSS/JavaScript
puro (ES modules, sem dependências, sem build). Pensado para ser **editado por
você sem precisar mexer na lógica**: diálogos, personagens, inimigos, itens e
salas são *dados*; imagens, sons e vídeos são *arquivos* que você solta nas
pastas de `assets/`.

## Como rodar

ES modules **não funcionam** abrindo o `index.html` direto (protocolo `file://`).
Sirva a pasta por HTTP:

- **VS Code:** instale a extensão *Live Server* → botão direito no `index.html`
  → "Open with Live Server".
- **Terminal (Python):** dentro da pasta, rode `python -m http.server` e abra
  `http://localhost:8000`.
- **Terminal (Node):** `npx serve` (ou qualquer servidor estático).

## O que já funciona

- Menu de seleção de personagem (Modo 2 — jogar **como** a personagem).
- Save **por personagem**, com progressão independente, no `localStorage`.
- Uma **run** procedural: salas com pontos de interesse (inimigo / item / NPC / saída).
- Navegação **abstrata**: você clica no que quer abordar (sem avatar/grade).
- **Combate** em placeholder (resolve na hora) — já é um estado de verdade.
- **Itens** usáveis na run.
- **NPC com memória**: fala diferente no reencontro entre runs.
- **Derrota e vitória** aplicam **retenção** de EXP/ouro ao save permanente.

> O **Modo 1** (jogar consigo mesmo, com recrutamento de party e mais diálogos)
> e o **sistema de diálogo rico** ainda não existem — virão por cima desta base.

## Onde mexer em cada coisa

| Quero mudar...                     | Edite...                        |
|------------------------------------|---------------------------------|
| Personagens (stats, dificuldade)   | `js/data/characters.js`         |
| Inimigos                           | `js/data/enemies.js`            |
| Itens e seus efeitos               | `js/data/items.js`              |
| Conteúdo/geração das salas, NPCs   | `js/data/rooms.js`              |
| Quanto se retém na derrota/vitória | `js/meta.js` (const `RETENTION`)|
| Aparência (cores, fontes)          | `css/style.css`                 |

## Assets

Solte os arquivos em:

- `assets/img/` — imagens (`.png`, `.jpg`, `.gif`)
- `assets/audio/` — sons (`.wav`, `.mp3`, `.ogg`)
- `assets/video/` — vídeos/animações (`.mp4`, `.webm`)

Os nomes esperados estão nos arquivos de dados (ex.: `personagem_a_retrato.png`).
**Se um arquivo ainda não existe, aparece um retângulo com o nome dele** no lugar
— nada quebra. Troque os placeholders pelos arquivos reais quando quiser.

## Arquitetura (resumo)

- `js/state.js` — máquina de estados + sistema de save (separação run/meta).
- `js/roguelike.js` — geração procedural da run (com seed determinística).
- `js/navigation.js` — estado de exploração (sala abstrata).
- `js/combat.js` — estado de combate (placeholder).
- `js/inventory.js` — uso de itens.
- `js/meta.js` — aplica o resultado da run à progressão permanente.
- `js/assets.js` — carrega mídia com fallback de placeholder.
- `js/main.js` — registra os estados e inicia o jogo.

**Princípio central:** o *motor* (código) nunca contém conteúdo; ele lê os
*dados*. É isso que deixa você escrever/trocar conteúdo à vontade sem tocar na
lógica.
