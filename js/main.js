import { CONFIG } from "./config.js";
import { garantirSeed } from "./seed.js";
import { Auth } from "./auth.js";
import { $, $$ } from "./utils.js";
import { icone } from "./icons.js";

const reduzMovimento = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ---------- ÍCONES ---------- */
function hidratarIcones() {
  $$("[data-icone]").forEach((el) => {
    try {
      el.innerHTML = icone(el.dataset.icone, {
        tam: Number(el.dataset.tam) || 18,
      });
    } catch (err) {
      console.warn("[icons] falha ao renderizar", el.dataset.icone, err);
    }
  });
}

/* ---------- BRAND MARK ---------- */
function hidratarBrand() {
  $$(".brand__mark").forEach((el) => (el.innerHTML = ""));
}

/* ---------- HEADER SCROLL ---------- */
function configurarHeaderScroll() {
  const header = $("#site-header");
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- MENU MOBILE ---------- */
function configurarMenu() {
  const botao = $("[data-menu-toggle]");
  const nav = $("[data-nav]");
  if (!botao || !nav) return;

  const definir = (aberto) => {
    nav.classList.toggle("is-open", aberto);
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    botao.innerHTML = icone(aberto ? "x" : "menu", { tam: 22 });
  };
  definir(false);

  botao.addEventListener("click", () =>
    definir(!nav.classList.contains("is-open")),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      definir(false);
      botao.focus();
    }
  });
}

/* =========================================================
   HELPERS DE OBSERVAÇÃO
   ========================================================= */

function revelarEl(el, classe, aoRevelar) {
  if (el.dataset.revealed === "1") return false;
  el.dataset.revealed = "1";
  el.classList.add(classe);
  if (aoRevelar) {
    try {
      aoRevelar(el);
    } catch (err) {
      console.warn("[reveal] callback falhou", err);
    }
  }
  return true;
}

function observarReveal(elementos, opts = {}) {
  const lista = Array.from(elementos || []).filter(
    (el) => el && el.dataset.revealed !== "1",
  );
  if (!lista.length) return;

  const classe = opts.classe || "is-visible";
  const threshold = opts.threshold ?? 0.15;
  const rootMargin = opts.rootMargin || "0px 0px -60px 0px";
  const timeout = opts.timeout ?? 3000;
  const staggerDelay = opts.staggerDelay ?? 150;
  const aoRevelar =
    typeof opts.aoRevelar === "function" ? opts.aoRevelar : null;

  if (reduzMovimento || !("IntersectionObserver" in window)) {
    lista.forEach((el) => revelarEl(el, classe, aoRevelar));
    return;
  }

  const vh = window.innerHeight;
  const restantes = [];
  let visiveisCount = 0;

  lista.forEach((el) => {
    const r = el.getBoundingClientRect();
    const visivelNaTela = r.top < vh * 0.9 && r.bottom > 0;
    if (visivelNaTela) {
      setTimeout(
        () => revelarEl(el, classe, aoRevelar),
        visiveisCount * staggerDelay,
      );
      visiveisCount++;
    } else {
      restantes.push(el);
    }
  });

  if (!restantes.length) return;

  const pendentes = new Set(restantes);

  const obs = new IntersectionObserver(
    (entradas) => {
      const ordenadas = entradas
        .filter((e) => e.isIntersecting)
        .sort(
          (a, b) =>
            a.target.getBoundingClientRect().top -
            b.target.getBoundingClientRect().top,
        );

      ordenadas.forEach((e, i) => {
        if (!pendentes.has(e.target)) return;
        const delay = i * staggerDelay;
        setTimeout(() => {
          revelarEl(e.target, classe, aoRevelar);
          pendentes.delete(e.target);
        }, delay);
        obs.unobserve(e.target);
      });
    },
    { threshold, rootMargin },
  );
  restantes.forEach((el) => obs.observe(el));

  const checarManual = () => {
    if (!pendentes.size) return;
    const vh2 = window.innerHeight;
    let idx = 0;
    pendentes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh2 * 0.9 && r.bottom > 0) {
        const delay = idx * staggerDelay;
        setTimeout(() => {
          revelarEl(el, classe, aoRevelar);
          pendentes.delete(el);
        }, delay);
        idx++;
        obs.unobserve(el);
      }
    });
  };
  const intervalo = setInterval(checarManual, 400);
  checarManual();

  setTimeout(() => {
    clearInterval(intervalo);
    pendentes.forEach((el) => revelarEl(el, classe, aoRevelar));
    pendentes.clear();
  }, timeout);

  window.addEventListener("scroll", checarManual, { passive: true });
}

