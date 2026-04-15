/**
 * COMUNIDADE EM SINAIS - APP PRINCIPAL
 * Lógica de interface e interação
 */

// ========================================
// Estado da Aplicação
// ========================================

const Estado = {
  usuarioLogado: null,
  paginaAtual: 'inicio',
  destaques: [],
  destaqueAtual: 0,
  intervaloCarrossel: null
};

// ========================================
// Utilitários
// ========================================

function $(seletor) {
  return document.querySelector(seletor);
}

function $$(seletor) {
  return document.querySelectorAll(seletor);
}

function formatarData(dataStr) {
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function formatarDataCurta(dataStr) {
  const data = new Date(dataStr);
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return {
    dia: data.getDate().toString().padStart(2, '0'),
    mes: meses[data.getMonth()]
  };
}

function criarElemento(tag, classes = '', conteudo = '') {
  const elemento = document.createElement(tag);
  if (classes) elemento.className = classes;
  if (conteudo) elemento.innerHTML = conteudo;
  return elemento;
}

// ========================================
// Alto Contraste
// ========================================

function inicializarContraste() {
  const contraste = localStorage.getItem('altoContraste') === 'true';
  if (contraste) {
    document.body.classList.add('alto-contraste');
  }

  $('#btn-contraste').addEventListener('click', () => {
    document.body.classList.toggle('alto-contraste');
    localStorage.setItem('altoContraste', document.body.classList.contains('alto-contraste'));
  });
}

// ========================================
// Menu Mobile
// ========================================

function inicializarMenuMobile() {
  $('#btn-menu').addEventListener('click', () => {
    $('#menu-mobile').classList.add('menu-mobile--aberto');
  });

  $('#btn-fechar-menu').addEventListener('click', () => {
    $('#menu-mobile').classList.remove('menu-mobile--aberto');
  });

  // Fechar ao clicar em link
  $$('.menu-mobile__link').forEach(link => {
    link.addEventListener('click', () => {
      $('#menu-mobile').classList.remove('menu-mobile--aberto');
    });
  });
}

// ========================================
// Navegação SPA
// ========================================

function inicializarNavegacao() {
  // Links do cabeçalho
  $$('[data-pagina]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pagina = link.dataset.pagina;
      navegarPara(pagina);
    });
  });

  // Histórico do navegador
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.pagina) {
      navegarPara(e.state.pagina, false);
    }
  });

  // URL inicial
  const hash = window.location.hash.slice(1);
  if (hash) {
    navegarPara(hash, false);
  }
}

function navegarPara(pagina, adicionarHistorico = true) {
  // Esconder todas as páginas
  $$('[id^="pagina-"]').forEach(p => p.classList.add('oculto'));

  // Mostrar página atual
  const paginaElemento = $(`#pagina-${pagina}`);
  if (paginaElemento) {
    paginaElemento.classList.remove('oculto');
  } else {
    $('#pagina-inicio').classList.remove('oculto');
    pagina = 'inicio';
  }

  // Atualizar estado
  Estado.paginaAtual = pagina;

  // Atualizar links ativos
  $$('.cabecalho__nav-link').forEach(link => {
    link.classList.toggle('cabecalho__nav-link--ativo', link.dataset.pagina === pagina);
  });

  // Atualizar histórico
  if (adicionarHistorico) {
    history.pushState({ pagina }, '', `#${pagina}`);
  }

  // Carregar dados da página
  carregarDadosPagina(pagina);

  // Scroll para o topo
  window.scrollTo(0, 0);
}

async function carregarDadosPagina(pagina) {
  switch (pagina) {
    case 'inicio':
      await carregarInicio();
      break;
    case 'noticias':
      await carregarTodasNoticias();
      break;
    case 'eventos':
      await carregarTodosEventos();
      break;
    case 'direitos':
      await carregarDireitos();
      break;
  }
}

// ========================================
// Página Inicial
// ========================================

async function carregarInicio() {
  await Promise.all([
    carregarDestaques(),
    carregarCategorias(),
    carregarNoticiasRecentes(),
    carregarTermoDoDia(),
    carregarEventosSidebar()
  ]);
}

