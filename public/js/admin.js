/**
 * PAINEL DE ADMINISTRADOR
 * Gerencia notícias e histórias
 */

const PainelAdmin = (() => {
  // Estado
  let noticias = [];
  let historias = [];
  let categorias = [];
  let usuarios = [];
  let noticiaEditando = null;
  let historiaEditando = null;

  // Funções privadas
  async function carregarCategorias() {
    try {
      const dados = await requisicaoComFeedback('/api/categorias');
      categorias = dados.categorias || [];
      const categoriaSelect = document.getElementById('noticia-categoria');
      if (categoriaSelect) {
        categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>' + categorias.map(cat => `
          <option value="${cat.id}">${cat.nome}</option>
        `).join('');
      }
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    }
  }

  async function carregarNoticias() {
    try {
      const dados = await requisicaoComFeedback('/api/noticias');
      noticias = dados.noticias;
      renderizarNoticias();
    } catch (erro) {
      console.error('Erro ao carregar notícias:', erro);
    }
  }

  async function carregarHistorias() {
    try {
      const dados = await requisicaoComFeedback('/api/historias/admin/pendentes');
      historias = dados.historias;
      renderizarHistorias();
    } catch (erro) {
      console.error('Erro ao carregar histórias:', erro);
    }
  }

  function renderizarNoticias() {
    const tbody = document.getElementById('tbody-noticias');
    if (!tbody) return;

    tbody.innerHTML = noticias.map(noticia => `
      <tr class="tabela__row">
        <td class="tabela__cell">${noticia.titulo}</td>
        <td class="tabela__cell">${noticia.categoriaNome}</td>
        <td class="tabela__cell">
          <span class="badge badge--${noticia.publicado ? 'publicado' : 'pendente'}">
            ${noticia.publicado ? 'Publicada' : 'Rascunho'}
          </span>
        </td>
        <td class="tabela__cell tabela__celula-acao">
          <button class="botao botao--pequeno" onclick="PainelAdmin.editarNoticia(${noticia.id})">Editar</button>
          <button class="botao botao--pequeno botao--perigo" onclick="PainelAdmin.deletarNoticia(${noticia.id})">Deletar</button>
        </td>
      </tr>
    `).join('');
  }

  function renderizarHistorias() {
    const tbody = document.getElementById('tbody-historias');
    if (!tbody) return;

    tbody.innerHTML = historias.map(historia => {
      const status = historia.publicado ? 'Publicada' : historia.aprovado ? 'Aprovada' : 'Pendente';
      const badgeTipo = historia.publicado ? 'publicado' : historia.aprovado ? 'aprovado' : 'pendente';

      return `
        <tr class="tabela__row">
          <td class="tabela__cell">${historia.titulo}</td>
          <td class="tabela__cell">${historia.autorNome}</td>
          <td class="tabela__cell">${new Date(historia.dataCriacao).toLocaleDateString('pt-BR')}</td>
          <td class="tabela__cell">
            <span class="badge badge--${badgeTipo}">${status}</span>
          </td>
          <td class="tabela__cell tabela__celula-acao">
            <button class="botao botao--pequeno" onclick="PainelAdmin.visualizarHistoria(${historia.id})">Ler</button>
            <button class="botao botao--pequeno" onclick="PainelAdmin.editarHistoria(${historia.id})">Editar</button>
            ${!historia.publicado ? `
              <button class="botao botao--pequeno botao--sucesso" onclick="PainelAdmin.aprovarHistoria(${historia.id})">Aprovar</button>
              <button class="botao botao--pequeno botao--perigo" onclick="PainelAdmin.rejeitarHistoria(${historia.id})">Rejeitar</button>
            ` : ''}
            <button class="botao botao--pequeno botao--perigo" onclick="PainelAdmin.deletarHistoria(${historia.id})">Deletar</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderizarUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    if (!tbody) return;

    tbody.innerHTML = usuarios.map(usuario => `
      <tr class="tabela__row">
        <td class="tabela__cell">${usuario.nome}</td>
        <td class="tabela__cell">${usuario.email}</td>
        <td class="tabela__cell">${usuario.tipo}</td>
        <td class="tabela__cell tabela__celula-acao">
          <button class="botao botao--pequeno" onclick="PainelAdmin.alterarTipoUsuario(${usuario.id})">Alterar tipo</button>
        </td>
      </tr>
    `).join('');
  }

  async function carregarUsuarios() {
    try {
      const dados = await requisicaoComFeedback('/api/auth/usuarios/listar');
      usuarios = dados.usuarios || [];
      renderizarUsuarios();
    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);
    }
  }

  // Funções públicas
  return {
    inicializar: function() {
      // Adicionar listeners das abas
      const abaNoticiasBtn = document.getElementById('aba-noticias-admin');
      const abaHistoriasBtn = document.getElementById('aba-historias-admin');
      const abaUsuariosBtn = document.getElementById('aba-usuarios-admin');

      if (abaNoticiasBtn) {
        abaNoticiasBtn.addEventListener('click', () => {
          document.getElementById('tab-noticias-admin').classList.remove('oculto');
          document.getElementById('tab-historias-admin').classList.add('oculto');
          document.getElementById('tab-usuarios-admin').classList.add('oculto');
          
          abaNoticiasBtn.classList.add('aba-admin--ativa');
          abaHistoriasBtn.classList.remove('aba-admin--ativa');
          abaUsuariosBtn.classList.remove('aba-admin--ativa');
        });
      }

      if (abaHistoriasBtn) {
        abaHistoriasBtn.addEventListener('click', () => {
          document.getElementById('tab-noticias-admin').classList.add('oculto');
          document.getElementById('tab-historias-admin').classList.remove('oculto');
          document.getElementById('tab-usuarios-admin').classList.add('oculto');
          
          abaNoticiasBtn.classList.remove('aba-admin--ativa');
          abaHistoriasBtn.classList.add('aba-admin--ativa');
          abaUsuariosBtn.classList.remove('aba-admin--ativa');
        });
      }

      if (abaUsuariosBtn) {
        abaUsuariosBtn.addEventListener('click', () => {
          document.getElementById('tab-noticias-admin').classList.add('oculto');
          document.getElementById('tab-historias-admin').classList.add('oculto');
          document.getElementById('tab-usuarios-admin').classList.remove('oculto');
          
          abaNoticiasBtn.classList.remove('aba-admin--ativa');
          abaHistoriasBtn.classList.remove('aba-admin--ativa');
          abaUsuariosBtn.classList.add('aba-admin--ativa');
        });
      }

      // Adicionar listeners
      const btnNovaNoticia = document.getElementById('btn-nova-noticia');
      if (btnNovaNoticia) {
        btnNovaNoticia.addEventListener('click', () => PainelAdmin.abrirModalNoticia());
      }

      const btnFecharModal = document.getElementById('btn-fechar-modal-noticia');
      if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => {
          UI.fecharModal('modal-noticia');
          noticiaEditando = null;
        });
      }

      const formNoticia = document.getElementById('form-noticia');
      if (formNoticia) {
        formNoticia.addEventListener('submit', async (e) => {
          e.preventDefault();
          const titulo = document.getElementById('noticia-titulo')?.value.trim();
          const categoriaIdRaw = document.getElementById('noticia-categoria')?.value;
          const categoriaId = categoriaIdRaw ? Number(categoriaIdRaw) : null;
          const resumo = document.getElementById('noticia-resumo')?.value.trim();
          const conteudo = document.getElementById('noticia-conteudo')?.value.trim();
          const destaque = document.getElementById('noticia-destaque')?.checked;

          if (!titulo || !categoriaId || !resumo || !conteudo) {
            ToastManager.erro('Preencha todos os campos obrigatórios');
            return;
          }

          try {
            const payload = {
              titulo,
              resumo,
              conteudo,
              categoriaId,
              destaque: destaque ? 1 : 0
            };

            if (noticiaEditando) {
              await requisicaoComFeedback(`/api/noticias/${noticiaEditando}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
              });
            } else {
              await requisicaoComFeedback('/api/noticias', {
                method: 'POST',
                body: JSON.stringify(payload)
              });
            }

            noticiaEditando = null;
            UI.fecharModal('modal-noticia');
            carregarNoticias();
          } catch (erro) {
            console.error('Erro ao salvar notícia:', erro);
          }
        });
      }

      const btnFecharModalHistoria = document.getElementById('btn-fechar-modal-historia');
      if (btnFecharModalHistoria) {
        btnFecharModalHistoria.addEventListener('click', () => UI.fecharModal('modal-historia'));
      }

      const btnNovaHistoria = document.getElementById('btn-nova-historia');
      if (btnNovaHistoria) {
        btnNovaHistoria.addEventListener('click', () => PainelAdmin.abrirModalNovaHistoria());
      }

      const btnFecharModalHistoriaAdmin = document.getElementById('btn-fechar-modal-historia-admin');
      if (btnFecharModalHistoriaAdmin) {
        btnFecharModalHistoriaAdmin.addEventListener('click', () => {
          UI.fecharModal('modal-historia-admin');
          historiaEditando = null;
        });
      }

      const formHistoriaAdmin = document.getElementById('form-historia-admin');
      if (formHistoriaAdmin) {
        formHistoriaAdmin.addEventListener('submit', async (e) => {
          e.preventDefault();
          const titulo = document.getElementById('historia-admin-titulo')?.value.trim();
          const conteudo = document.getElementById('historia-admin-conteudo')?.value.trim();
          const nomeAutor = document.getElementById('historia-admin-nome')?.value.trim();
          const emailAutor = document.getElementById('historia-admin-email')?.value.trim();
          const cidade = document.getElementById('historia-admin-cidade')?.value.trim();
          const estado = document.getElementById('historia-admin-estado')?.value.trim();

          if (!titulo || !conteudo || !nomeAutor || !emailAutor) {
            ToastManager.erro('Preencha todos os campos obrigatórios.');
            return;
          }

          try {
            if (historiaEditando) {
              await requisicaoComFeedback(`/api/historias/${historiaEditando}`, {
                method: 'PUT',
                body: JSON.stringify({
                  titulo,
                  conteudo,
                  nomeAutor,
                  emailAutor,
                  cidade,
                  estado
                })
              });
            } else {
              await requisicaoComFeedback('/api/historias', {
                method: 'POST',
                body: JSON.stringify({
                  titulo,
                  conteudo,
                  nomeAutor,
                  emailAutor,
                  cidade,
                  estado
                })
              });
            }

            historiaEditando = null;
            UI.fecharModal('modal-historia-admin');
            carregarHistorias();
          } catch (erro) {
            console.error('Erro ao salvar história:', erro);
          }
        });
      }

      // Carregar dados
      carregarCategorias();
      carregarNoticias();
      carregarHistorias();
      carregarUsuarios();
    },

    abrirModalNoticia: function() {
      noticiaEditando = null;
      const tituloModal = document.querySelector('#modal-noticia .modal__titulo');
      if (tituloModal) tituloModal.textContent = 'Criar Notícia';
      UI.limparFormulario('form-noticia');
      const modalConteudo = document.querySelector('#modal-noticia .modal__conteudo');
      if (modalConteudo) {
        modalConteudo.scrollTop = 0;
      }
      UI.abrirModal('modal-noticia');
      setTimeout(() => {
        const tituloInput = document.getElementById('noticia-titulo');
        if (tituloInput) tituloInput.focus();
      }, 0);
    },

    editarNoticia: function(id) {
      const noticia = noticias.find(n => n.id === id);
      if (!noticia) return;

      noticiaEditando = id;
      const tituloModal = document.querySelector('#modal-noticia .modal__titulo');
      if (tituloModal) tituloModal.textContent = 'Editar Notícia';

      const tituloInput = document.getElementById('noticia-titulo');
      const categoriaSelect = document.getElementById('noticia-categoria');
      const resumoTextarea = document.getElementById('noticia-resumo');
      const conteudoTextarea = document.getElementById('noticia-conteudo');
      const destaqueCheckbox = document.getElementById('noticia-destaque');

      if (tituloInput) tituloInput.value = noticia.titulo || '';
      if (categoriaSelect) categoriaSelect.value = noticia.categoriaId || '';
      if (resumoTextarea) resumoTextarea.value = noticia.resumo || '';
      if (conteudoTextarea) conteudoTextarea.value = noticia.conteudo || '';
      if (destaqueCheckbox) destaqueCheckbox.checked = noticia.destaque || false;

      const modalConteudo = document.querySelector('#modal-noticia .modal__conteudo');
      if (modalConteudo) {
        modalConteudo.scrollTop = 0;
      }
      UI.abrirModal('modal-noticia');
      setTimeout(() => {
        if (tituloInput) tituloInput.focus();
      }, 0);
    },

    async deletarNoticia(id) {
      if (!confirm('Tem certeza que deseja deletar esta notícia?')) return;

      try {
        await requisicaoComFeedback(`/api/noticias/${id}`, {
          method: 'DELETE'
        });
        noticias = noticias.filter(n => n.id !== id);
        renderizarNoticias();
      } catch (erro) {
        console.error('Erro ao deletar:', erro);
      }
    },

    visualizarHistoria: function(id) {
      const historia = historias.find(h => h.id === id);
      if (!historia) return;

      const modalConteudo = document.getElementById('modal-historia-conteudo');
      if (modalConteudo) {
        modalConteudo.innerHTML = `
          <h3>${historia.titulo}</h3>
          <p><strong>Por:</strong> ${historia.autorNome}</p>
          <p><strong>Email:</strong> ${historia.autorEmail || 'Não informado'}</p>
          <p><strong>Data:</strong> ${new Date(historia.dataCriacao).toLocaleDateString('pt-BR')}</p>
          <hr>
          <article>${historia.conteudo}</article>
        `;
      }

      UI.abrirModal('modal-historia');
    },

    abrirModalNovaHistoria: function() {
      historiaEditando = null;
      const tituloModal = document.querySelector('#modal-historia-admin .modal__titulo');
      if (tituloModal) tituloModal.textContent = 'Nova História';
      UI.limparFormulario('form-historia-admin');
      UI.abrirModal('modal-historia-admin');
    },

    editarHistoria: function(id) {
      const historia = historias.find(h => h.id === id);
      if (!historia) return;

      historiaEditando = id;
      const tituloModal = document.querySelector('#modal-historia-admin .modal__titulo');
      if (tituloModal) tituloModal.textContent = 'Editar História';

      const tituloInput = document.getElementById('historia-admin-titulo');
      const conteudoTextarea = document.getElementById('historia-admin-conteudo');
      const nomeInput = document.getElementById('historia-admin-nome');
      const emailInput = document.getElementById('historia-admin-email');
      const cidadeInput = document.getElementById('historia-admin-cidade');
      const estadoInput = document.getElementById('historia-admin-estado');

      if (tituloInput) tituloInput.value = historia.titulo || '';
      if (conteudoTextarea) conteudoTextarea.value = historia.conteudo || '';
      if (nomeInput) nomeInput.value = historia.autorNome || '';
      if (emailInput) emailInput.value = historia.autorEmail || '';
      if (cidadeInput) cidadeInput.value = historia.cidade || '';
      if (estadoInput) estadoInput.value = historia.estado || '';

      UI.abrirModal('modal-historia-admin');
    },

    async alterarTipoUsuario(id) {
      const usuario = usuarios.find(u => u.id === id);
      if (!usuario) return;
      const novoTipo = usuario.tipo === 'leitor' ? 'autor' : usuario.tipo === 'autor' ? 'admin' : 'leitor';

      try {
        await requisicaoComFeedback(`/api/auth/usuarios/${id}/tipo`, {
          method: 'PUT',
          body: JSON.stringify({ tipo: novoTipo })
        });
        carregarUsuarios();
      } catch (erro) {
        console.error('Erro ao alterar tipo de usuário:', erro);
      }
    },

    async aprovarHistoria(id) {
      try {
        await requisicaoComFeedback(`/api/historias/${id}/aprovar`, {
          method: 'PUT'
        });
        await carregarHistorias();
      } catch (erro) {
        console.error('Erro ao aprovar:', erro);
      }
    },

    async rejeitarHistoria(id) {
      if (!confirm('Tem certeza que deseja rejeitar esta história?')) return;

      try {
        await requisicaoComFeedback(`/api/historias/${id}/rejeitar`, {
          method: 'PUT'
        });
        await carregarHistorias();
      } catch (erro) {
        console.error('Erro ao rejeitar:', erro);
      }
    },

    async deletarHistoria(id) {
      if (!confirm('Tem certeza que deseja deletar esta história?')) return;

      try {
        await requisicaoComFeedback(`/api/historias/${id}`, {
          method: 'DELETE'
        });
        historias = historias.filter(h => h.id !== id);
        renderizarHistorias();
      } catch (erro) {
        console.error('Erro ao deletar:', erro);
      }
    }
  };
})();

// Expor globalmente para uso
window.PainelAdmin = PainelAdmin;
