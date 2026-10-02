/* ============================================================
   resultsScrollHint.js
   ------------------------------------------------------------
   Adiciona indicação visual (fade + hint "Role/Deslize para
   ver mais") para uma área rolável.

   Regras de arquitetura (importantes):
   - O container rolável (.results-container) é o ÚNICO com
     overflow-y: auto.
   - O fade e o hint NÃO podem viver dentro dele (rolariam junto).
   - Por isso eles ficam num wrapper (.results-wrap), irmão do
     container, que serve de âncora visual e recebe as classes de
     estado (.has-more / .at-bottom / .is-scrolling).

   Uso típico (auto-init):
     import { autoInitScrollHints } from "./resultsScrollHint.js";
     autoInitScrollHints();

   Estrutura esperada no HTML:
     <div class="results-wrap">
       <div class="results-container">
         <div class="results"> ...cards... </div>
       </div>
       <div class="results-fade" aria-hidden="true"></div>
       <div class="results-hint" aria-hidden="true"> ... </div>
     </div>
   ============================================================ */

const TOLERANCIA = 4; // px — considera "no fim" com folga
const DELAY_SCROLLING = 450; // ms para tirar .is-scrolling depois do scroll

/**
 * Inicializa o hint para um wrapper.
 * @param {HTMLElement} wrap   - .results-wrap
 * @param {object}      opts
 * @param {string}      opts.containerSelector  - default ".results-container"
 * @param {number}      opts.tolerance          - px de folga (default 4)
 * @param {number}      opts.idleDelay          - ms (default 450)
 */
export function initScrollHint(wrap, opts = {}) {
  if (!wrap || wrap.dataset.scrollHintOk === "1") return;
  wrap.dataset.scrollHintOk = "1";

  const {
    containerSelector = ".results-container",
    tolerance = TOLERANCIA,
    idleDelay = DELAY_SCROLLING,
  } = opts;

  const container = wrap.querySelector(containerSelector);
  if (!container) {
    // Sem container, nada a fazer — mas ainda reavalia em resize
    wrap.classList.remove("has-more", "at-bottom", "is-scrolling");
    return;
  }

  let idleTimer = null;

  const atualizar = () => {
    const { scrollTop, scrollHeight, clientHeight } = container;

    const overflow = scrollHeight - clientHeight;
    const temOverflow = overflow > tolerance;
    const restante = scrollHeight - clientHeight - scrollTop;
    const temConteudoAbaixo = restante > tolerance;
    const noFim = !temConteudoAbaixo;
    const noTopo = scrollTop <= tolerance;

    wrap.classList.toggle("has-more", temOverflow && temConteudoAbaixo);
    wrap.classList.toggle("at-bottom", noFim && temOverflow);
    wrap.classList.toggle("at-top", noTopo);
  };

  const aoRolar = () => {
    wrap.classList.add("is-scrolling");
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      wrap.classList.remove("is-scrolling");
      atualizar();
    }, idleDelay);
    atualizar();
  };

  // Estado inicial
  atualizar();

  // Listeners no container (é ele quem rola de fato)
  container.addEventListener("scroll", aoRolar, { passive: true });
  container.addEventListener("scrollend", atualizar);

  // Reavalia quando os cards mudarem (filtros, nova renderização etc.)
  const mo = new MutationObserver(() => {
    requestAnimationFrame(atualizar);
  });
  mo.observe(container, { childList: true, subtree: true });

  // Reavalia em resize (muda clientHeight)
  window.addEventListener("resize", atualizar, { passive: true });

  // ResizeObserver pega mudanças de altura do próprio wrap/container
  // (ex.: troca de breakpoint, painel empilhando no mobile)
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => atualizar());
    ro.observe(container);
    ro.observe(wrap);
  }

  // Expõe para o app chamar depois de renderizações
  wrap._scrollHintUpdate = atualizar;
}

/**
 * Varre a página e inicializa todos os `.results-wrap`.
 */
export function autoInitScrollHints(root = document) {
  root.querySelectorAll(".results-wrap").forEach((wrap) => {
    initScrollHint(wrap);
  });
}
