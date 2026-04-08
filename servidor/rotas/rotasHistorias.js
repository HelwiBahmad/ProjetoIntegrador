import express from 'express';
import db from '../banco/conexao.js';
import { verificarToken, verificarAdmin } from './rotasAutenticacao.js';

const router = express.Router();

// POST /api/historias - Enviar história
router.post('/', (req, res) => {
  try {
    const { titulo, conteudo, nomeAutor, emailAutor, cidade, estado, usuarioId } = req.body;

    // Validações
    if (!titulo || !conteudo) {
      return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios.' });
    }

    if (titulo.trim().length < 5) {
      return res.status(400).json({ erro: 'Título deve ter pelo menos 5 caracteres.' });
    }

    if (conteudo.trim().length < 20) {
      return res.status(400).json({ erro: 'Conteúdo deve ter pelo menos 20 caracteres.' });
    }

    if (!usuarioId && (!nomeAutor || !emailAutor)) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios para visitantes.' });
    }

    if (emailAutor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAutor)) {
      return res.status(400).json({ erro: 'Email inválido.' });
    }

    const result = db.prepare(`
      INSERT INTO Historia (titulo, conteudo, usuarioId, nomeAutor, emailAutor, cidade, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      titulo.trim(),
      conteudo.trim(),
      usuarioId || null,
      nomeAutor ? nomeAutor.trim() : null,
      emailAutor ? emailAutor.toLowerCase() : null,
      cidade || null,
      estado || null
    );

    res.status(201).json({
      mensagem: 'Sua história foi enviada com sucesso! Ela será analisada pela nossa equipe.',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Erro ao enviar história:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/historias - Listar histórias publicadas
router.get('/', (req, res) => {
  try {
    const historias = db.prepare(`
      SELECT h.id, h.titulo, h.conteudo, h.cidade, h.estado, h.dataCriacao,
             COALESCE(u.nome, h.nomeAutor) as autorNome
      FROM Historia h
      LEFT JOIN Usuario u ON h.usuarioId = u.id
      WHERE h.publicado = 1
      ORDER BY h.dataCriacao DESC
    `).all();

    res.json({ historias });
  } catch (error) {
    console.error('Erro ao listar histórias:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/historias/admin/pendentes - Listar histórias pendentes de aprovação (admin)
router.get('/admin/pendentes', verificarToken, verificarAdmin, (req, res) => {
  try {
    const historias = db.prepare(`
      SELECT h.id, h.titulo, h.conteudo, h.cidade, h.estado, h.dataCriacao, h.aprovado, h.publicado,
             COALESCE(u.nome, h.nomeAutor) as autorNome,
             COALESCE(u.email, h.emailAutor) as autorEmail
      FROM Historia h
      LEFT JOIN Usuario u ON h.usuarioId = u.id
      ORDER BY h.dataCriacao DESC
    `).all();

    res.json({ historias });
  } catch (error) {
    console.error('Erro ao listar histórias pendentes:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// PUT /api/historias/:id - Atualizar história (admin)
router.put('/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, nomeAutor, emailAutor, cidade, estado } = req.body;

    const historia = db.prepare('SELECT id FROM Historia WHERE id = ?').get(id);
    if (!historia) {
      return res.status(404).json({ erro: 'História não encontrada.' });
    }

    if (!titulo || !conteudo) {
      return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios.' });
    }

    db.prepare(`
      UPDATE Historia
      SET titulo = ?, conteudo = ?, nomeAutor = ?, emailAutor = ?, cidade = ?, estado = ?
      WHERE id = ?
    `).run(
      titulo.trim(),
      conteudo.trim(),
      nomeAutor ? nomeAutor.trim() : null,
      emailAutor ? emailAutor.toLowerCase() : null,
      cidade || null,
      estado || null,
      id
    );

    res.json({ mensagem: 'História atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar história:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// PUT /api/historias/:id/aprovar - Aprovar história (admin)
router.put('/:id/aprovar', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const historia = db.prepare('SELECT id FROM Historia WHERE id = ?').get(id);
    if (!historia) {
      return res.status(404).json({ erro: 'História não encontrada.' });
    }

    db.prepare('UPDATE Historia SET aprovado = 1, publicado = 1 WHERE id = ?').run(id);

    res.json({ mensagem: 'História aprovada e publicada com sucesso!' });
  } catch (error) {
    console.error('Erro ao aprovar história:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// PUT /api/historias/:id/rejeitar - Rejeitar história (admin)
router.put('/:id/rejeitar', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const historia = db.prepare('SELECT id FROM Historia WHERE id = ?').get(id);
    if (!historia) {
      return res.status(404).json({ erro: 'História não encontrada.' });
    }

    db.prepare('DELETE FROM Historia WHERE id = ?').run(id);

    res.json({ mensagem: 'História rejeitada e removida.' });
  } catch (error) {
    console.error('Erro ao rejeitar história:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// DELETE /api/historias/:id - Excluir história (admin)
router.delete('/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const historia = db.prepare('SELECT id FROM Historia WHERE id = ?').get(id);
    if (!historia) {
      return res.status(404).json({ erro: 'História não encontrada.' });
    }

    db.prepare('DELETE FROM Historia WHERE id = ?').run(id);

    res.json({ mensagem: 'História excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir história:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

export default router;
