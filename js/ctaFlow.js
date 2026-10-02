/* ============================================================
   ctaFlow.js
   ------------------------------------------------------------
   Sincroniza a aparição da SETA (e da linha verde que percorre
   o conector) com o momento em que a BOLINHA anterior termina
   de "acender".

   Ciclo de cada bolinha: 9s (3s por etapa × 3 etapas).
   Bolinha 1 acende em 0s.
   Bolinha 2 acende em 3s.
   Bolinha 3 acende em 6s.

   A seta/conector 1 (entre bolinha 1 e 2) deve aparecer quando
   a bolinha 1 estiver "acesa" — ou seja, próximo de 1-2s.
   A seta/conector 2 (entre bolinha 2 e 3) deve aparecer quando
   a bolinha 2 estiver "acesa" — próximo de 4-5s.

   Em vez de usar `animation`, usamos `setInterval` para reagir
   a cada "batida" e adicionar/remover a classe `.is-fired`.
   ============================================================ */

const CICLO = 9000; // duração total do ciclo de todas as 3 bolinhas
const BATIDA_1 = 1800; // bolinha 1 acesa -> dispara conector 1
const BATIDA_2 = 4800; // bolinha 2 acesa -> dispara conector 2

export function iniciarCtaFlow() {
  const cta = document.querySelector(".cta-final");
  if (!cta) return;

  const conector1 = cta.querySelector(".cta-flow__connector--1");
  const conector2 = cta.querySelector(".cta-flow__connector--2");
  if (!conector1 || !conector2) return;

  const preferReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Se o usuário preferir menos movimento, deixa tudo visível
  if (preferReduzido) {
    conector1.classList.add("is-fired");
    conector2.classList.add("is-fired");
    return;
  }

  let startTime = null;

  const tick = () => {
    if (!startTime) startTime = performance.now();
    const elapsed = (performance.now() - startTime) % CICLO;

    // Conector 1 dispara quando bolinha 1 já acendeu (>= BATIDA_1)
    // e volta a apagar quando o ciclo entra na fase da bolinha 2.
    const c1Active = elapsed >= BATIDA_1 && elapsed < BATIDA_1 + 2000;
    // Conector 2 dispara quando bolinha 2 já acendeu (>= BATIDA_2)
    const c2Active = elapsed >= BATIDA_2 && elapsed < BATIDA_2 + 2000;

    conector1.classList.toggle("is-fired", c1Active);
    conector2.classList.toggle("is-fired", c2Active);
  };

  // Roda o tick em RAF enquanto a seção estiver visível
  let rafId = null;
  const loop = () => {
    tick();
    rafId = requestAnimationFrame(loop);
  };

  // Inicia quando o CTA entrar em cena (mesmo momento do `is-visible`)
  const obs = new MutationObserver(() => {
    if (cta.classList.contains("is-visible") && rafId === null) {
      startTime = performance.now();
      loop();
    }
    if (!cta.classList.contains("is-visible") && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });
  obs.observe(cta, { attributes: true, attributeFilter: ["class"] });

  // Caso o CTA já esteja visível no carregamento
  if (cta.classList.contains("is-visible")) {
    startTime = performance.now();
    loop();
  }
}
