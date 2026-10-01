/* Wrapper do Leaflet */
import { CONFIG } from "./config.js";
import { escaparHTML, linkGoogleMaps } from "./utils.js";

let mapa = null;
let camadaMarcadores = null;
const marcadoresPorId = new Map();

export function iniciarMapa(elementoId, { centro, zoom } = {}) {
  if (mapa) return mapa;

  const centroFinal = centro || CONFIG.mapa.centroInicial;
  const zoomFinal = zoom || CONFIG.mapa.zoomInicial;

  mapa = L.map(elementoId, {
    center: centroFinal,
    zoom: zoomFinal,
    scrollWheelZoom: true,
  });

  L.tileLayer(CONFIG.mapa.tileUrl, {
    attribution: CONFIG.mapa.atribuicao,
    maxZoom: 19,
  }).addTo(mapa);

  camadaMarcadores = L.layerGroup().addTo(mapa);
  return mapa;
}

export function limparMarcadores() {
  if (camadaMarcadores) camadaMarcadores.clearLayers();
  marcadoresPorId.clear();
}

export function adicionarMarcadores(pontos, { aoClicar } = {}) {
  limparMarcadores();
  if (!mapa) return;

  pontos.forEach((p) => {
    const marker = L.marker([p.lat, p.lng]);
    marker.bindPopup(`
      <div class="popup-ponto">
        <strong>${escaparHTML(p.nome)}</strong><br>
        <small>${escaparHTML(p.endereco)} — ${escaparHTML(p.cidade)}</small><br>
        <a href="ponto.html?id=${p.id}">Ver detalhes</a> ·
        <a href="${linkGoogleMaps(p.lat, p.lng)}" target="_blank" rel="noopener">Como chegar</a>
      </div>
    `);
    marker.on("click", () => {
      if (typeof aoClicar === "function") aoClicar(p);
    });
    marker.addTo(camadaMarcadores);
    marcadoresPorId.set(p.id, marker);
  });

  if (pontos.length) {
    const grupo = L.featureGroup(Array.from(marcadoresPorId.values()));
    mapa.fitBounds(grupo.getBounds().pad(0.15));
  }
}

export function focarPonto(id) {
  const m = marcadoresPorId.get(Number(id));
  if (!m) return;
  mapa.setView(m.getLatLng(), 16);
  m.openPopup();
}

export function mapaInstancia() {
  return mapa;
}
