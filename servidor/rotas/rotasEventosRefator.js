/**
 * Rotas de Eventos - Padrão MVC
 */

import express from 'express';
import EventoController from '../controllers/EventoController.js';
import { verificarToken } from './rotasAutenticacao.js';

const router = express.Router();

// GET /api/eventos/refactor - Listar todos
router.get('/refactor', EventoController.listarTodos);

// GET /api/eventos/refactor/proximos - Listar próximos
router.get('/refactor/proximos', EventoController.listarProximos);

// GET /api/eventos/refactor/passados - Listar passados
router.get('/refactor/passados', EventoController.listarPassados);

// GET /api/eventos/refactor/:id - Obter por ID
router.get('/refactor/:id', EventoController.obterPorId);

// POST /api/eventos/refactor - Criar (autor/admin)
router.post('/refactor', verificarToken, EventoController.criar);

// PUT /api/eventos/refactor/:id - Atualizar (autor/admin)
router.put('/refactor/:id', verificarToken, EventoController.atualizar);

// DELETE /api/eventos/refactor/:id - Deletar (admin)
router.delete('/refactor/:id', verificarToken, EventoController.deletar);

export default router;
