/* ============================================================
   DataService — camada de dados.
   Hoje usa localStorage. Amanhã basta trocar por fetch() para
   um backend PHP+MySQL, mantendo a mesma interface pública.
   ============================================================ */
import { CONFIG } from "./config.js";
import { gerarId } from "./utils.js";

function ler(chave, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? fallback;
  } catch {
    return fallback;
  }
}
function gravar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

/* ---------- CATEGORIAS ---------- */
export const Categorias = {
  listar() {
    return ler(CONFIG.chaves.categorias);
  },
  obter(id) {
    return this.listar().find((c) => c.id === Number(id)) || null;
  },
  criar(dados) {
    const lista = this.listar();
    const nova = { id: gerarId(lista), ...dados };
    lista.push(nova);
    gravar(CONFIG.chaves.categorias, lista);
    return nova;
  },
  atualizar(id, dados) {
    const lista = this.listar();
    const i = lista.findIndex((c) => c.id === Number(id));
    if (i === -1) return null;
    lista[i] = { ...lista[i], ...dados, id: Number(id) };
    gravar(CONFIG.chaves.categorias, lista);
    return lista[i];
  },
  excluir(id) {
    const lista = this.listar().filter((c) => c.id !== Number(id));
    gravar(CONFIG.chaves.categorias, lista);
    // Remove a categoria dos pontos
    const pontos = Pontos.listar();
    pontos.forEach((p) => {
      p.categorias = (p.categorias || []).filter((cid) => cid !== Number(id));
    });
    gravar(CONFIG.chaves.pontos, pontos);
  },
};

/* ---------- PONTOS ---------- */
export const Pontos = {
  listar({ apenasAtivos = false } = {}) {
    let lista = ler(CONFIG.chaves.pontos);
    if (apenasAtivos) lista = lista.filter((p) => p.ativo !== 0);
    return lista;
  },
  obter(id) {
    return this.listar().find((p) => p.id === Number(id)) || null;
  },
  criar(dados) {
    const lista = this.listar();
    const novo = { id: gerarId(lista), ativo: 1, ...dados };
    lista.push(novo);
    gravar(CONFIG.chaves.pontos, lista);
    return novo;
  },
  atualizar(id, dados) {
    const lista = this.listar();
    const i = lista.findIndex((p) => p.id === Number(id));
    if (i === -1) return null;
    lista[i] = { ...lista[i], ...dados, id: Number(id) };
    gravar(CONFIG.chaves.pontos, lista);
    return lista[i];
  },
  excluir(id) {
    const lista = this.listar().filter((p) => p.id !== Number(id));
    gravar(CONFIG.chaves.pontos, lista);
  },

  /* Filtros combinados */
  filtrar({ categoriaId = null, cidade = null, termo = null } = {}) {
    let lista = this.listar({ apenasAtivos: true });

    if (categoriaId) {
      lista = lista.filter((p) =>
        (p.categorias || []).includes(Number(categoriaId)),
      );
    }
    if (cidade) {
      lista = lista.filter((p) => p.cidade === cidade);
    }
    if (termo) {
      const t = termo.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(t) ||
          (p.bairro || "").toLowerCase().includes(t) ||
          (p.endereco || "").toLowerCase().includes(t),
      );
    }
    return lista;
  },

  cidadesDisponiveis() {
    const set = new Map();
    this.listar().forEach((p) => {
      const chave = `${p.cidade}|${p.uf}`;
      if (!set.has(chave)) set.set(chave, { cidade: p.cidade, uf: p.uf });
    });
    return Array.from(set.values()).sort((a, b) =>
      a.cidade.localeCompare(b.cidade),
    );
  },
};

/* ---------- ADMIN ---------- */
export const Admin = {
  obter() {
    return ler(CONFIG.chaves.admin, null);
  },
  salvar(dados) {
    gravar(CONFIG.chaves.admin, dados);
  },
};
