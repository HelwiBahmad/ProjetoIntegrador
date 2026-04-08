import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'comunidade.db'));

// Habilitar chaves estrangeiras
db.pragma('foreign_keys = ON');

// ==================== TABELAS ====================

// Tabela de Usuários
db.exec(`
  CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo TEXT DEFAULT 'leitor' CHECK(tipo IN ('leitor', 'autor', 'admin')),
    avatar TEXT,
    bio TEXT,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo INTEGER DEFAULT 1
  )
`);

// Tabela de Categorias
db.exec(`
  CREATE TABLE IF NOT EXISTS Categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descricao TEXT,
    icone TEXT,
    cor TEXT DEFAULT '#0EA5E9',
    ativo INTEGER DEFAULT 1
  )
`);

// Tabela de Notícias
db.exec(`
  CREATE TABLE IF NOT EXISTS Noticia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    resumo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    imagemCapa TEXT,
    videoLibras TEXT,
    categoriaId INTEGER NOT NULL,
    autorId INTEGER NOT NULL,
    destaque INTEGER DEFAULT 0,
    visualizacoes INTEGER DEFAULT 0,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    publicado INTEGER DEFAULT 0,
    FOREIGN KEY (categoriaId) REFERENCES Categoria(id),
    FOREIGN KEY (autorId) REFERENCES Usuario(id)
  )
`);

// Tabela de Eventos
db.exec(`
  CREATE TABLE IF NOT EXISTS Evento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    dataEvento DATE NOT NULL,
    horaInicio TEXT,
    horaFim TEXT,
    local TEXT,
    online INTEGER DEFAULT 0,
    linkOnline TEXT,
    interpreteLibras INTEGER DEFAULT 1,
    gratuito INTEGER DEFAULT 1,
    preco REAL,
    imagemCapa TEXT,
    organizador TEXT,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo INTEGER DEFAULT 1
  )
`);

// Tabela de Direitos/Leis
db.exec(`
  CREATE TABLE IF NOT EXISTS Direito (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    numeroLei TEXT,
    descricao TEXT NOT NULL,
    conteudo TEXT,
    categoria TEXT,
    linkOficial TEXT,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabela de Comentários
db.exec(`
  CREATE TABLE IF NOT EXISTS Comentario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conteudo TEXT NOT NULL,
    noticiaId INTEGER NOT NULL,
    usuarioId INTEGER NOT NULL,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprovado INTEGER DEFAULT 1,
    FOREIGN KEY (noticiaId) REFERENCES Noticia(id) ON DELETE CASCADE,
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
  )
`);

// Tabela de Histórias (enviadas pelos usuários)
db.exec(`
  CREATE TABLE IF NOT EXISTS Historia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    usuarioId INTEGER,
    nomeAutor TEXT,
    emailAutor TEXT,
    cidade TEXT,
    estado TEXT,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprovado INTEGER DEFAULT 0,
    publicado INTEGER DEFAULT 0,
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
  )
`);

// Tabela de Termos do Dicionário
db.exec(`
  CREATE TABLE IF NOT EXISTS TermoDicionario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    termo TEXT NOT NULL,
    definicao TEXT NOT NULL,
    exemplo TEXT,
    categoria TEXT,
    videoLibras TEXT
  )
`);

// ==================== DADOS INICIAIS ====================

// Inserir usuário admin
const senhaAdmin = bcrypt.hashSync('admin123', 10);
const adminExiste = db.prepare('SELECT id FROM Usuario WHERE email = ?').get('admin@comunidadeemsinais.com.br');

if (!adminExiste) {
  db.prepare(`
    INSERT INTO Usuario (nome, email, senha, tipo, bio)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'Administrador',
    'admin@comunidadeemsinais.com.br',
    senhaAdmin,
    'admin',
    'Administrador do portal Comunidade em Sinais'
  );
}

// Inserir autor padrão
const senhaAutor = bcrypt.hashSync('autor123', 10);
const autorExiste = db.prepare('SELECT id FROM Usuario WHERE email = ?').get('maria@comunidadeemsinais.com.br');