async function carregarDestaques() {
  try {
    const { noticias } = await window.API.Noticias.obterDestaques();
    Estado.destaques = noticias;

    if (noticias.length > 0) {
      atualizarDestaque(0);
      criarControlesCarrossel(noticias.length);
      iniciarCarrosselAutomatico();
    }
  } catch (erro) {
    console.error('Erro ao carregar destaques:', erro);
  }
}

function atualizarDestaque(index) {
  const noticia = Estado.destaques[index];
  if (!noticia) return;

  Estado.destaqueAtual = index;

  $('#destaque-categoria').textContent = noticia.categoriaNome;
  $('#destaque-categoria').style.background = noticia.categoriaCor || 'var(--cor-primaria)';
  $('#destaque-categoria').style.color = 'white';
  $('#destaque-titulo').textContent = noticia.titulo;
  $('#destaque-resumo').textContent = noticia.resumo;
  $('#destaque-link').href = `#noticia/${noticia.slug}`;
  $('#destaque-link').onclick = (e) => {
    e.preventDefault();
    abrirNoticia(noticia.slug);
  };

  // Atualizar pontos
  $$('.carrossel__ponto').forEach((ponto, i) => {
    ponto.classList.toggle('carrossel__ponto--ativo', i === index);
  });
}

function criarControlesCarrossel(total) {
  const container = $('#carrossel-controles');
  container.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const ponto = criarElemento('button', `carrossel__ponto ${i === 0 ? 'carrossel__ponto--ativo' : ''}`);
    ponto.setAttribute('aria-label', `Ir para notícia ${i + 1}`);
    ponto.addEventListener('click', () => {
      atualizarDestaque(i);
      reiniciarCarrossel();
    });
    container.appendChild(ponto);
  }
}

function iniciarCarrosselAutomatico() {
  if (Estado.intervaloCarrossel) {
    clearInterval(Estado.intervaloCarrossel);
  }

  Estado.intervaloCarrossel = setInterval(() => {
    const proximo = (Estado.destaqueAtual + 1) % Estado.destaques.length;
    atualizarDestaque(proximo);
  }, 5000);
}

function reiniciarCarrossel() {
  iniciarCarrosselAutomatico();
}

async function carregarCategorias() {
  try {
    const { categorias } = await window.API.Categorias.listar();
    const container = $('#lista-categorias');
    
    container.innerHTML = categorias.map(cat => `
      <a href="#categoria/${cat.slug}" class="card-categoria" onclick="event.preventDefault(); abrirCategoria('${cat.slug}');">
        <div class="card-categoria__icone" style="background: ${cat.cor}20; color: ${cat.cor};">
          <i data-lucide="${obterIconeCategoria(cat.icone)}"></i>
        </div>
        <h3 class="card-categoria__nome">${cat.nome}</h3>
        <p class="card-categoria__total">${cat.totalNoticias} notícias</p>
      </a>
    `).join('');

    lucide.createIcons();
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro);
    $('#lista-categorias').innerHTML = '<p class="vazio">Erro ao carregar categorias</p>';
  }
}

function obterIconeCategoria(icone) {
  const icones = {
    'scale': 'scale',
    'graduation-cap': 'graduation-cap',
    'palette': 'palette',
    'smartphone': 'smartphone',
    'heart-pulse': 'heart-pulse',
    'briefcase': 'briefcase',
    'users': 'users'
  };
  return icones[icone] || 'folder';
}

async function carregarNoticiasRecentes() {
  try {
    const { noticias } = await window.API.Noticias.listar({ limite: 6 });
    const container = $('#lista-noticias');
    
    container.innerHTML = noticias.map(noticia => criarCardNoticia(noticia)).join('');
    lucide.createIcons();
  } catch (erro) {
    console.error('Erro ao carregar notícias:', erro);
    $('#lista-noticias').innerHTML = '<p class="vazio">Erro ao carregar notícias</p>';
  }
}

