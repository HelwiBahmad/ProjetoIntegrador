import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Rotas
import rotasAutenticacao from './rotas/rotasAutenticacao.js';
import rotasNoticias from './rotas/rotasNoticias.js';
import rotasCategorias from './rotas/rotasCategorias.js';
import rotasEventos from './rotas/rotasEventos.js';
import rotasHistorias from './rotas/rotasHistorias.js';
import rotasDireitos from './rotas/rotasDireitos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir arquivos estáticos do frontend
app.use(express.static(join(__dirname, '../public')));

// Rotas da API
app.use('/api/auth', rotasAutenticacao);
app.use('/api/noticias', rotasNoticias);
app.use('/api/categorias', rotasCategorias);
app.use('/api/eventos', rotasEventos);
app.use('/api/historias', rotasHistorias);
app.use('/api/direitos', rotasDireitos);

// Rota raiz - servir o index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║          COMUNIDADE EM SINAIS - SERVIDOR               ║
║                                                        ║
║   Portal de notícias para a comunidade surda           ║
║                                                        ║
║   Servidor rodando em: http://localhost:${PORT}           ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;
