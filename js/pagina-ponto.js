import { bootstrap } from "./main.js";
import { Pontos } from "./dataService.js";
import { escaparHTML, linkGoogleMaps, paramsURL } from "./utils.js";
import { iniciarMapa, adicionarMarcadores } from "./map.js";
import { htmlCategoriaBadge } from "./ui.js";
import { icone } from "./icons.js";

await bootstrap();

const id = Number(paramsURL().get("id"));
const container = document.getElementById("conteudo-ponto");

if (!container) {
  console.warn("container #conteudo-ponto não encontrado");
} else if (!id) {
  container.innerHTML = `
    <div class="empty" style="margin:var(--s-7) 0">
      <h1 style="margin-bottom:var(--s-3)">Ponto não informado</h1>
      <a class="btn btn--primary" href="mapa.html">Ver mapa</a>
    </div>`;
} else {
  const ponto = Pontos.obter(id);
  if (!ponto) {
    container.innerHTML = `
      <div class="empty" style="margin:var(--s-7) 0">
        <h1 style="margin-bottom:var(--s-3)">Ponto não encontrado</h1>
        <a class="btn btn--primary" href="mapa.html">Ver mapa</a>
      </div>`;
  } else {
    const cats = (ponto.categorias || []).map(htmlCategoriaBadge).join("");
    const whats = ponto.whatsapp
      ? `<a class="btn btn--ghost btn--lg" target="_blank" rel="noopener"
            href="https://wa.me/${escaparHTML(ponto.whatsapp)}">
            ${icone("chat", { tam: 18 })} WhatsApp
         </a>`
      : "";
    const local = [ponto.bairro, `${ponto.cidade}/${ponto.uf}`]
      .filter(Boolean)
      .join(", ");

    const infoItem = (ic, rotulo, valor) =>
      valor
        ? `<div class="detail-item">
             <dt>${icone(ic, { tam: 15 })} <span>${rotulo}</span></dt>
             <dd>${escaparHTML(valor)}</dd>
           </div>`
        : "";

    container.innerHTML = `
      <div class="detail-wrap">
        <nav class="detail-breadcrumb" aria-label="Você está em">
          <a href="mapa.html">Mapa</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">${escaparHTML(ponto.nome)}</span>
        </nav>

        <header class="detail-header">
          <h1>${escaparHTML(ponto.nome)}</h1>
          <p class="detail-header__addr">
            ${icone("map-pin", { tam: 18 })}
            <span>${escaparHTML(ponto.endereco)} — ${escaparHTML(local)}</span>
          </p>
        </header>

        <div class="detail-grid">
          <div class="detail-info">
            <dl class="detail-list">
              ${infoItem("clock", "Horário", ponto.horario)}
              ${infoItem("phone", "Telefone", ponto.telefone)}
              ${infoItem("info", "Observações", ponto.observacoes)}
            </dl>

            <section class="detail-cats">
              <h2>Materiais aceitos</h2>
              <div class="detail-cats__wrap">
                ${cats || '<p class="detail-muted">Nenhuma categoria informada.</p>'}
              </div>
            </section>

            <div class="detail-actions">
              <a class="btn btn--primary btn--lg" target="_blank" rel="noopener"
                 href="${linkGoogleMaps(ponto.lat, ponto.lng)}">
                ${icone("navigation", { tam: 18 })} Abrir no Google Maps
              </a>
              ${whats}
            </div>
          </div>

          <div class="detail-map" id="mapa-ponto" role="region" aria-label="Localização do ponto no mapa"></div>
        </div>
      </div>
    `;

    iniciarMapa("mapa-ponto", { centro: [ponto.lat, ponto.lng], zoom: 16 });
    adicionarMarcadores([ponto]);
  }
}
