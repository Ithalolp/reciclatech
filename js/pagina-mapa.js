import { bootstrap } from "./main.js";
import { Pontos } from "./dataService.js";
import {
  htmlListaPontos,
  preencherSelectCategorias,
  preencherSelectCidades,
} from "./ui.js";
import { iniciarMapa, adicionarMarcadores, focarPonto } from "./map.js";
import { debounce, $, paramsURL } from "./utils.js";

await bootstrap();

const selCat = $("#filtro-categoria");
const selCid = $("#filtro-cidade");
const inpBusca = $("#filtro-busca");
const listaEl = $("#lista-pontos");
const contadorEl = $("#contador-pontos");

preencherSelectCategorias(selCat);
preencherSelectCidades(selCid, Pontos.cidadesDisponiveis());

// Pré-seleção via URL
const params = paramsURL();
if (params.get("cat")) selCat.value = params.get("cat");
if (params.get("cidade")) selCid.value = params.get("cidade");

iniciarMapa("mapa-principal");

function atualizar() {
  const encontrados = Pontos.filtrar({
    categoriaId: selCat.value || null,
    cidade: selCid.value || null,
    termo: inpBusca.value.trim() || null,
  });

  contadorEl.textContent =
    encontrados.length === 0
      ? "Nenhum ponto encontrado"
      : `${encontrados.length} ponto${encontrados.length > 1 ? "s" : ""}`;

  htmlListaPontos(encontrados, listaEl);
  adicionarMarcadores(encontrados, {
    aoClicar: (p) => {
      const card = listaEl.querySelector(`.card-ponto[data-id="${p.id}"]`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  });
}

selCat.addEventListener("change", atualizar);
selCid.addEventListener("change", atualizar);
inpBusca.addEventListener("input", debounce(atualizar, 250));

listaEl.addEventListener("click", (e) => {
  const card = e.target.closest(".card-ponto");
  if (card && !e.target.closest("a")) focarPonto(card.dataset.id);
});

atualizar();
