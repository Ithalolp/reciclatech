import { escaparHTML, linkGoogleMaps } from "./utils.js";
import { Categorias } from "./dataService.js";
import { icone, iconeCategoria } from "./icons.js";

export function htmlCategoriaBadge(catId) {
  const c = Categorias.obter(catId);
  if (!c) return "";
  return `<span class="badge badge--accent" title="${escaparHTML(c.nome)}">${iconeCategoria(c, { tam: 12 })}<span>${escaparHTML(c.nome)}</span></span>`;
}

export function htmlCardPonto(
  ponto,
  { compacto = false, categoriaDestaque = null } = {},
) {
  const urlPonto = `ponto.html?id=${ponto.id}`;
  const local = [ponto.bairro, `${ponto.cidade}/${ponto.uf}`]
    .filter(Boolean)
    .join(", ");

  // Todas as categorias do ponto
  const catsIds = ponto.categorias || [];

  // Qual categoria vai pro destaque?
  // 1º: a que o usuário selecionou no filtro (se o ponto aceita ela)
  // 2º: a primeira categoria do ponto
  let destaqueId = null;
  if (categoriaDestaque && catsIds.includes(Number(categoriaDestaque))) {
    destaqueId = Number(categoriaDestaque);
  } else if (catsIds.length) {
    destaqueId = catsIds[0];
  }

  const destaqueCat = destaqueId ? Categorias.obter(destaqueId) : null;
  const outrasIds = catsIds.filter((id) => id !== destaqueId);
  const outrasCats = outrasIds
    .map((id) => Categorias.obter(id))
    .filter(Boolean);

  return `
    <article class="point-card" data-id="${ponto.id}">
      <header class="point-card__head">
        <h3 class="point-card__name">
          <a href="${urlPonto}">${escaparHTML(ponto.nome)}</a>
        </h3>
        <p class="point-card__addr">
          ${icone("map-pin", { tam: 15 })}
          <span>${escaparHTML(ponto.endereco)} — ${escaparHTML(local)}</span>
        </p>
      </header>

      <div class="point-card__meta">
        ${
          destaqueCat
            ? `<span class="point-card__meta-item point-card__meta-item--accent">
                 ${iconeCategoria(destaqueCat, { tam: 14 })}
                 <span>${escaparHTML(destaqueCat.nome)}</span>
               </span>`
            : ""
        }
        <span class="point-card__meta-item">
          ${icone("map-pin", { tam: 14 })}
          <span>${escaparHTML(ponto.cidade)}</span>
        </span>
      </div>

      ${
        outrasCats.length
          ? `<div class="point-card__others">
               <span class="point-card__others-label">Também aceita</span>
               <div class="point-card__others-list">
                 ${outrasCats
                   .map(
                     (c) => `
                     <span class="point-card__other-chip" title="${escaparHTML(c.nome)}">
                       ${iconeCategoria(c, { tam: 12 })}
                       <span>${escaparHTML(c.nome)}</span>
                     </span>
                   `,
                   )
                   .join("")}
               </div>
             </div>`
          : ""
      }

      ${
        ponto.horario
          ? `<div class="point-card__hours">
               ${icone("clock", { tam: 16 })}
               <div>
                 <strong>Funcionamento</strong>
                 <span>${escaparHTML(ponto.horario)}</span>
               </div>
             </div>`
          : ""
      }

      ${
        ponto.telefone
          ? `<p class="point-card__phone">
               ${icone("phone", { tam: 14 })}
               <span>${escaparHTML(ponto.telefone)}</span>
             </p>`
          : ""
      }

      <footer class="point-card__actions">
        <a class="btn btn--ghost btn--sm" href="${urlPonto}">
          ${icone("info", { tam: 14 })}
          Detalhes
        </a>
        <a
          class="btn btn--primary btn--sm"
          href="${linkGoogleMaps(ponto.lat, ponto.lng)}"
          target="_blank"
          rel="noopener"
        >
          ${icone("navigation", { tam: 14 })}
          Google Maps
        </a>
      </footer>
    </article>
  `;
}

export function htmlListaPontos(pontos, container, opts = {}) {
  if (!pontos.length) {
    container.innerHTML = `
      <div class="empty">
        <strong style="display:block;margin-bottom:6px;color:var(--c-text)">Nenhum ponto encontrado</strong>
        Ajuste os filtros ou tente outra categoria.
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
    (incluirTodas ? `<option value="">Selecione o material</option>` : "") +
    cats
      .map(
        (c) =>
          `<option value="${c.id}" ${String(valorSelecionado) === String(c.id) ? "selected" : ""}>${escaparHTML(c.nome)}</option>`,
      )
      .join("");
}

export function preencherSelectCidades(select, cidades, valorSelecionado = "") {
  select.innerHTML =
    `<option value="">Selecione a cidade</option>` +
    cidades
      .map(
        (c) =>
          `<option value="${escaparHTML(c.cidade)}" ${valorSelecionado === c.cidade ? "selected" : ""}>${escaparHTML(c.cidade)} / ${escaparHTML(c.uf)}</option>`,
      )
      .join("");
}

export function toast(mensagem, tipo = "info") {
  const el = document.createElement("div");
  el.className = `toast toast--${tipo}`;
  el.setAttribute("role", "status");
  el.textContent = mensagem;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("toast--visible"));
  setTimeout(() => {
    el.classList.remove("toast--visible");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}
