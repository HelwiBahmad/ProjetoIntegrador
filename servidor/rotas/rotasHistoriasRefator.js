/**
 * Rotas de Histórias - Padrão MVC
 */

import express from 'express';
import HistoriaController from '../controllers/HistoriaController.js';
import { verificarToken } from './rotasAutenticacao.js';

const router = express.Router();

// GET /api/historias/refactor - Listar histórias publicadas
router.get('/refactor', HistoriaController.listar);

// GET /api/historias/refactor/pendentes - Listar pendentes de aprovação (admin)
router.get('/refactor/pendentes', verificarToken, HistoriaController.listarPendentes);

// GET /api/historias/refactor/:id - Obter por ID
router.get('/refactor/:id', HistoriaController.obterPorId);

// POST /api/historias/refactor - Criar (público)
router.post('/refactor', HistoriaController.criar);

// POST /api/historias/refactor/:id/aprovar - Aprovar (admin)
router.post('/refactor/:id/aprovar', verificarToken, HistoriaController.aprovar);

// POST /api/historias/refactor/:id/rejeitar - Rejeitar (admin)
router.post('/refactor/:id/rejeitar', verificarToken, HistoriaController.rejeitar);

// DELETE /api/historias/refactor/:id - Deletar (admin)
router.delete('/refactor/:id', verificarToken, HistoriaController.deletar);

export default router;
