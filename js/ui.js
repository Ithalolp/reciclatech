/* Componentes de UI reutilizáveis */
import { escaparHTML, linkGoogleMaps } from "./utils.js";
import { Categorias } from "./dataService.js";

export function htmlCategoriaBadge(catId) {
  const c = Categorias.obter(catId);
  if (!c) return "";
  return `<span class="badge-categoria" title="${escaparHTML(c.nome)}">
    <span aria-hidden="true">${c.icone}</span> ${escaparHTML(c.nome)}
  </span>`;
}

export function htmlCardPonto(ponto, { compacto = false } = {}) {
  const cats = (ponto.categorias || []).map(htmlCategoriaBadge).join("");
  const urlPonto = `ponto.html?id=${ponto.id}`;
  return `
    <article class="card-ponto" data-id="${ponto.id}">
      <header class="card-ponto__head">
        <h3 class="card-ponto__titulo">
          <a href="${urlPonto}">${escaparHTML(ponto.nome)}</a>
        </h3>
        <p class="card-ponto__endereco">
          📍 ${escaparHTML(ponto.endereco)} — ${escaparHTML(ponto.bairro || "")}, ${escaparHTML(ponto.cidade)}/${escaparHTML(ponto.uf)}
        </p>
      </header>
      ${
        compacto
          ? ""
          : `
        <ul class="card-ponto__info">
          ${ponto.horario ? `<li>🕒 ${escaparHTML(ponto.horario)}</li>` : ""}
          ${ponto.telefone ? `<li>📞 ${escaparHTML(ponto.telefone)}</li>` : ""}
        </ul>
      `
      }
      <div class="card-ponto__cats">${cats}</div>
      <footer class="card-ponto__acoes">
        <a class="btn btn--ghost btn--sm" href="${urlPonto}">Ver detalhes</a>
        <a class="btn btn--primary btn--sm"
           href="${linkGoogleMaps(ponto.lat, ponto.lng)}"
           target="_blank" rel="noopener">Como chegar</a>
      </footer>
    </article>
  `;
}

export function htmlListaPontos(pontos, container, opts = {}) {
  if (!pontos.length) {
    container.innerHTML = `
      <div class="vazio">
        <p><strong>Nenhum ponto encontrado.</strong></p>
        <p>Tente remover filtros ou buscar por outra categoria.</p>
      </div>`;
    return;
  }
  container.innerHTML = pontos.map((p) => htmlCardPonto(p, opts)).join("");
}

export function preencherSelectCategorias(
  select,
  { incluirTodas = true, valorSelecionado = "" } = {},
) {
  const cats = Categorias.listar();
  select.innerHTML =
    (incluirTodas ? `<option value="">Todos os materiais</option>` : "") +
    cats
      .map(
        (
          c,
        ) => `<option value="${c.id}" ${String(valorSelecionado) === String(c.id) ? "selected" : ""}>
      ${c.icone} ${escaparHTML(c.nome)}
    </option>`,
      )
      .join("");
}

export function preencherSelectCidades(select, cidades, valorSelecionado = "") {
  select.innerHTML =
    `<option value="">Todas as cidades</option>` +
    cidades
      .map(
        (c) => `<option value="${escaparHTML(c.cidade)}"
      ${valorSelecionado === c.cidade ? "selected" : ""}>
      ${escaparHTML(c.cidade)} / ${escaparHTML(c.uf)}
    </option>`,
      )
      .join("");
}

export function toast(mensagem, tipo = "info") {
  const el = document.createElement("div");
  el.className = `toast toast--${tipo}`;
  el.textContent = mensagem;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("toast--visivel"), 10);
  setTimeout(() => {
    el.classList.remove("toast--visivel");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}
