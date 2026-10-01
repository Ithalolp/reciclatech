import { bootstrap } from "./main.js";
import { Pontos, Categorias } from "./dataService.js";
import { escaparHTML, linkGoogleMaps, paramsURL } from "./utils.js";
import { iniciarMapa, adicionarMarcadores } from "./map.js";
import { htmlCategoriaBadge } from "./ui.js";

await bootstrap();

const id = Number(paramsURL().get("id"));
const container = document.getElementById("conteudo-ponto");

if (!id) {
  container.innerHTML = `<div class="vazio"><h1>Ponto não informado</h1><a class="btn btn--primary" href="mapa.html">Ver mapa</a></div>`;
} else {
  const ponto = Pontos.obter(id);
  if (!ponto) {
    container.innerHTML = `<div class="vazio"><h1>Ponto não encontrado</h1><a class="btn btn--primary" href="mapa.html">Ver mapa</a></div>`;
  } else {
    const cats = (ponto.categorias || []).map(htmlCategoriaBadge).join("");
    const whats = ponto.whatsapp
      ? `<a class="btn btn--ghost btn--sm" target="_blank" rel="noopener"
            href="https://wa.me/${escaparHTML(ponto.whatsapp)}">💬 WhatsApp</a>`
      : "";

    container.innerHTML = `
      <nav class="breadcrumb"><a href="mapa.html">Mapa</a> / <span>${escaparHTML(ponto.nome)}</span></nav>

      <header class="ponto-header">
        <h1>${escaparHTML(ponto.nome)}</h1>
        <p class="ponto-header__endereco">
          📍 ${escaparHTML(ponto.endereco)} — ${escaparHTML(ponto.bairro || "")},
          ${escaparHTML(ponto.cidade)}/${escaparHTML(ponto.uf)}
        </p>
      </header>

      <div class="ponto-grid">
        <div class="ponto-info">
          <dl class="info-lista">
            ${ponto.horario ? `<div><dt>🕒 Horário</dt><dd>${escaparHTML(ponto.horario)}</dd></div>` : ""}
            ${ponto.telefone ? `<div><dt>📞 Telefone</dt><dd>${escaparHTML(ponto.telefone)}</dd></div>` : ""}
            ${ponto.observacoes ? `<div><dt>ℹ️ Observações</dt><dd>${escaparHTML(ponto.observacoes)}</dd></div>` : ""}
          </dl>

          <section class="ponto-cats">
            <h2>♻️ Materiais aceitos</h2>
            <div class="cats-wrap">${cats || "<p>Nenhuma categoria informada.</p>"}</div>
          </section>

          <div class="ponto-acoes">
            <a class="btn btn--primary btn--lg" target="_blank" rel="noopener"
               href="${linkGoogleMaps(ponto.lat, ponto.lng)}">Abrir no Google Maps</a>
            ${whats}
          </div>
        </div>

        <div class="ponto-mapa" id="mapa-ponto" aria-label="Localização do ponto"></div>
      </div>
    `;

    iniciarMapa("mapa-ponto", { centro: [ponto.lat, ponto.lng], zoom: 16 });
    adicionarMarcadores([ponto]);
  }
}
