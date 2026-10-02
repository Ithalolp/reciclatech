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
    zoomControl: false,
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

/**
 * Pin em formato de gota (estilo Google Maps) na cor verde do ReciclaTech.
 * SVG puro, entra com animação suave de "drop".
 */
function pinIcon() {
  const html = `
    <div class="pin-teardrop" aria-hidden="true">
      <svg viewBox="0 0 32 44" width="40" height="52" xmlns="http://www.w3.org/2000/svg">
        <!-- sombra embaixo -->
        <ellipse cx="16" cy="41" rx="7" ry="2.5" fill="rgba(10,15,28,0.25)"/>
        <!-- corpo do pin (gota) -->
        <path
          d="M16 1.5
             C 8.5 1.5, 2.5 7.5, 2.5 15
             C 2.5 21, 8 26.5, 14 34
             C 15 35.3, 15.5 36.5, 16 39
             C 16.5 36.5, 17 35.3, 18 34
             C 24 26.5, 29.5 21, 29.5 15
             C 29.5 7.5, 23.5 1.5, 16 1.5 Z"
          fill="#00E676"
          stroke="#0A0F1C"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <!-- círculo branco interno -->
        <circle cx="16" cy="14.5" r="5" fill="#FFFFFF"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-pin",
    iconSize: [40, 52],
    iconAnchor: [20, 50],
    popupAnchor: [0, -46],
  });
}

export function adicionarMarcadores(pontos, { aoClicar } = {}) {
  limparMarcadores();
  if (!mapa) return;

  pontos.forEach((p) => {
    const marker = L.marker([p.lat, p.lng], { icon: pinIcon() });
    marker.bindPopup(`
      <div class="popup">
        <div class="popup-title">${escaparHTML(p.nome)}</div>
        <div class="popup-addr">${escaparHTML(p.endereco)} — ${escaparHTML(p.cidade)}</div>
        <div class="popup-actions">
          <a href="ponto.html?id=${p.id}">Ver detalhes</a>
          <a href="${linkGoogleMaps(p.lat, p.lng)}" target="_blank" rel="noopener">Como chegar</a>
        </div>
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
    mapa.fitBounds(grupo.getBounds().pad(0.2));
  }
}

export function focarPonto(id) {
  const m = marcadoresPorId.get(Number(id));
  if (!m) return;
  mapa.setView(m.getLatLng(), 16);
  m.openPopup();
}
