import express from 'express';
import db from '../banco/conexao.js';
import { verificarToken, verificarAutorOuAdmin } from './rotasAutenticacao.js';

const router = express.Router();

// GET /api/noticias - Listar notícias
router.get('/', (req, res) => {
  try {
    const { categoria, destaque, limite = 20, pagina = 1 } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    let query = `
      SELECT 
        n.id, n.titulo, n.slug, n.resumo, n.imagemCapa, n.videoLibras,
        n.destaque, n.visualizacoes, n.dataCriacao, n.dataAtualizacao,
        c.id as categoriaId, c.nome as categoriaNome, c.slug as categoriaSlug, c.cor as categoriaCor,
        u.id as autorId, u.nome as autorNome
      FROM Noticia n
      JOIN Categoria c ON n.categoriaId = c.id
      JOIN Usuario u ON n.autorId = u.id
      WHERE n.publicado = 1
    `;

    const params = [];

    if (categoria) {
      query += ' AND c.slug = ?';
      params.push(categoria);
    }

    if (destaque === '1' || destaque === 'true') {
      query += ' AND n.destaque = 1';
    }

    query += ' ORDER BY n.dataCriacao DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limite), offset);

    const noticias = db.prepare(query).all(...params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM Noticia n JOIN Categoria c ON n.categoriaId = c.id WHERE n.publicado = 1';
    const countParams = [];

    if (categoria) {
      countQuery += ' AND c.slug = ?';
      countParams.push(categoria);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      noticias,
      paginacao: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / parseInt(limite))
      }
    });
  } catch (error) {
    console.error('Erro ao listar notícias:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/noticias/destaques - Notícias em destaque
router.get('/destaques', (req, res) => {
  try {
    const noticias = db.prepare(`
      SELECT 
        n.id, n.titulo, n.slug, n.resumo, n.imagemCapa,
        c.nome as categoriaNome, c.slug as categoriaSlug, c.cor as categoriaCor
      FROM Noticia n
      JOIN Categoria c ON n.categoriaId = c.id
      WHERE n.publicado = 1 AND n.destaque = 1
      ORDER BY n.dataCriacao DESC
      LIMIT 5
    `).all();

    res.json({ noticias });
  } catch (error) {
    console.error('Erro ao buscar destaques:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/noticias/:slug - Buscar notícia por slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const noticia = db.prepare(`
      SELECT 
        n.*,
        c.id as categoriaId, c.nome as categoriaNome, c.slug as categoriaSlug, c.cor as categoriaCor,
        u.id as autorId, u.nome as autorNome, u.bio as autorBio
      FROM Noticia n
      JOIN Categoria c ON n.categoriaId = c.id
      JOIN Usuario u ON n.autorId = u.id
      WHERE n.slug = ? AND n.publicado = 1
    `).get(slug);

    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada.' });
    }

    // Incrementar visualizações
    db.prepare('UPDATE Noticia SET visualizacoes = visualizacoes + 1 WHERE id = ?').run(noticia.id);

    // Buscar notícias relacionadas (mesma categoria)
    const relacionadas = db.prepare(`
      SELECT n.id, n.titulo, n.slug, n.resumo, n.imagemCapa, c.nome as categoriaNome
      FROM Noticia n
      JOIN Categoria c ON n.categoriaId = c.id
      WHERE n.categoriaId = ? AND n.id != ? AND n.publicado = 1
      ORDER BY n.dataCriacao DESC
      LIMIT 3
    `).all(noticia.categoriaId, noticia.id);

    res.json({ noticia, relacionadas });
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// POST /api/noticias - Criar notícia (apenas autor/admin)
router.post('/', verificarToken, verificarAutorOuAdmin, (req, res) => {
  try {
    const { titulo, resumo, conteudo, imagemCapa, videoLibras, categoriaId, destaque = 0 } = req.body;

    if (!titulo || !resumo || !conteudo || !categoriaId) {
      return res.status(400).json({ erro: 'Título, resumo, conteúdo e categoria são obrigatórios.' });
    }

    // Gerar slug
    const slug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    // Verificar se slug já existe
    const slugExistente = db.prepare('SELECT id FROM Noticia WHERE slug = ?').get(slug);
    const slugFinal = slugExistente ? `${slug}-${Date.now()}` : slug;

    const result = db.prepare(`
      INSERT INTO Noticia (titulo, slug, resumo, conteudo, imagemCapa, videoLibras, categoriaId, autorId, destaque, publicado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(titulo, slugFinal, resumo, conteudo, imagemCapa || null, videoLibras || null, categoriaId, req.usuario.id, destaque ? 1 : 0);

    const novaNoticia = db.prepare('SELECT * FROM Noticia WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ mensagem: 'Notícia criada com sucesso!', noticia: novaNoticia });
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// PUT /api/noticias/:id - Atualizar notícia
router.put('/:id', verificarToken, verificarAutorOuAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, resumo, conteudo, imagemCapa, videoLibras, categoriaId, destaque, publicado } = req.body;

    const noticiaExistente = db.prepare('SELECT * FROM Noticia WHERE id = ?').get(id);
    if (!noticiaExistente) {
      return res.status(404).json({ erro: 'Notícia não encontrada.' });
    }

    db.prepare(`
      UPDATE Noticia 
      SET titulo = COALESCE(?, titulo),
          resumo = COALESCE(?, resumo),
          conteudo = COALESCE(?, conteudo),
          imagemCapa = COALESCE(?, imagemCapa),
          videoLibras = COALESCE(?, videoLibras),
          categoriaId = COALESCE(?, categoriaId),
          destaque = COALESCE(?, destaque),
          publicado = COALESCE(?, publicado),
          dataAtualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      titulo || null,
      resumo || null,
      conteudo || null,
      imagemCapa || null,
      videoLibras || null,
      categoriaId || null,
      destaque !== undefined ? (destaque ? 1 : 0) : null,
      publicado !== undefined ? (publicado ? 1 : 0) : null,
      id
    );

    const noticiaAtualizada = db.prepare('SELECT * FROM Noticia WHERE id = ?').get(id);

    res.json({ mensagem: 'Notícia atualizada com sucesso!', noticia: noticiaAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// DELETE /api/noticias/:id - Excluir notícia
router.delete('/:id', verificarToken, verificarAutorOuAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const noticia = db.prepare('SELECT * FROM Noticia WHERE id = ?').get(id);
    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada.' });
    }

    db.prepare('DELETE FROM Noticia WHERE id = ?').run(id);

    res.json({ mensagem: 'Notícia excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir notícia:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

export default router;
