/**
 * COMUNIDADE EM SINAIS - API CLIENT
 * Módulo de comunicação com o backend
 */

const API_BASE = '/api';

// ========================================
// Utilitários
// ========================================

async function requisicaoAPI(endpoint, opcoes = {}) {
  try {
    const resposta = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers
      },
      credentials: 'include',
      ...opcoes
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro na requisição');
    }

    return dados;
  } catch (erro) {
    console.error(`Erro na API ${endpoint}:`, erro);
    throw erro;
  }
}

// ========================================
// Autenticação
// ========================================

const APIAutenticacao = {
  async login(email, senha) {
    return requisicaoAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
  },

  async cadastro(nome, email, senha) {
    return requisicaoAPI('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha })
    });
  },

  async logout() {
    return requisicaoAPI('/auth/logout', {
      method: 'POST'
    });
  },

  async obterUsuario() {
    return requisicaoAPI('/auth/me');
  },

  async atualizarPerfil(dados) {
    return requisicaoAPI('/auth/perfil', {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }
};

// ========================================
// Notícias
// ========================================

const APINoticias = {
  async listar(opcoes = {}) {
    const params = new URLSearchParams();
    if (opcoes.categoria) params.append('categoria', opcoes.categoria);
    if (opcoes.destaque) params.append('destaque', '1');
    if (opcoes.limite) params.append('limite', opcoes.limite);
    if (opcoes.pagina) params.append('pagina', opcoes.pagina);

    const query = params.toString();
    return requisicaoAPI(`/noticias${query ? '?' + query : ''}`);
  },

  async obterDestaques() {
    return requisicaoAPI('/noticias/destaques');
  },

  async obterPorSlug(slug) {
    return requisicaoAPI(`/noticias/${slug}`);
  },

  async criar(dados) {
    return requisicaoAPI('/noticias', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  async atualizar(id, dados) {
    return requisicaoAPI(`/noticias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  },

  async excluir(id) {
    return requisicaoAPI(`/noticias/${id}`, {
      method: 'DELETE'
    });
  }
};

// ========================================
// Categorias
// ========================================

const APICategorias = {
  async listar() {
    return requisicaoAPI('/categorias');
  },

  async obterPorSlug(slug, opcoes = {}) {
    const params = new URLSearchParams();
    if (opcoes.limite) params.append('limite', opcoes.limite);
    if (opcoes.pagina) params.append('pagina', opcoes.pagina);

    const query = params.toString();
    return requisicaoAPI(`/categorias/${slug}${query ? '?' + query : ''}`);
  }
};

// ========================================
// Eventos
// ========================================

const APIEventos = {
  async listar(opcoes = {}) {
    const params = new URLSearchParams();
    if (opcoes.passados) params.append('passados', '1');
    if (opcoes.limite) params.append('limite', opcoes.limite);

    const query = params.toString();
    return requisicaoAPI(`/eventos${query ? '?' + query : ''}`);
  },

  async obterProximos() {
    return requisicaoAPI('/eventos/proximos');
  },

  async obterPorId(id) {
    return requisicaoAPI(`/eventos/${id}`);
  },

  async criar(dados) {
    return requisicaoAPI('/eventos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }
};

// ========================================
// Direitos
// ========================================

const APIDireitos = {
  async listar(categoria = null) {
    const params = categoria ? `?categoria=${categoria}` : '';
    return requisicaoAPI(`/direitos${params}`);
  },

  async obterPorId(id) {
    return requisicaoAPI(`/direitos/${id}`);
  },

  async obterTermoDoDia() {
    return requisicaoAPI('/direitos/dicionario/termo-do-dia');
  },

  async listarTermos() {
    return requisicaoAPI('/direitos/dicionario/termos');
  }
};

// ========================================
// Histórias
// ========================================

const APIHistorias = {
  async enviar(dados) {
    return requisicaoAPI('/historias', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  async listar() {
    return requisicaoAPI('/historias');
  }
};

// Exportar para uso global
window.API = {
  Autenticacao: APIAutenticacao,
  Noticias: APINoticias,
  Categorias: APICategorias,
  Eventos: APIEventos,
  Direitos: APIDireitos,
  Historias: APIHistorias
};