/* =========================================================
   SCROLL REVEAL GENÉRICO — [data-reveal]
   ========================================================= */
function ativarReveal() {
  const alvos = $$("[data-reveal]").filter(
    (el) =>
      !el.classList.contains("metric") &&
      !el.classList.contains("step") &&
      !el.classList.contains("category") &&
      !el.classList.contains("cta-final"),
  );
  observarReveal(alvos, {
    classe: "is-visible",
    threshold: 0.15,
    rootMargin: "0px 0px -60px 0px",
    timeout: 3000,
    staggerDelay: 120,
  });
}

/* =========================================================
   TIMELINE
   ========================================================= */
function ativarTimeline() {
  const timeline = $("[data-timeline]");
  if (!timeline) return;

  const progresso = timeline.querySelector("[data-timeline-progress]");
  const itens = $$("[data-timeline-item]", timeline);
  if (!progresso || !itens.length) return;

  if (reduzMovimento) {
    progresso.style.height = "100%";
    itens.forEach((i) => i.classList.add("is-active"));
    return;
  }

  const atualizar = () => {
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const inicio = vh * 0.75;
    const visivel = Math.max(0, Math.min(total, inicio - rect.top));
    const pct = Math.min(100, (visivel / total) * 100);
    progresso.style.height = pct + "%";

    itens.forEach((item) => {
      const r = item.getBoundingClientRect();
      if (r.top < vh * 0.7) item.classList.add("is-active");
      else item.classList.remove("is-active");
    });
  };

  atualizar();
  window.addEventListener("scroll", atualizar, { passive: true });
  window.addEventListener("resize", atualizar);
}

/* =========================================================
   CONTAGEM
   ========================================================= */
function animarContagem(el, { aoTerminar } = {}) {
  if (el.dataset.counting === "1") return;
  if (el.dataset.counted === "1") {
    if (aoTerminar) aoTerminar();
    return;
  }

  const fim = parseFloat(el.dataset.count);
  if (!Number.isFinite(fim)) return;
  const prefix = el.dataset.prefix || "";

  if (reduzMovimento) {
    el.textContent = prefix + fim;
    el.dataset.counted = "1";
    if (aoTerminar) aoTerminar();
    return;
  }

  el.dataset.counting = "1";
  const dur = 1800;
  const ini = performance.now();
  const passo = (t) => {
    const p = Math.min((t - ini) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(fim * eased);
    if (p < 1) requestAnimationFrame(passo);
    else {
      el.textContent = prefix + fim;
      el.dataset.counting = "0";
      el.dataset.counted = "1";
      if (aoTerminar) aoTerminar();
    }
  };
  el.textContent = prefix + "0";
  requestAnimationFrame(passo);
}

function ativarContagem() {
  const nums = $$("[data-count]");
  if (!nums.length) return;

  const foraDeMetric = nums.filter((n) => !n.closest(".metric"));
  if (!foraDeMetric.length) return;

  if (reduzMovimento || !("IntersectionObserver" in window)) {
    foraDeMetric.forEach((n) => animarContagem(n));
    return;
  }

  const obs = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        animarContagem(e.target);
        obs.unobserve(e.target);
      }),
    { threshold: 0.3 },
  );
  foraDeMetric.forEach((n) => obs.observe(n));

  setTimeout(() => {
    foraDeMetric.forEach((n) => {
      if (n.dataset.counted !== "1") {
        animarContagem(n);
        obs.unobserve(n);
      }
    });
  }, 2500);
}

/* =========================================================
   MÉTRICAS — reveal lento + stagger grande
   ========================================================= */
function ativarMetricas() {
  const cards = $$(".metric");
  if (!cards.length) return;

  observarReveal(cards, {
    classe: "is-visible",
    threshold: 0.25,
    rootMargin: "0px 0px -80px 0px",
    timeout: 3500,
    staggerDelay: 200,
    aoRevelar: (card) => {
      const valor = card.querySelector("[data-count]");
      if (valor) {
        animarContagem(valor, {
          aoTerminar: () => valor.classList.add("is-counted"),
        });
      }
    },
  });
}

