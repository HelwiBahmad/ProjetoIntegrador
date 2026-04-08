import express from 'express';
import db from '../banco/conexao.js';

const router = express.Router();

// GET /api/categorias - Listar todas as categorias
router.get('/', (req, res) => {
  try {
    const categorias = db.prepare(`
      SELECT 
        c.*,
        COUNT(n.id) as totalNoticias
      FROM Categoria c
      LEFT JOIN Noticia n ON c.id = n.categoriaId AND n.publicado = 1
      WHERE c.ativo = 1
      GROUP BY c.id
      ORDER BY c.nome
    `).all();

    res.json({ categorias });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/categorias/:slug - Buscar categoria por slug com notícias
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const { limite = 10, pagina = 1 } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const categoria = db.prepare('SELECT * FROM Categoria WHERE slug = ? AND ativo = 1').get(slug);

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    const noticias = db.prepare(`
      SELECT 
        n.id, n.titulo, n.slug, n.resumo, n.imagemCapa, n.dataCriacao,
        u.nome as autorNome
      FROM Noticia n
      JOIN Usuario u ON n.autorId = u.id
      WHERE n.categoriaId = ? AND n.publicado = 1
      ORDER BY n.dataCriacao DESC
      LIMIT ? OFFSET ?
    `).all(categoria.id, parseInt(limite), offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM Noticia WHERE categoriaId = ? AND publicado = 1').get(categoria.id);

    res.json({
      categoria,
      noticias,
      paginacao: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / parseInt(limite))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

export default router;