function criarCardNoticia(noticia) {
  return `
    <article class="card-noticia">
      <div class="card-noticia__imagem" style="background: linear-gradient(135deg, ${noticia.categoriaCor || '#0EA5E9'}40, ${noticia.categoriaCor || '#0EA5E9'}20); display: flex; align-items: center; justify-content: center;">
        <i data-lucide="newspaper" style="width: 48px; height: 48px; color: ${noticia.categoriaCor || '#0EA5E9'};"></i>
      </div>
      <div class="card-noticia__conteudo">
        <span class="card-noticia__categoria" style="background: ${noticia.categoriaCor || '#0EA5E9'}20; color: ${noticia.categoriaCor || '#0EA5E9'};">
          ${noticia.categoriaNome}
        </span>
        <a href="#noticia/${noticia.slug}" class="card-noticia__titulo" onclick="event.preventDefault(); abrirNoticia('${noticia.slug}');">
          ${noticia.titulo}
        </a>
        <p class="card-noticia__resumo">${noticia.resumo}</p>
        <div class="card-noticia__meta">
          <span><i data-lucide="user" style="width: 14px; height: 14px;"></i> ${noticia.autorNome}</span>
          <span><i data-lucide="calendar" style="width: 14px; height: 14px;"></i> ${formatarData(noticia.dataCriacao)}</span>
        </div>
      </div>
    </article>
  `;
}

async function carregarTermoDoDia() {
  try {
    const { termo } = await window.API.Direitos.obterTermoDoDia();
    
    if (termo) {
      $('#termo-palavra').textContent = termo.termo;
      $('#termo-definicao').textContent = termo.definicao;
    } else {
      $('#widget-termo').classList.add('oculto');
    }
  } catch (erro) {
    console.error('Erro ao carregar termo do dia:', erro);
  }
}

