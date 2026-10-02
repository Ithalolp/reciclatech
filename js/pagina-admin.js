import { bootstrap } from "./main.js";
import { Auth } from "./auth.js";
import { Pontos, Categorias } from "./dataService.js";
import { escaparHTML, slugify, $, $$, toast } from "./utils.js";
import { iconeCategoria, nomeIconeCategoria, OPCOES_ICONE } from "./icons.js";

await bootstrap();

/* =========================================================
   TELA DE LOGIN
   ========================================================= */
const telaLogin = $("#tela-login");
const telaPainel = $("#tela-painel");

function mostrarPainel() {
  telaLogin.hidden = true;
  telaPainel.hidden = false;
  renderPontos();
  renderCategorias();
}

if (Auth.logado()) mostrarPainel();

$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = $("#usuario").value;
  const senha = $("#senha").value;
  const ok = await Auth.login(usuario, senha);
  if (ok) {
    $("#login-erro").hidden = true;
    $("#form-login").reset();
    mostrarPainel();
  } else {
    $("#login-erro").hidden = false;
  }
});

$("#btn-sair").addEventListener("click", () => {
  Auth.logout();
  location.reload();
});

/* =========================================================
   TABS
   ========================================================= */
$$(".tab").forEach((tab) => {
  tab.setAttribute("aria-selected", tab.classList.contains("ativo"));
  tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => {
      t.classList.remove("ativo");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("ativo");
    tab.setAttribute("aria-selected", "true");
    const alvo = tab.dataset.tab;
    $$(".tab-painel").forEach((p) => (p.hidden = p.dataset.painel !== alvo));
  });
});

/* =========================================================
   MODAL GENÉRICO
   ========================================================= */
const modal = $("#modal");
const modalTitulo = $("#modal-titulo");
const modalCorpo = $("#modal-corpo");
const modalFooter = $("#modal-footer");
let focoAnterior = null;

function abrirModal({ titulo, corpoHTML, acoesHTML }) {
  focoAnterior = document.activeElement;
  modalTitulo.textContent = titulo;
  modalCorpo.innerHTML = corpoHTML;
  modalFooter.innerHTML = acoesHTML;
  modal.hidden = false;
  const primeiro = modalCorpo.querySelector("input, select, textarea, button");
  (primeiro || modal.querySelector(".modal__fechar")).focus();
}
function fecharModal() {
  modal.hidden = true;
  modalCorpo.innerHTML = "";
  modalFooter.innerHTML = "";
  if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus();
  focoAnterior = null;
}
modal.addEventListener("click", (e) => {
  if (e.target.closest("[data-fechar-modal]")) fecharModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) fecharModal();
});

/* =========================================================
   PONTOS — CRUD
   ========================================================= */
const listaPontosEl = $("#lista-admin-pontos");

function renderPontos() {
  const lista = Pontos.listar();
  if (!lista.length) {
    listaPontosEl.innerHTML =
      '<div class="vazio"><p>Nenhum ponto cadastrado.</p></div>';
    return;
  }
  listaPontosEl.innerHTML = lista
    .map(
      (p) => `
    <article class="item-admin">
      <div class="item-admin__info">
        <h3>${escaparHTML(p.nome)} ${p.ativo === 0 ? '<span class="tag-inativo">inativo</span>' : ""}</h3>
        <p>${escaparHTML(p.endereco)} — ${escaparHTML(p.bairro || "")}, ${escaparHTML(p.cidade)}/${escaparHTML(p.uf)}</p>
        <p class="item-admin__meta">${(p.categorias || []).length} categoria(s) · lat ${p.lat}, lng ${p.lng}</p>
      </div>
      <div class="item-admin__acoes">
        <button class="btn btn--ghost btn--sm" data-editar-ponto="${p.id}" aria-label="Editar ${escaparHTML(p.nome)}">Editar</button>
        <button class="btn btn--danger btn--sm" data-excluir-ponto="${p.id}" aria-label="Excluir ${escaparHTML(p.nome)}">Excluir</button>
      </div>
    </article>
  `,
    )
    .join("");
}

