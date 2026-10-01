/* Bootstrap comum a todas as páginas */
import { CONFIG } from "./config.js";
import { garantirSeed } from "./seed.js";
import { Auth } from "./auth.js";
import { $, $$ } from "./utils.js";

export async function bootstrap() {
  garantirSeed();
  await Auth.garantirAdminPadrao();

  // Aplica nome da plataforma em elementos [data-nome-plataforma]
  $$("[data-nome-plataforma]").forEach(
    (el) => (el.textContent = CONFIG.nomePlataforma),
  );
  document.title = document.title.replace(
    "{{PLATAFORMA}}",
    CONFIG.nomePlataforma,
  );

  // Menu mobile
  const botaoMenu = $("[data-menu-toggle]");
  const nav = $("[data-nav]");
  if (botaoMenu && nav) {
    botaoMenu.addEventListener("click", () => {
      const aberto = nav.classList.toggle("aberto");
      botaoMenu.setAttribute("aria-expanded", aberto);
    });
  }

  // Link ativo
  const paginaAtual = location.pathname.split("/").pop() || "index.html";
  $$("[data-nav] a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === paginaAtual) a.classList.add("ativo");
  });

  // Ano no footer
  $$("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));
}
