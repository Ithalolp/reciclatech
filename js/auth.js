/* Autenticação do administrador (sessão em sessionStorage) */
import { CONFIG } from "./config.js";
import { Admin } from "./dataService.js";
import { sha256 } from "./utils.js";

export const Auth = {
  async garantirAdminPadrao() {
    if (Admin.obter()) return;
    const { usuario, senha } = CONFIG.adminPadrao;
    const senhaHash = await sha256(senha);
    Admin.salvar({ usuario, senhaHash, criadoEm: new Date().toISOString() });
  },

  async login(usuario, senha) {
    const admin = Admin.obter();
    if (!admin) return false;
    if (admin.usuario !== usuario.trim()) return false;
    const hash = await sha256(senha);
    if (hash !== admin.senhaHash) return false;
    sessionStorage.setItem(
      CONFIG.chaves.sessao,
      JSON.stringify({
        usuario: admin.usuario,
        loginEm: Date.now(),
      }),
    );
    return true;
  },

  logout() {
    sessionStorage.removeItem(CONFIG.chaves.sessao);
  },

  logado() {
    try {
      const s = JSON.parse(sessionStorage.getItem(CONFIG.chaves.sessao));
      if (!s) return false;
      // Sessão expira em 4h
      if (Date.now() - s.loginEm > 4 * 60 * 60 * 1000) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  exigirLogin(redirecionarPara = "admin.html") {
    if (!this.logado()) {
      window.location.href = redirecionarPara;
      return false;
    }
    return true;
  },
};
