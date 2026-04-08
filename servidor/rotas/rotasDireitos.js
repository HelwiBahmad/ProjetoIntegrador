import express from 'express';
import db from '../banco/conexao.js';

const router = express.Router();

// GET /api/direitos - Listar todos os direitos/leis
router.get('/', (req, res) => {
  try {
    const { categoria } = req.query;

    let query = 'SELECT * FROM Direito';
    const params = [];

    if (categoria) {
      query += ' WHERE categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY titulo';

    const direitos = db.prepare(query).all(...params);

    res.json({ direitos });
  } catch (error) {
    console.error('Erro ao listar direitos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/direitos/:id - Buscar direito por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const direito = db.prepare('SELECT * FROM Direito WHERE id = ?').get(id);

    if (!direito) {
      return res.status(404).json({ erro: 'Direito não encontrado.' });
    }

    res.json({ direito });
  } catch (error) {
    console.error('Erro ao buscar direito:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/dicionario - Listar termos do dicionário
router.get('/dicionario/termos', (req, res) => {
  try {
    const termos = db.prepare('SELECT * FROM TermoDicionario ORDER BY termo').all();
    res.json({ termos });
  } catch (error) {
    console.error('Erro ao listar termos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/dicionario/termo-do-dia - Termo aleatório do dia
router.get('/dicionario/termo-do-dia', (req, res) => {
  try {
    // Usar a data como seed para ter o mesmo termo durante todo o dia
    const hoje = new Date().toISOString().split('T')[0];
    const termos = db.prepare('SELECT * FROM TermoDicionario').all();
    
    if (termos.length === 0) {
      return res.json({ termo: null });
    }

    // Usar hash simples da data para selecionar termo
    const index = hoje.split('-').reduce((a, b) => parseInt(a) + parseInt(b), 0) % termos.length;
    
    res.json({ termo: termos[index] });
  } catch (error) {
    console.error('Erro ao buscar termo do dia:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

export default router;
