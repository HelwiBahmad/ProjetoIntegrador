/**
 * SISTEMA DE TOASTS E FEEDBACK
 * Gerencia notificações de sucesso, erro, aviso e carregamento
 */

const ToastManager = (() => {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);

  const toasts = new Map();
  let toastIdCounter = 0;

  function criar(mensagem, tipo = 'sucesso', duracao = 3000) {
    const id = ++toastIdCounter;
    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    toast.id = `toast-${id}`;

    const icones = {
      sucesso: '✓',
      erro: '✕',
      aviso: '⚠',
      carregando: '⏳'
    };

    toast.innerHTML = `
      <span class="toast__icone">${icones[tipo] || icones.sucesso}</span>
      <span class="toast__texto">${mensagem}</span>
      <button class="toast__fechar" aria-label="Fechar">&times;</button>
    `;

    const btnFechar = toast.querySelector('.toast__fechar');
    btnFechar.addEventListener('click', () => remover(id));

    container.appendChild(toast);
    toasts.set(id, toast);

    if (tipo !== 'carregando' && duracao > 0) {
      setTimeout(() => remover(id), duracao);
    }

    return id;
  }

  function remover(id) {
    const toast = toasts.get(id);
    if (!toast) return;

    toast.classList.add('toast--saindo');
    setTimeout(() => {
      toast.remove();
      toasts.delete(id);
    }, 300);
  }

  return {
    sucesso: (msg, duracao = 3000) => criar(msg, 'sucesso', duracao),
    erro: (msg, duracao = 3000) => criar(msg, 'erro', duracao),
    aviso: (msg, duracao = 3000) => criar(msg, 'aviso', duracao),
    carregando: (msg) => criar(msg, 'carregando', 0),
    remover
  };
})();

/**
 * VALIDAÇÕES DE FORMULÁRIO
 */
const Validador = {
  email: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  senha: (senha) => {
    return senha.length >= 6;
  },

  stringNaoVazia: (str) => {
    return str.trim().length > 0;
  },

  comprименtoMinimo: (str, minimo) => {
    return str.trim().length >= minimo;
  },

  emails: (email1, email2) => {
    return email1 === email2 && this.email(email1);
  },

  senhas: (senha1, senha2) => {
    return senha1 === senha2 && this.senha(senha1);
  }
};

/**
 * FUNÇÕES AUXILIARES DE UI
 */
const UI = {
  mostrarSpinner: () => {
    const spinner = document.getElementById('spinner-global');
    if (spinner) spinner.classList.remove('oculto');
  },

  ocultarSpinner: () => {
    const spinner = document.getElementById('spinner-global');
    if (spinner) spinner.classList.add('oculto');
  },

  abrirModal: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('modal--aberto');
  },

  fecharModal: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('modal--aberto');
  },

  limparFormulario: (formId) => {
    const form = document.getElementById(formId);
    if (form) form.reset();
  }
};

/**
 * REQUISIÇÕES COM FEEDBACK
 */
async function requisicaoComFeedback(endpoint, opcoes = {}) {
  let toastId;

  try {
    // Mostrar carregamento
    if (!opcoes.silencioso) {
      toastId = ToastManager.carregando('Processando...');
    }

    const resposta = await fetch(endpoint, {
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

    // Toast de sucesso
    if (!opcoes.silencioso) {
      ToastManager.remover(toastId);
      ToastManager.sucesso(dados.mensagem || 'Operação realizada com sucesso!');
    }

    return dados;
  } catch (erro) {
    if (toastId) ToastManager.remover(toastId);
    ToastManager.erro(erro.message);
    throw erro;
  }
}

// Expor globalmente
window.ToastManager = ToastManager;
window.Validador = Validador;
window.UI = UI;
window.requisicaoComFeedback = requisicaoComFeedback;
