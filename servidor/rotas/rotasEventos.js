import express from 'express';
import db from '../banco/conexao.js';
import { verificarToken, verificarAutorOuAdmin } from './rotasAutenticacao.js';

const router = express.Router();

// GET /api/eventos - Listar eventos futuros
router.get('/', (req, res) => {
  try {
    const { passados, limite = 20 } = req.query;

    let query;
    if (passados === '1' || passados === 'true') {
      query = `
        SELECT * FROM Evento 
        WHERE ativo = 1 AND dataEvento < date('now')
        ORDER BY dataEvento DESC
        LIMIT ?
      `;
    } else {
      query = `
        SELECT * FROM Evento 
        WHERE ativo = 1 AND dataEvento >= date('now')
        ORDER BY dataEvento ASC
        LIMIT ?
      `;
    }

    const eventos = db.prepare(query).all(parseInt(limite));

    res.json({ eventos });
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/eventos/proximos - Próximos 5 eventos
router.get('/proximos', (req, res) => {
  try {
    const eventos = db.prepare(`
      SELECT * FROM Evento 
      WHERE ativo = 1 AND dataEvento >= date('now')
      ORDER BY dataEvento ASC
      LIMIT 5
    `).all();

    res.json({ eventos });
  } catch (error) {
    console.error('Erro ao buscar próximos eventos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/eventos/:id - Buscar evento por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const evento = db.prepare('SELECT * FROM Evento WHERE id = ? AND ativo = 1').get(id);

    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    res.json({ evento });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// POST /api/eventos - Criar evento (apenas autor/admin)
router.post('/', verificarToken, verificarAutorOuAdmin, (req, res) => {
  try {
    const {
      titulo, descricao, dataEvento, horaInicio, horaFim,
      local, online, linkOnline, interpreteLibras, gratuito, preco, organizador
    } = req.body;

    if (!titulo || !descricao || !dataEvento) {
      return res.status(400).json({ erro: 'Título, descrição e data são obrigatórios.' });
    }

    const result = db.prepare(`
      INSERT INTO Evento (titulo, descricao, dataEvento, horaInicio, horaFim, local, online, linkOnline, interpreteLibras, gratuito, preco, organizador)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      titulo,
      descricao,
      dataEvento,
      horaInicio || null,
      horaFim || null,
      local || null,
      online ? 1 : 0,
      linkOnline || null,
      interpreteLibras !== false ? 1 : 0,
      gratuito !== false ? 1 : 0,
      preco || null,
      organizador || null
    );

    const novoEvento = db.prepare('SELECT * FROM Evento WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ mensagem: 'Evento criado com sucesso!', evento: novoEvento });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

export default router;