/* =========================================================
   STEPS
   ========================================================= */
function ativarSteps() {
  const lista = $(".steps");
  if (!lista) return;

  observarReveal([lista], {
    classe: "is-visible",
    threshold: 0.3,
    rootMargin: "0px 0px -100px 0px",
    timeout: 3500,
  });

  observarReveal($$(".step"), {
    classe: "is-visible",
    threshold: 0.2,
    rootMargin: "0px 0px -70px 0px",
    timeout: 3500,
    staggerDelay: 200,
  });
}

/* =========================================================
   CATEGORIAS
   ========================================================= */
function ativarCategorias() {
  observarReveal($$(".category"), {
    classe: "is-visible",
    threshold: 0.18,
    rootMargin: "0px 0px -70px 0px",
    timeout: 3500,
    staggerDelay: 180,
  });
}

/* =========================================================
   CTA FINAL
   ========================================================= */
function ativarCTA() {
  const els = $$(".cta-final");
  if (!els.length) return;

  // Só ativa a animação se o JS rodar de fato.
  // Sem isso, o bloco aparece imediatamente (fallback gracioso).
  els.forEach((el) => el.setAttribute("data-anim", ""));

  observarReveal(els, {
    classe: "is-visible",
    threshold: 0.15,
    rootMargin: "0px 0px -60px 0px",
    timeout: 3500,
  });
}

/* =========================================================
   RIPPLE
   ========================================================= */
function configurarRipple() {
  const botoes = [...$$(".btn"), ...$$(".btn-link"), ...$$(".point-card")];

  botoes.forEach((btn) => {
    if (btn.dataset.rippleOk === "1") return;
    btn.dataset.rippleOk = "1";

    btn.addEventListener("pointerdown", (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const x =
        (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
      const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "btn__ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      if (getComputedStyle(btn).position === "static") {
        btn.style.position = "relative";
      }
      btn.style.overflow = "hidden";

      btn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 650);
    });
  });
}

/* ---------- BOOTSTRAP ---------- */
export async function bootstrap() {
  try {
    garantirSeed();
  } catch (e) {
    console.warn("seed", e);
  }
  try {
    await Auth.garantirAdminPadrao();
  } catch (e) {
    console.warn("auth", e);
  }

  try {
    $$("[data-nome-plataforma]").forEach(
      (el) => (el.textContent = CONFIG.nomePlataforma),
    );
  } catch (e) {
    console.warn("nome plataforma", e);
  }

  try {
    hidratarBrand();
  } catch (e) {
    console.warn("brand", e);
  }
  try {
    hidratarIcones();
  } catch (e) {
    console.warn("icons", e);
  }
  try {
    configurarHeaderScroll();
  } catch (e) {
    console.warn("header", e);
  }
  try {
    configurarMenu();
  } catch (e) {
    console.warn("menu", e);
  }
  try {
    ativarReveal();
  } catch (e) {
    console.warn("reveal", e);
  }
  try {
    ativarTimeline();
  } catch (e) {
    console.warn("timeline", e);
  }
  try {
    ativarContagem();
  } catch (e) {
    console.warn("count", e);
  }
  try {
    ativarMetricas();
  } catch (e) {
    console.warn("metricas", e);
  }
  try {
    ativarSteps();
  } catch (e) {
    console.warn("steps", e);
  }
  try {
    ativarCategorias();
  } catch (e) {
    console.warn("categorias", e);
  }
  try {
    ativarCTA();
  } catch (e) {
    console.warn("cta", e);
  }
  try {
    configurarRipple();
  } catch (e) {
    console.warn("ripple", e);
  }

  try {
    $$("[data-ano]").forEach(
      (el) => (el.textContent = new Date().getFullYear()),
    );
  } catch (e) {
    console.warn("ano", e);
  }

  return {
    ativarReveal,
    ativarTimeline,
    animarContagem,
    ativarContagem,
    ativarMetricas,
    ativarSteps,
    ativarCategorias,
    ativarCTA,
    hidratarIcones,
    configurarRipple,
  };
}
