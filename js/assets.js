/* ============================================================
   assets.js — ponte entre o código e seus arquivos de mídia.

   REGRA DE OURO: nenhum asset ausente quebra o jogo.
   Se a imagem/vídeo ainda não existe na pasta, aparece um
   retângulo com o nome do arquivo no lugar. Você vai soltando
   os arquivos reais em assets/img, assets/audio, assets/video
   e eles aparecem sozinhos — sem precisar mexer no código.
   ============================================================ */

export const ASSET_BASE = "assets/";

/* Cria um <img>. Se o arquivo não carregar, troca por um placeholder
   visível com o nome, então você sempre sabe qual arquivo falta.
   `width`/`height` são opcionais (ex.: "320px", "100%"). */
export function image(path, { width = "100%", height = "auto", alt = "" } = {}) {
  const wrap = document.createElement("div");

  const img = document.createElement("img");
  img.className = "asset-img";
  img.src = ASSET_BASE + "img/" + path;
  img.alt = alt || path;
  img.style.width = width;
  img.style.height = height;

  img.onerror = () => {
    const ph = placeholder("img/" + path, width, height === "auto" ? "160px" : height);
    wrap.replaceChildren(ph);
  };

  wrap.appendChild(img);
  return wrap;
}

/* Vídeo/gif-em-mp4. Mesmo esquema de fallback. */
export function video(path, { width = "100%", loop = true, autoplay = true, muted = true } = {}) {
  const wrap = document.createElement("div");
  const vid = document.createElement("video");
  vid.className = "asset-img";
  vid.src = ASSET_BASE + "video/" + path;
  vid.style.width = width;
  vid.loop = loop; vid.autoplay = autoplay; vid.muted = muted; vid.playsInline = true;
  vid.onerror = () => wrap.replaceChildren(placeholder("video/" + path, width, "160px"));
  wrap.appendChild(vid);
  return wrap;
}

/* Toca um efeito sonoro. Falha em silêncio se o arquivo não existir —
   som ausente nunca deve travar nada. */
export function sfx(path, volume = 0.8) {
  try {
    const audio = new Audio(ASSET_BASE + "audio/" + path);
    audio.volume = volume;
    audio.play().catch(() => {});  // navegador pode bloquear autoplay; tudo bem
  } catch (_) { /* ignora */ }
}

/* O retângulo de placeholder. */
function placeholder(label, width, height) {
  const div = document.createElement("div");
  div.className = "asset-placeholder";
  div.style.width = width;
  div.style.height = height;
  div.style.minHeight = "80px";
  div.textContent = "[asset ausente: " + label + "]";
  return div;
}