if (!autorExiste) {
  db.prepare(`
    INSERT INTO Usuario (nome, email, senha, tipo, bio)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'Maria Silva',
    'maria@comunidadeemsinais.com.br',
    senhaAutor,
    'autor',
    'Jornalista especializada em acessibilidade e direitos da comunidade surda'
  );
}

// Inserir categorias
const categorias = [
  { nome: 'Direitos', slug: 'direitos', descricao: 'Leis, decretos e conquistas da comunidade surda', icone: 'scale', cor: '#0EA5E9' },
  { nome: 'Educação', slug: 'educacao', descricao: 'Ensino de Libras, escolas bilíngues e universidades', icone: 'graduation-cap', cor: '#10B981' },
  { nome: 'Cultura', slug: 'cultura', descricao: 'Arte surda, teatro, literatura e expressões culturais', icone: 'palette', cor: '#F59E0B' },
  { nome: 'Tecnologia', slug: 'tecnologia', descricao: 'Inovações e ferramentas de acessibilidade', icone: 'smartphone', cor: '#8B5CF6' },
  { nome: 'Saúde', slug: 'saude', descricao: 'Atendimento acessível e saúde auditiva', icone: 'heart-pulse', cor: '#EF4444' },
  { nome: 'Emprego', slug: 'emprego', descricao: 'Vagas, inclusão no mercado de trabalho', icone: 'briefcase', cor: '#06B6D4' },
  { nome: 'Comunidade', slug: 'comunidade', descricao: 'Histórias, eventos e vida em comunidade', icone: 'users', cor: '#EC4899' }
];

const insertCategoria = db.prepare(`
  INSERT OR IGNORE INTO Categoria (nome, slug, descricao, icone, cor)
  VALUES (?, ?, ?, ?, ?)
`);

categorias.forEach(cat => {
  insertCategoria.run(cat.nome, cat.slug, cat.descricao, cat.icone, cat.cor);
});

// Inserir notícias de exemplo
const noticias = [
  {
    titulo: 'Nova Lei garante intérprete de Libras em hospitais públicos',
    slug: 'nova-lei-interprete-libras-hospitais',
    resumo: 'Conquista histórica para a comunidade surda: agora todos os hospitais públicos devem ter intérprete de Libras disponível 24 horas.',
    conteudo: `<p>Uma grande conquista para a comunidade surda brasileira foi sancionada nesta semana. A nova lei federal determina que todos os hospitais públicos do país devem disponibilizar intérpretes de Libras 24 horas por dia, 7 dias por semana.</p>
    <p>A medida visa garantir o acesso à saúde de forma igualitária para pessoas surdas, que frequentemente enfrentavam barreiras de comunicação em atendimentos de emergência.</p>
    <h2>O que muda na prática</h2>
    <ul>
      <li>Intérpretes presenciais ou por videochamada disponíveis</li>
      <li>Treinamento obrigatório para equipes de saúde</li>
      <li>Sinalização visual em áreas de emergência</li>
      <li>Prazo de 180 dias para adequação</li>
    </ul>
    <p>A FENEIS (Federação Nacional de Educação e Integração dos Surdos) celebrou a conquista e reforçou a importância da fiscalização para garantir o cumprimento da lei.</p>`,
    categoriaId: 1,
    destaque: 1,
    publicado: 1
  },
  {
    titulo: 'Escola bilíngue de referência inaugura nova unidade em São Paulo',
    slug: 'escola-bilingue-nova-unidade-sp',
    resumo: 'O Instituto Nacional de Educação de Surdos expande sua atuação com nova unidade que atenderá 500 alunos.',
    conteudo: `<p>O INES (Instituto Nacional de Educação de Surdos) inaugurou sua nova unidade em São Paulo, ampliando o acesso à educação bilíngue de qualidade para crianças e jovens surdos.</p>
    <p>A nova escola conta com infraestrutura moderna, laboratórios adaptados e equipe pedagógica especializada em educação de surdos.</p>`,
    categoriaId: 2,
    destaque: 1,
    publicado: 1
  },
  {
    titulo: 'Festival de Cinema Surdo acontece em novembro no Rio de Janeiro',
    slug: 'festival-cinema-surdo-rio-novembro',
    resumo: 'Evento gratuito exibirá 30 filmes produzidos por cineastas surdos de todo o Brasil e convidados internacionais.',
    conteudo: `<p>O 5º Festival de Cinema Surdo Brasileiro acontecerá entre os dias 15 e 20 de novembro no Rio de Janeiro, com programação totalmente acessível em Libras.</p>
    <p>O evento contará com exibições de curtas e longas-metragens, oficinas de produção audiovisual e debates com cineastas surdos renomados.</p>`,
    categoriaId: 3,
    destaque: 1,
    publicado: 1
  },
  {
    titulo: 'Aplicativo de tradução em tempo real para Libras é lançado',
    slug: 'app-traducao-libras-tempo-real',
    resumo: 'Startup brasileira desenvolve tecnologia inovadora que traduz fala para Libras usando inteligência artificial.',
    conteudo: `<p>Uma startup brasileira lançou um aplicativo revolucionário que utiliza inteligência artificial para traduzir fala em tempo real para Libras, exibindo um avatar animado que reproduz os sinais.</p>
    <p>O app já está disponível gratuitamente nas lojas de aplicativos e promete facilitar a comunicação em diversos contextos do dia a dia.</p>`,
    categoriaId: 4,
    destaque: 0,
    publicado: 1
  },
  {
    titulo: 'Empresas que contratam surdos têm desempenho 20% melhor',
    slug: 'empresas-contratam-surdos-melhor-desempenho',
    resumo: 'Estudo revela que diversidade e inclusão impactam positivamente nos resultados das organizações.',
    conteudo: `<p>Um estudo realizado pela Fundação Instituto de Pesquisas Econômicas (FIPE) revelou que empresas com políticas ativas de inclusão de pessoas surdas apresentam desempenho até 20% superior em indicadores de produtividade e clima organizacional.</p>`,
    categoriaId: 6,
    destaque: 0,
    publicado: 1
  },
  {
    titulo: 'Guia completo: como solicitar intérprete de Libras no trabalho',
    slug: 'guia-solicitar-interprete-trabalho',
    resumo: 'Conheça seus direitos e saiba como exigir acessibilidade no ambiente profissional.',
    conteudo: `<p>Todo trabalhador surdo tem direito a condições acessíveis de trabalho, incluindo a presença de intérprete de Libras em reuniões, treinamentos e eventos da empresa.</p>
    <h2>Seus direitos</h2>
    <p>A Lei Brasileira de Inclusão (Lei 13.146/2015) garante adaptações razoáveis no ambiente de trabalho.</p>`,
    categoriaId: 1,
    destaque: 0,
    publicado: 1
  }
];

const autorId = db.prepare('SELECT id FROM Usuario WHERE tipo = ?').get('autor')?.id || 1;

const insertNoticia = db.prepare(`
  INSERT OR IGNORE INTO Noticia (titulo, slug, resumo, conteudo, categoriaId, autorId, destaque, publicado)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

noticias.forEach(noticia => {
  insertNoticia.run(
    noticia.titulo,
    noticia.slug,
    noticia.resumo,
    noticia.conteudo,
    noticia.categoriaId,
    autorId,
    noticia.destaque,
    noticia.publicado
  );
});

// Inserir eventos de exemplo
const eventos = [
  {
    titulo: 'Curso de Libras para Iniciantes',
    descricao: 'Curso gratuito de introdução à Língua Brasileira de Sinais. Aprenda os sinais básicos e comece a se comunicar!',
    dataEvento: '2026-04-15',
    horaInicio: '19:00',
    horaFim: '21:00',
    local: 'Centro Cultural São Paulo',
    online: 0,
    interpreteLibras: 1,
    gratuito: 1,
    organizador: 'FENEIS-SP'
  },
  {
    titulo: 'Encontro Nacional da Comunidade Surda',
    descricao: 'O maior encontro de surdos do Brasil. Palestras, oficinas e muito networking!',
    dataEvento: '2026-05-10',
    horaInicio: '09:00',
    horaFim: '18:00',
    local: 'Centro de Convenções Anhembi - São Paulo',
    online: 1,
    linkOnline: 'https://encontrosurdo.com.br',
    interpreteLibras: 1,
    gratuito: 0,
    preco: 50.00,
    organizador: 'Confederação Brasileira de Surdos'
  },
  {
    titulo: 'Workshop: Direitos Trabalhistas do Surdo',
    descricao: 'Entenda seus direitos e como lutar por eles no ambiente de trabalho.',
    dataEvento: '2026-04-20',
    horaInicio: '14:00',
    horaFim: '17:00',
    local: '',
    online: 1,
    linkOnline: 'https://zoom.us/workshop-direitos',
    interpreteLibras: 1,
    gratuito: 1,
    organizador: 'OAB - Comissão de Acessibilidade'
  }
];

const insertEvento = db.prepare(`
  INSERT OR IGNORE INTO Evento (titulo, descricao, dataEvento, horaInicio, horaFim, local, online, linkOnline, interpreteLibras, gratuito, preco, organizador)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

eventos.forEach(evento => {
  insertEvento.run(
    evento.titulo,
    evento.descricao,
    evento.dataEvento,
    evento.horaInicio,
    evento.horaFim,
    evento.local,
    evento.online,
    evento.linkOnline || null,
    evento.interpreteLibras,
    evento.gratuito,
    evento.preco || null,
    evento.organizador
  );
});

// Inserir direitos/leis
const direitos = [
  {
    titulo: 'Lei de Libras',
    numeroLei: 'Lei nº 10.436/2002',
    descricao: 'Reconhece a Língua Brasileira de Sinais (Libras) como meio legal de comunicação e expressão.',
    categoria: 'Federal',
    linkOficial: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm'
  },
  {
    titulo: 'Lei Brasileira de Inclusão',
    numeroLei: 'Lei nº 13.146/2015',
    descricao: 'Estatuto da Pessoa com Deficiência - garante direitos fundamentais às pessoas com deficiência.',
    categoria: 'Federal',
    linkOficial: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm'
  },
  {
    titulo: 'Decreto de Regulamentação da Libras',
    numeroLei: 'Decreto nº 5.626/2005',
    descricao: 'Regulamenta a Lei de Libras e estabelece a inclusão da disciplina em cursos de formação.',
    categoria: 'Federal',
    linkOficial: 'http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/decreto/d5626.htm'
  }
];

const insertDireito = db.prepare(`
  INSERT OR IGNORE INTO Direito (titulo, numeroLei, descricao, categoria, linkOficial)
  VALUES (?, ?, ?, ?, ?)
`);

direitos.forEach(direito => {
  insertDireito.run(
    direito.titulo,
    direito.numeroLei,
    direito.descricao,
    direito.categoria,
    direito.linkOficial
  );
});

// Inserir termos do dicionário
const termos = [
  { termo: 'Libras', definicao: 'Língua Brasileira de Sinais, reconhecida legalmente como meio de comunicação e expressão da comunidade surda brasileira.', categoria: 'Geral' },
  { termo: 'Cultura Surda', definicao: 'Conjunto de práticas, valores, costumes e produções artísticas desenvolvidas pela comunidade surda.', categoria: 'Cultura' },
  { termo: 'Intérprete de Libras', definicao: 'Profissional habilitado para realizar a interpretação entre Libras e Português, garantindo a comunicação acessível.', categoria: 'Profissional' },
  { termo: 'Escola Bilíngue', definicao: 'Instituição de ensino que utiliza Libras como primeira língua e Português escrito como segunda língua.', categoria: 'Educação' },
  { termo: 'Acessibilidade Comunicacional', definicao: 'Eliminação de barreiras na comunicação, garantindo o acesso à informação por pessoas surdas.', categoria: 'Direitos' }
];

const insertTermo = db.prepare(`
  INSERT OR IGNORE INTO TermoDicionario (termo, definicao, categoria)
  VALUES (?, ?, ?)
`);

termos.forEach(t => {
  insertTermo.run(t.termo, t.definicao, t.categoria);
});

console.log('Banco de dados inicializado com sucesso!');
console.log('Tabelas criadas: Usuario, Categoria, Noticia, Evento, Direito, Comentario, Historia, TermoDicionario');
console.log('Dados de exemplo inseridos.');

db.close();