async function carregarEventosSidebar() {
  try {
    const { eventos } = await window.API.Eventos.obterProximos();
    const container = $('#lista-eventos-sidebar');
    
    if (eventos.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhum evento próximo</p>';
      return;
    }

    container.innerHTML = eventos.slice(0, 3).map(evento => {
      const { dia, mes } = formatarDataCurta(evento.dataEvento);
      return `
        <div class="card-evento" style="margin-bottom: var(--espacamento-md);">
          <div class="card-evento__data">
            <div class="card-evento__dia">${dia}</div>
            <div class="card-evento__mes">${mes}</div>
          </div>
          <div class="card-evento__info">
            <h4 class="card-evento__titulo">${evento.titulo}</h4>
            <p class="card-evento__local">
              <i data-lucide="${evento.online ? 'video' : 'map-pin'}" style="width: 14px; height: 14px;"></i>
              ${evento.online ? 'Online' : evento.local || 'Local a definir'}
            </p>
            <div class="card-evento__tags">
              ${evento.interpreteLibras ? '<span class="card-evento__tag">Libras</span>' : ''}
              ${evento.gratuito ? '<span class="card-evento__tag card-evento__tag--gratuito">Gratuito</span>' : ''}
              ${evento.online ? '<span class="card-evento__tag card-evento__tag--online">Online</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  } catch (erro) {
    console.error('Erro ao carregar eventos:', erro);
    $('#lista-eventos-sidebar').innerHTML = '<p class="vazio">Erro ao carregar eventos</p>';
  }
}

// ========================================
// Página de Notícias
// ========================================

async function carregarTodasNoticias(categoria = '') {
  try {
    const container = $('#todas-noticias');
    container.innerHTML = '<div class="carregando"><div class="spinner"></div></div>';

    const { noticias } = await window.API.Noticias.listar({ categoria, limite: 20 });

    if (noticias.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhuma notícia encontrada</p>';
      return;
    }

    container.innerHTML = noticias.map(noticia => criarCardNoticia(noticia)).join('');
    lucide.createIcons();

    // Carregar categorias no filtro
    await carregarFiltroCategorias();
  } catch (erro) {
    console.error('Erro ao carregar notícias:', erro);
    $('#todas-noticias').innerHTML = '<p class="vazio">Erro ao carregar notícias</p>';
  }
}

async function carregarFiltroCategorias() {
  try {
    const { categorias } = await window.API.Categorias.listar();
    const select = $('#filtro-categoria');
    
    select.innerHTML = '<option value="">Todas as categorias</option>' +
      categorias.map(cat => `<option value="${cat.slug}">${cat.nome}</option>`).join('');

    select.addEventListener('change', () => {
      carregarTodasNoticias(select.value);
    });
  } catch (erro) {
    console.error('Erro ao carregar filtro:', erro);
  }
}

// ========================================
// Notícia Individual
// ========================================

async function abrirNoticia(slug) {
  // Esconder todas as páginas
  $$('[id^="pagina-"]').forEach(p => p.classList.add('oculto'));
  $('#pagina-noticia').classList.remove('oculto');

  const container = $('#noticia-conteudo');
  container.innerHTML = '<div class="carregando"><div class="spinner"></div></div>';

  try {
    const { noticia, relacionadas } = await window.API.Noticias.obterPorSlug(slug);

    container.innerHTML = `
      <a href="#noticias" class="noticia-completa__voltar" onclick="event.preventDefault(); navegarPara('noticias');">
        <i data-lucide="arrow-left"></i>
        Voltar para notícias
      </a>
      
      <span class="noticia-completa__categoria" style="background: ${noticia.categoriaCor || 'var(--cor-primaria)'};">
        ${noticia.categoriaNome}
      </span>
      
      <h1 class="noticia-completa__titulo">${noticia.titulo}</h1>
      
      <div class="noticia-completa__meta">
        <span><i data-lucide="user" style="width: 16px; height: 16px;"></i> ${noticia.autorNome}</span>
        <span><i data-lucide="calendar" style="width: 16px; height: 16px;"></i> ${formatarData(noticia.dataCriacao)}</span>
        <span><i data-lucide="eye" style="width: 16px; height: 16px;"></i> ${noticia.visualizacoes} visualizações</span>
      </div>

      <div class="noticia-completa__conteudo">
        ${noticia.conteudo}
      </div>

      ${relacionadas.length > 0 ? `
        <div style="margin-top: var(--espacamento-2xl); padding-top: var(--espacamento-xl); border-top: 1px solid var(--cor-borda);">
          <h2 class="secao__titulo">Notícias Relacionadas</h2>
          <div class="grid-cards grid-cards--3">
            ${relacionadas.map(n => criarCardNoticia(n)).join('')}
          </div>
        </div>
      ` : ''}
    `;

    lucide.createIcons();
    history.pushState({ pagina: 'noticia', slug }, '', `#noticia/${slug}`);
  } catch (erro) {
    console.error('Erro ao carregar notícia:', erro);
    container.innerHTML = '<p class="vazio">Notícia não encontrada</p>';
  }
}

// ========================================
// Categoria
// ========================================

async function abrirCategoria(slug) {
  $$('[id^="pagina-"]').forEach(p => p.classList.add('oculto'));
  $('#pagina-categoria').classList.remove('oculto');

  const container = $('#categoria-noticias');
  container.innerHTML = '<div class="carregando"><div class="spinner"></div></div>';

  try {
    const { categoria, noticias } = await window.API.Categorias.obterPorSlug(slug);

    $('#categoria-titulo').innerHTML = `
      <i data-lucide="${obterIconeCategoria(categoria.icone)}" class="secao__titulo-icone" style="color: ${categoria.cor};"></i>
      ${categoria.nome}
    `;
    $('#categoria-descricao').textContent = categoria.descricao;

    if (noticias.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhuma notícia nesta categoria</p>';
    } else {
      container.innerHTML = noticias.map(n => criarCardNoticia({
        ...n,
        categoriaNome: categoria.nome,
        categoriaCor: categoria.cor
      })).join('');
    }

    lucide.createIcons();
    history.pushState({ pagina: 'categoria', slug }, '', `#categoria/${slug}`);
  } catch (erro) {
    console.error('Erro ao carregar categoria:', erro);
    container.innerHTML = '<p class="vazio">Categoria não encontrada</p>';
  }
}

// ========================================
// Eventos
// ========================================

async function carregarTodosEventos() {
  try {
    const container = $('#todos-eventos');
    container.innerHTML = '<div class="carregando"><div class="spinner"></div></div>';

    const { eventos } = await window.API.Eventos.listar({ limite: 20 });

    if (eventos.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhum evento programado</p>';
      return;
    }

    container.innerHTML = eventos.map(evento => {
      const { dia, mes } = formatarDataCurta(evento.dataEvento);
      return `
        <div class="card-evento">
          <div class="card-evento__data">
            <div class="card-evento__dia">${dia}</div>
            <div class="card-evento__mes">${mes}</div>
          </div>
          <div class="card-evento__info">
            <h3 class="card-evento__titulo">${evento.titulo}</h3>
            <p style="font-size: 0.875rem; color: var(--cor-texto-secundario); margin-bottom: var(--espacamento-sm);">
              ${evento.descricao}
            </p>
            <p class="card-evento__local">
              <i data-lucide="${evento.online ? 'video' : 'map-pin'}" style="width: 14px; height: 14px;"></i>
              ${evento.online ? 'Online' : evento.local || 'Local a definir'}
              ${evento.horaInicio ? ` - ${evento.horaInicio}` : ''}
            </p>
            <div class="card-evento__tags">
              ${evento.interpreteLibras ? '<span class="card-evento__tag">Intérprete de Libras</span>' : ''}
              ${evento.gratuito ? '<span class="card-evento__tag card-evento__tag--gratuito">Gratuito</span>' : `<span class="card-evento__tag">R$ ${evento.preco?.toFixed(2)}</span>`}
              ${evento.online ? '<span class="card-evento__tag card-evento__tag--online">Online</span>' : ''}
            </div>
            ${evento.linkOnline ? `<a href="${evento.linkOnline}" target="_blank" class="botao botao--outline botao--pequeno" style="margin-top: var(--espacamento-sm);">Acessar evento</a>` : ''}
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  } catch (erro) {
    console.error('Erro ao carregar eventos:', erro);
    $('#todos-eventos').innerHTML = '<p class="vazio">Erro ao carregar eventos</p>';
  }
}

// ========================================
// Direitos
// ========================================

async function carregarDireitos() {
  try {
    const container = $('#lista-direitos');
    container.innerHTML = '<div class="carregando"><div class="spinner"></div></div>';

    const { direitos } = await window.API.Direitos.listar();

    if (direitos.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhum direito cadastrado</p>';
      return;
    }

    container.innerHTML = direitos.map(direito => `
      <div class="card-direito">
        <p class="card-direito__numero">${direito.numeroLei || 'Lei Federal'}</p>
        <h3 class="card-direito__titulo">${direito.titulo}</h3>
        <p class="card-direito__descricao">${direito.descricao}</p>
        ${direito.linkOficial ? `
          <a href="${direito.linkOficial}" target="_blank" class="card-direito__link">
            Ver texto oficial <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
          </a>
        ` : ''}
      </div>
    `).join('');

    lucide.createIcons();
  } catch (erro) {
    console.error('Erro ao carregar direitos:', erro);
    $('#lista-direitos').innerHTML = '<p class="vazio">Erro ao carregar direitos</p>';
  }
}

// ========================================
// Autenticação
// ========================================

function inicializarAutenticacao() {
  // Botão de entrar
  const btnEntrar = $('#btn-entrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', () => {
      const modal = $('#modal-auth');
      if (modal) {
        modal.classList.add('modal-overlay--aberto');
        document.body.classList.add('modal-aberto');
      }
    });
  }

  // Fechar modal
  const btnFechar = $('#modal-fechar');
  if (btnFechar) {
    btnFechar.addEventListener('click', () => {
      const modal = $('#modal-auth');
      if (modal) {
        modal.classList.remove('modal-overlay--aberto');
        document.body.classList.remove('modal-aberto');
      }
    });
  }

  // Fechar ao clicar fora
  const modalAuth = $('#modal-auth');
  if (modalAuth) {
    modalAuth.addEventListener('click', (e) => {
      if (e.target === modalAuth) {
        modalAuth.classList.remove('modal-overlay--aberto');
        document.body.classList.remove('modal-aberto');
      }
    });
  }

  // Tabs
  const tabLogin = $('#tab-login');
  const tabCadastro = $('#tab-cadastro');
  const formLogin = $('#form-login');
  const formCadastro = $('#form-cadastro');
  const modalTitulo = $('#modal-titulo');

  if (tabLogin) {
    tabLogin.addEventListener('click', () => {
      if (tabLogin) tabLogin.classList.add('modal__tab--ativo');
      if (tabCadastro) tabCadastro.classList.remove('modal__tab--ativo');
      if (formLogin) formLogin.classList.remove('oculto');
      if (formCadastro) formCadastro.classList.add('oculto');
      if (modalTitulo) modalTitulo.textContent = 'Entrar';
    });
  }

  if (tabCadastro) {
    tabCadastro.addEventListener('click', () => {
      if (tabCadastro) tabCadastro.classList.add('modal__tab--ativo');
      if (tabLogin) tabLogin.classList.remove('modal__tab--ativo');
      if (formCadastro) formCadastro.classList.remove('oculto');
      if (formLogin) formLogin.classList.add('oculto');
      if (modalTitulo) modalTitulo.textContent = 'Criar Conta';
    });
  }

  // Formulário de login
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#login-email')?.value;
      const senha = $('#login-senha')?.value;
      const erroEl = $('#login-erro');

      if (erroEl) erroEl.classList.add('oculto');

      try {
        const { usuario } = await window.API.Autenticacao.login(email, senha);
        Estado.usuarioLogado = usuario;
        atualizarUIUsuario();
        if (modalAuth) {
          modalAuth.classList.remove('modal-overlay--aberto');
          document.body.classList.remove('modal-aberto');
        }
        if (formLogin) formLogin.reset();
      } catch (erro) {
        if (erroEl) {
          erroEl.textContent = erro.message;
          erroEl.classList.remove('oculto');
        }
      }
    });
  }

  // Formulário de cadastro
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = $('#cadastro-nome')?.value;
      const email = $('#cadastro-email')?.value;
      const senha = $('#cadastro-senha')?.value;
      const confirmar = $('#cadastro-confirmar')?.value;
      const erroEl = $('#cadastro-erro');

      if (erroEl) erroEl.classList.add('oculto');

      if (senha !== confirmar) {
        if (erroEl) {
          erroEl.textContent = 'As senhas não coincidem';
          erroEl.classList.remove('oculto');
        }
        return;
      }

      try {
        const { usuario } = await window.API.Autenticacao.cadastro(nome, email, senha, confirmar);
        Estado.usuarioLogado = usuario;
        atualizarUIUsuario();
        if (modalAuth) {
          modalAuth.classList.remove('modal-overlay--aberto');
          document.body.classList.remove('modal-aberto');
        }
        if (formCadastro) formCadastro.reset();
      } catch (erro) {
        if (erroEl) {
          erroEl.textContent = erro.message;
          erroEl.classList.remove('oculto');
        }
      }
    });
  }

  // Dropdown do usuário
  const btnUsuario = $('#btn-usuario');
  const dropdownUsuario = $('#dropdown-usuario');
  
  if (btnUsuario) {
    btnUsuario.addEventListener('click', () => {
      if (dropdownUsuario) dropdownUsuario.classList.toggle('dropdown-usuario__menu--aberto');
    });
  }

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    if (dropdownUsuario && !e.target.closest('.dropdown-usuario')) {
      dropdownUsuario.classList.remove('dropdown-usuario__menu--aberto');
    }
  });

  // Logout
  const btnSair = $('#btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', async () => {
      try {
        await window.API.Autenticacao.logout();
        Estado.usuarioLogado = null;
        atualizarUIUsuario();
      } catch (erro) {
        console.error('Erro ao sair:', erro);
      }
    });
  }

  // Verificar se já está logado
  setTimeout(() => {
    verificarSessao();
  }, 100);
}

async function verificarSessao() {
  try {
    // Aguardar que window.API esteja disponível
    let tentativas = 0;
    while (!window.API && tentativas < 50) {
      await new Promise(resolve => setTimeout(resolve, 10));
      tentativas++;
    }

    if (window.API && window.API.Autenticacao) {
      const { usuario } = await window.API.Autenticacao.obterUsuario();
      Estado.usuarioLogado = usuario;
      atualizarUIUsuario();
    }
  } catch (erro) {
    // Não logado - isso é esperado
    Estado.usuarioLogado = null;
    atualizarUIUsuario();
  }
}

function atualizarUIUsuario() {
  if (Estado.usuarioLogado) {
    $('#area-nao-logado').classList.add('oculto');
    $('#area-logado').classList.remove('oculto');
    $('#usuario-nome').textContent = Estado.usuarioLogado.nome;
    $('#usuario-avatar').textContent = Estado.usuarioLogado.nome.charAt(0).toUpperCase();

    // Mostrar painel de admin se o usuário for admin
    if (Estado.usuarioLogado.tipo === 'admin') {
      const painelAdmin = $('#admin-painel');
      if (painelAdmin) {
        painelAdmin.classList.remove('oculto');
      }
      // Inicializar painel admin
      if (typeof PainelAdmin !== 'undefined') {
        PainelAdmin.inicializar();
      }
    } else {
      const painelAdmin = $('#admin-painel');
      if (painelAdmin) {
        painelAdmin.classList.add('oculto');
      }
    }

    // Preencher dados no formulário de história se logado
    if ($('#historia-nome')) {
      $('#historia-nome').value = Estado.usuarioLogado.nome;
      $('#historia-email').value = Estado.usuarioLogado.email;
    }
  } else {
    $('#area-nao-logado').classList.remove('oculto');
    $('#area-logado').classList.add('oculto');
    const painelAdmin = $('#admin-painel');
    if (painelAdmin) {
      painelAdmin.classList.add('oculto');
    }
  }
}

// ========================================
// Formulário de História
// ========================================

function inicializarFormularioHistoria() {
  const formHistoria = $('#form-historia');
  if (!formHistoria) return; // Elemento não existe

  formHistoria.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
      titulo: $('#historia-titulo')?.value,
      conteudo: $('#historia-conteudo')?.value,
      nomeAutor: $('#historia-nome')?.value,
      emailAutor: $('#historia-email')?.value,
      cidade: $('#historia-cidade')?.value,
      estado: $('#historia-estado')?.value,
      usuarioId: Estado.usuarioLogado?.id || null
    };

    const mensagemEl = $('#historia-mensagem');

    try {
      await window.API.Historias.enviar(dados);
      if (mensagemEl) {
        mensagemEl.className = 'formulario__sucesso';
        mensagemEl.textContent = 'Sua história foi enviada com sucesso! Ela será analisada pela nossa equipe antes de ser publicada.';
      }
      formHistoria.reset();
    } catch (erro) {
      if (mensagemEl) {
        mensagemEl.className = 'formulario__erro';
        mensagemEl.textContent = erro.message;
      }
    }
  });
}

// ========================================
// Inicialização
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar ícones
  if (typeof lucide !== 'undefined') {
    try {
      lucide.createIcons();
    } catch (erro) {
      console.warn('Erro ao inicializar ícones Lucide:', erro);
    }
  }

  // Inicializar funcionalidades
  try {
    inicializarContraste();
  } catch (erro) {
    console.error('Erro ao inicializar contraste:', erro);
  }

  try {
    inicializarMenuMobile();
  } catch (erro) {
    console.error('Erro ao inicializar menu mobile:', erro);
  }

  try {
    inicializarNavegacao();
  } catch (erro) {
    console.error('Erro ao inicializar navegação:', erro);
  }

  try {
    inicializarAutenticacao();
  } catch (erro) {
    console.error('Erro ao inicializar autenticação:', erro);
  }

  try {
    inicializarFormularioHistoria();
  } catch (erro) {
    console.error('Erro ao inicializar formulário de história:', erro);
  }

  // Carregar página inicial
  await carregarInicio();
});

// Expor funções globais para onclick
window.navegarPara = navegarPara;
window.abrirNoticia = abrirNoticia;
window.abrirCategoria = abrirCategoria;
