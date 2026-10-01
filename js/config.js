/* ============================================================
   ReciclaTech — Configuração central
   Troque o nome da plataforma aqui e todo o site atualiza.
   ============================================================ */

export const CONFIG = {
  // Identidade
  nomePlataforma: "ReciclaTech",
  slogan: "Tecnologia a favor da reciclagem",
  cidadeInicial: "Juazeiro do Norte",
  ufInicial: "CE",

  // Mapa
  mapa: {
    centroInicial: [-7.2136, -39.3153], // Juazeiro do Norte - CE
    zoomInicial: 13,
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    atribuicao:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },

  // Persistência
  chaves: {
    pontos: "reciclatech:pontos",
    categorias: "reciclatech:categorias",
    admin: "reciclatech:admin",
    sessao: "reciclatech:sessao",
    seedOk: "reciclatech:seed-v1",
  },

  // Credenciais admin padrão (serão hasheadas no primeiro uso)
  adminPadrao: {
    usuario: "admin",
    senha: "recicla",
  },
};

export const CATEGORIAS_INICIAIS = [
  {
    id: 1,
    slug: "celulares",
    nome: "Celulares e tablets",
    icone: "📱",
    descricao: "Smartphones, tablets e acessórios",
  },
  {
    id: 2,
    slug: "computadores",
    nome: "Computadores e notebooks",
    icone: "💻",
    descricao: "Desktops, notebooks e componentes",
  },
  {
    id: 3,
    slug: "cabos",
    nome: "Cabos e periféricos",
    icone: "🔌",
    descricao: "Cabos, carregadores, mouse, teclado",
  },
  {
    id: 4,
    slug: "pilhas",
    nome: "Pilhas e baterias",
    icone: "🔋",
    descricao: "Pilhas, baterias e acumuladores",
  },
  {
    id: 5,
    slug: "eletrodomesticos",
    nome: "Eletrodomésticos",
    icone: "📺",
    descricao: "Geladeiras, micro-ondas, TVs, etc.",
  },
  {
    id: 6,
    slug: "outros",
    nome: "Outros recicláveis",
    icone: "♻️",
    descricao: "Demais resíduos eletrônicos e recicláveis",
  },
];

export const PONTOS_EXEMPLO = [
  {
    id: 1,
    nome: "[EXEMPLO] Ecoponto Central",
    endereco: "Rua Exemplo, 100 — Centro",
    bairro: "Centro",
    cidade: "Juazeiro do Norte",
    uf: "CE",
    lat: -7.2136,
    lng: -39.3153,
    horario: "Seg a Sex, 08h às 17h",
    telefone: "(88) 0000-0000",
    whatsapp: "5588999999999",
    observacoes:
      "Ponto demonstrativo. Substitua por local real no painel administrativo.",
    categorias: [1, 2, 3, 4],
    ativo: 1,
  },
  {
    id: 2,
    nome: "[EXEMPLO] Coleta Seletiva Universitária",
    endereco: "Av. Exemplo, 500 — Bairro Modelo",
    bairro: "Bairro Modelo",
    cidade: "Juazeiro do Norte",
    uf: "CE",
    lat: -7.22,
    lng: -39.32,
    horario: "Seg a Sáb, 07h às 19h",
    telefone: "(88) 1111-1111",
    whatsapp: "5588988888888",
    observacoes:
      "Ponto demonstrativo. Substitua por local real no painel administrativo.",
    categorias: [1, 2, 3, 5, 6],
    ativo: 1,
  },
  {
    id: 3,
    nome: "[EXEMPLO] Cooperativa Verde",
    endereco: "Rua Demonstrativa, 250 — Bairro Verde",
    bairro: "Bairro Verde",
    cidade: "Juazeiro do Norte",
    uf: "CE",
    lat: -7.205,
    lng: -39.308,
    horario: "Seg a Sex, 08h às 16h",
    telefone: "(88) 2222-2222",
    whatsapp: "",
    observacoes:
      "Ponto demonstrativo. Substitua por local real no painel administrativo.",
    categorias: [4, 6],
    ativo: 1,
  },
];
