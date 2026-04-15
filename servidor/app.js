import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
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

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

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

// Rota para upload de imagens
app.post('/api/upload/imagem', upload.single('imagem'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma imagem foi enviada' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      mensagem: 'Imagem enviada com sucesso',
      imagemUrl: imageUrl
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ erro: 'Erro ao fazer upload da imagem' });
  }
});

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
