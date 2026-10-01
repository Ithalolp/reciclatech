# ReciclaTech — Tecnologia a favor da reciclagem

Plataforma web para localização de pontos de descarte de resíduos eletrônicos
e promoção de educação ambiental. Projeto de extensão universitária do curso de
Sistemas de Informação (Atividades Práticas Interdisciplinares de Extensão —
Tecnologia e Sociedade).

## Como rodar localmente

O projeto **não precisa de servidor**. Basta abrir o `index.html` em um navegador
moderno. Porém, por usar **ES Modules**, alguns navegadores exigem que os arquivos
sejam servidos via HTTP.

### Opção 1 — Extensão Live Server (VS Code)

1. Instale a extensão **Live Server**.
2. Clique com o botão direito em `index.html` → **Open with Live Server**.

### Opção 2 — Servidor Python (já vem instalado)

```bash
# Na raiz do projeto:
python -m http.server 8000
# Acesse http://localhost:8000
```
