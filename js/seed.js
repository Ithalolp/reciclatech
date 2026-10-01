/* Popula dados iniciais na primeira execução */
import { CONFIG, CATEGORIAS_INICIAIS, PONTOS_EXEMPLO } from "./config.js";

export function garantirSeed() {
  if (localStorage.getItem(CONFIG.chaves.seedOk)) return;

  if (!localStorage.getItem(CONFIG.chaves.categorias)) {
    localStorage.setItem(
      CONFIG.chaves.categorias,
      JSON.stringify(CATEGORIAS_INICIAIS),
    );
  }
  if (!localStorage.getItem(CONFIG.chaves.pontos)) {
    localStorage.setItem(CONFIG.chaves.pontos, JSON.stringify(PONTOS_EXEMPLO));
  }
  localStorage.setItem(CONFIG.chaves.seedOk, "1");
}

export function resetarDados() {
  Object.values(CONFIG.chaves).forEach((k) => localStorage.removeItem(k));
  garantirSeed();
}
