import { bootstrap } from "./main.js";
import { Pontos, Categorias } from "./dataService.js";
import {
  htmlListaPontos,
  preencherSelectCategorias,
  preencherSelectCidades,
} from "./ui.js";
import { iniciarMapa, adicionarMarcadores, focarPonto } from "./map.js";
import { icone, iconeCategoria } from "./icons.js";
import { debounce, escaparHTML, $ } from "./utils.js";
import { autoInitScrollHints } from "./resultsScrollHint.js";

const { ativarCategorias, hidratarIcones, configurarRipple } =
  await bootstrap();

/* =========================================================
   CATEGORIAS (grid)
   ========================================================= */
const gridCats = $("#grid-categorias");

if (gridCats) {
  gridCats.innerHTML = Categorias.listar()
    .map(
      (c) => `
      <button class="category" data-cat="${c.id}" type="button">
        <span class="ico-tile">${iconeCategoria(c, { tam: 22 })}</span>
        <h3>${escaparHTML(c.nome)}</h3>
        <p>${escaparHTML(c.descricao || "")}</p>
        <span class="category__cta">
          Ver pontos
          ${icone("arrow", { tam: 14 })}
        </span>
      </button>
    `,
    )
    .join("");

  hidratarIcones();
  ativarCategorias();
  configurarRipple();
}

/* =========================================================
   FOOTER — lista de categorias
   ========================================================= */
const footerCats = $("#footer-categorias");
if (footerCats) {
  footerCats.innerHTML = Categorias.listar()
    .map(
      (c) =>
        `<li><a href="mapa.html?cat=${c.id}">${escaparHTML(c.nome)}</a></li>`,
    )
    .join("");
}

/* =========================================================
   FILTROS + MAPA
   ========================================================= */
const selCat = $("#filtro-categoria");
const selCid = $("#filtro-cidade");
const inpBairro = $("#filtro-bairro") || $("#filtro-busca");
const btnLimpar = $("#btn-limpar");
const listaEl = $("#lista-pontos");
const contadorEl = $("#contador-pontos");

if (!selCat) console.warn("[home] #filtro-categoria não encontrado");
if (!selCid) console.warn("[home] #filtro-cidade não encontrado");
if (!listaEl) console.warn("[home] #lista-pontos não encontrado");
if (!contadorEl) console.warn("[home] #contador-pontos não encontrado");

if (selCat) preencherSelectCategorias(selCat);
if (selCid) preencherSelectCidades(selCid, Pontos.cidadesDisponiveis());

const mapaContainer = $("#mapa-home");
if (mapaContainer) {
  iniciarMapa("mapa-home");
}

/* =========================================================
   Helpers
   ========================================================= */
function selecionarCard(id, rolar = false) {
  if (!listaEl) return;
  listaEl
    .querySelectorAll(".point-card.is-selected")
    .forEach((c) => c.classList.remove("is-selected"));
  const card = listaEl.querySelector(`.point-card[data-id="${id}"]`);
  if (!card) return;
  card.classList.add("is-selected");
  if (rolar) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function estadoInicial() {
  if (contadorEl) {
    contadorEl.textContent =
      "Selecione o material e a cidade para ver os pontos";
  }
  if (btnLimpar) btnLimpar.disabled = true;
  if (listaEl) htmlListaPontos([], listaEl);
  adicionarMarcadores([]);
}

function filtrosObrigatoriosOk() {
  if (!selCat || !selCid) return false;
  return Boolean(selCat.value) && Boolean(selCid.value);
}

/* =========================================================
   Atualizar
   ========================================================= */
function atualizar() {
  if (!selCat || !selCid || !listaEl || !contadorEl) return;

  if (!filtrosObrigatoriosOk()) {
    estadoInicial();
    return;
  }

  const filtros = {
    categoriaId: selCat.value || null,
    cidade: selCid.value || null,
    bairro: inpBairro ? inpBairro.value.trim() || null : null,
  };

  const encontrados = Pontos.filtrar(filtros);

  contadorEl.textContent =
    encontrados.length === 0
      ? "Nenhum ponto encontrado com esses filtros"
      : `${encontrados.length} ponto${encontrados.length > 1 ? "s" : ""} encontrado${encontrados.length > 1 ? "s" : ""}`;

  if (btnLimpar) btnLimpar.disabled = false;

  // Passa a categoria selecionada para o card destacar
  htmlListaPontos(encontrados, listaEl, {
    compacto: true,
    categoriaDestaque: Number(selCat.value),
  });

  if (mapaContainer) {
    adicionarMarcadores(encontrados, {
      aoClicar: (p) => selecionarCard(p.id, true),
    });
  }

  configurarRipple();

  // Reavalia o indicador de scroll depois que os cards foram renderizados
  const rc = document.querySelector(".results-container");
  if (rc && typeof rc._scrollHintUpdate === "function") {
    requestAnimationFrame(() => rc._scrollHintUpdate());
  }
}

/* =========================================================
   Listeners
   ========================================================= */
if (selCat) {
  selCat.addEventListener("change", atualizar);
  selCat.addEventListener("input", atualizar);
}
if (selCid) {
  selCid.addEventListener("change", atualizar);
  selCid.addEventListener("input", atualizar);
}
if (inpBairro) {
  inpBairro.addEventListener("input", debounce(atualizar, 250));
}

if (btnLimpar) {
  btnLimpar.addEventListener("click", () => {
    if (selCat) selCat.value = "";
    if (selCid) selCid.value = "";
    if (inpBairro) inpBairro.value = "";
    atualizar();
  });
}

if (listaEl) {
  listaEl.addEventListener("click", (e) => {
    const card = e.target.closest(".point-card");
    if (card && !e.target.closest("a")) {
      selecionarCard(card.dataset.id);
      focarPonto(card.dataset.id);
    }
  });
}

if (gridCats && selCat) {
  gridCats.addEventListener("click", (e) => {
    const btn = e.target.closest(".category");
    if (!btn) return;
    selCat.value = btn.dataset.cat;
    selCat.dispatchEvent(new Event("change"));
    const explorar = document.getElementById("explorar");
    if (explorar) explorar.scrollIntoView({ behavior: "smooth" });
  });
}

/* =========================================================
   Fallback: detecção de mudança programática (autofill)
   ========================================================= */
let ultimoEstado = "";
const monitor = setInterval(() => {
  if (!selCat || !selCid) return;
  const estadoAtual = `${selCat.value}|${selCid.value}`;
  if (estadoAtual !== ultimoEstado) {
    ultimoEstado = estadoAtual;
    atualizar();
  }
}, 500);

setTimeout(() => clearInterval(monitor), 10000);

/* =========================================================
   URL PARAMS
   ========================================================= */
const params = new URLSearchParams(location.search);
if (params.get("cat") && selCat) {
  selCat.value = params.get("cat");
  selCat.dispatchEvent(new Event("change"));
}

/* =========================================================
   Indicador de scroll interno do container de resultados
   ========================================================= */
autoInitScrollHints();

/* =========================================================
   Primeira renderização
   ========================================================= */
setTimeout(atualizar, 0);