function formPontoHTML(p = {}) {
  const cats = Categorias.listar();
  const selecionadas = new Set(p.categorias || []);
  return `
    <form id="form-ponto" class="form-grid">
      <label>Nome *<input name="nome" required value="${escaparHTML(p.nome || "")}"></label>
      <label>Endereço *<input name="endereco" required value="${escaparHTML(p.endereco || "")}"></label>
      <label>Bairro<input name="bairro" value="${escaparHTML(p.bairro || "")}"></label>
      <label>Cidade *<input name="cidade" required value="${escaparHTML(p.cidade || "Juazeiro do Norte")}"></label>
      <label>UF *<input name="uf" required maxlength="2" value="${escaparHTML(p.uf || "CE")}"></label>
      <label>Latitude *<input name="lat" type="number" step="any" required value="${p.lat ?? ""}"></label>
      <label>Longitude *<input name="lng" type="number" step="any" required value="${p.lng ?? ""}"></label>
      <label>Horário<input name="horario" value="${escaparHTML(p.horario || "")}"></label>
      <label>Telefone<input name="telefone" value="${escaparHTML(p.telefone || "")}"></label>
      <label>WhatsApp (só números, com DDI)<input name="whatsapp" value="${escaparHTML(p.whatsapp || "")}"></label>
      <label class="form-grid__full">Observações<textarea name="observacoes" rows="3">${escaparHTML(p.observacoes || "")}</textarea></label>
      <fieldset class="form-grid__full">
        <legend>Materiais aceitos</legend>
        <div class="chips-cats">
          ${cats
            .map(
              (c) => `
            <label class="chip-check">
              <input type="checkbox" name="cats" value="${c.id}" ${selecionadas.has(c.id) ? "checked" : ""}>
              ${iconeCategoria(c, { tam: 14 })}
              <span>${escaparHTML(c.nome)}</span>
            </label>
          `,
            )
            .join("")}
        </div>
      </fieldset>
      <label class="form-grid__full form-grid__check">
        <span><input type="checkbox" name="ativo" ${p.ativo !== 0 ? "checked" : ""}> Ponto ativo (visível no site)</span>
      </label>
    </form>
  `;
}

function coletarFormPonto() {
  const f = $("#form-ponto");
  const fd = new FormData(f);
  return {
    nome: fd.get("nome").trim(),
    endereco: fd.get("endereco").trim(),
    bairro: fd.get("bairro").trim(),
    cidade: fd.get("cidade").trim(),
    uf: fd.get("uf").trim().toUpperCase(),
    lat: parseFloat(fd.get("lat")),
    lng: parseFloat(fd.get("lng")),
    horario: fd.get("horario").trim(),
    telefone: fd.get("telefone").trim(),
    whatsapp: fd.get("whatsapp").trim(),
    observacoes: fd.get("observacoes").trim(),
    categorias: fd.getAll("cats").map(Number),
    ativo: fd.get("ativo") ? 1 : 0,
  };
}

$("#btn-novo-ponto").addEventListener("click", () => {
  abrirModal({
    titulo: "Novo ponto de coleta",
    corpoHTML: formPontoHTML(),
    acoesHTML: `
      <button class="btn btn--ghost" data-fechar-modal>Cancelar</button>
      <button class="btn btn--primary" id="salvar-ponto">Salvar ponto</button>
    `,
  });
  $("#salvar-ponto").addEventListener("click", () => {
    if (!$("#form-ponto").reportValidity()) return;
    const dados = coletarFormPonto();
    Pontos.criar(dados);
    fecharModal();
    renderPontos();
    toast("Ponto criado com sucesso.", "sucesso");
  });
});

listaPontosEl.addEventListener("click", (e) => {
  const alvo = e.target.closest("button");
  if (!alvo) return;
  const editarId = alvo.getAttribute("data-editar-ponto");
  const excluirId = alvo.getAttribute("data-excluir-ponto");

  if (editarId) {
    const p = Pontos.obter(editarId);
    if (!p) return;
    abrirModal({
      titulo: `Editar: ${p.nome}`,
      corpoHTML: formPontoHTML(p),
      acoesHTML: `
        <button class="btn btn--ghost" data-fechar-modal>Cancelar</button>
        <button class="btn btn--primary" id="salvar-ponto">Salvar alterações</button>
      `,
    });
    $("#salvar-ponto").addEventListener("click", () => {
      if (!$("#form-ponto").reportValidity()) return;
      Pontos.atualizar(editarId, coletarFormPonto());
      fecharModal();
      renderPontos();
      toast("Ponto atualizado.", "sucesso");
    });
  }

  if (excluirId) {
    const p = Pontos.obter(excluirId);
    if (!p) return;
    abrirModal({
      titulo: "Confirmar exclusão",
      corpoHTML: `<p>Tem certeza que deseja excluir <strong>${escaparHTML(p.nome)}</strong>? Essa ação não pode ser desfeita.</p>`,
      acoesHTML: `
        <button class="btn btn--ghost" data-fechar-modal>Cancelar</button>
        <button class="btn btn--danger" id="confirmar-exclusao">Excluir definitivamente</button>
      `,
    });
    $("#confirmar-exclusao").addEventListener("click", () => {
      Pontos.excluir(excluirId);
      fecharModal();
      renderPontos();
      toast("Ponto excluído.", "sucesso");
    });
  }
});

/* =========================================================
   CATEGORIAS — CRUD
   ========================================================= */
const listaCatsEl = $("#lista-admin-categorias");

function renderCategorias() {
  const lista = Categorias.listar();
  if (!lista.length) {
    listaCatsEl.innerHTML =
      '<div class="vazio"><p>Nenhuma categoria cadastrada.</p></div>';
    return;
  }
  listaCatsEl.innerHTML = lista
    .map(
      (c) => `
    <article class="item-admin">
      <div class="item-admin__info">
        <h3 class="titulo-icone"><span class="ico-tile ico-tile--sm">${iconeCategoria(c, { tam: 16 })}</span>${escaparHTML(c.nome)}</h3>
        <p>${escaparHTML(c.descricao || "")}</p>
        <p class="item-admin__meta">slug: ${escaparHTML(c.slug)}</p>
      </div>
      <div class="item-admin__acoes">
        <button class="btn btn--ghost btn--sm" data-editar-cat="${c.id}" aria-label="Editar ${escaparHTML(c.nome)}">Editar</button>
        <button class="btn btn--danger btn--sm" data-excluir-cat="${c.id}" aria-label="Excluir ${escaparHTML(c.nome)}">Excluir</button>
      </div>
    </article>
  `,
    )
    .join("");
}

function formCategoriaHTML(c = {}) {
  const atual = nomeIconeCategoria(c);
  return `
    <form id="form-cat" class="form-grid">
      <label>Nome *<input name="nome" required value="${escaparHTML(c.nome || "")}"></label>
      <label>Ícone
        <select name="icone">
          ${OPCOES_ICONE.map(
            ([valor, rotulo]) =>
              `<option value="${valor}" ${valor === atual ? "selected" : ""}>${rotulo}</option>`,
          ).join("")}
        </select>
      </label>
      <label class="form-grid__full">Descrição<input name="descricao" value="${escaparHTML(c.descricao || "")}"></label>
      <label class="form-grid__full">Slug (deixe em branco para gerar)<input name="slug" value="${escaparHTML(c.slug || "")}"></label>
    </form>
  `;
}

function coletarFormCategoria() {
  const fd = new FormData($("#form-cat"));
  const nome = fd.get("nome").trim();
  const slug = fd.get("slug").trim() || slugify(nome);
  return {
    nome,
    icone: fd.get("icone") || "package",
    descricao: fd.get("descricao").trim(),
    slug,
  };
}

$("#btn-nova-categoria").addEventListener("click", () => {
  abrirModal({
    titulo: "Nova categoria",
    corpoHTML: formCategoriaHTML(),
    acoesHTML: `
      <button class="btn btn--ghost" data-fechar-modal>Cancelar</button>
      <button class="btn btn--primary" id="salvar-cat">Salvar categoria</button>
    `,
  });
  $("#salvar-cat").addEventListener("click", () => {
    if (!$("#form-cat").reportValidity()) return;
    Categorias.criar(coletarFormCategoria());
    fecharModal();
    renderCategorias();
    toast("Categoria criada.", "sucesso");
  });
});

listaCatsEl.addEventListener("click", (e) => {
  const alvo = e.target.closest("button");
  if (!alvo) return;
  const editarId = alvo.getAttribute("data-editar-cat");
  const excluirId = alvo.getAttribute("data-excluir-cat");

  if (editarId) {
    const c = Categorias.obter(editarId);
    if (!c) return;
    abrirModal({
      titulo: `Editar: ${c.nome}`,
      corpoHTML: formCategoriaHTML(c),
      acoesHTML: `
        <button class="btn btn--ghost" data-fechar-modal>Cancelar</button>
        <button class="btn btn--primary" id="salvar-cat">Salvar alterações</button>
      `,
    });
    $("#salvar-cat").addEventListener("click", () => {
      if (!$("#form-cat").reportValidity()) return;
      Categorias.atualizar(editarId, coletarFormCategoria());
      fecharModal();
      renderCategorias();
      toast("Categoria atualizada.", "sucesso");
    });
  }

  if (excluirId) {
    const c = Categorias.obter(excluirId);
    if (!c) return;
    abrirModal({
      titulo: "Confirmar exclusão",
      corpoHTML: `<p>Excluir <strong>${escaparHTML(c.nome)}</strong>? A categoria será removida de todos os pontos.</p>`,
      acoesHTML: `
        <button class="btn btn--ghost" data-fechar-modal>Cancelar</button>
        <button class="btn btn--danger" id="confirmar-exclusao-cat">Excluir</button>
      `,
    });
    $("#confirmar-exclusao-cat").addEventListener("click", () => {
      Categorias.excluir(excluirId);
      fecharModal();
      renderCategorias();
      renderPontos();
      toast("Categoria excluída.", "sucesso");
    });
  }
});
