/**
 * Rotas de Direitos - Padrão MVC
 */

import express from 'express';
import DireitoController from '../controllers/DireitoController.js';
import { verificarToken } from './rotasAutenticacao.js';

const router = express.Router();

// GET /api/direitos/refactor - Listar todos
router.get('/refactor', DireitoController.listar);

// GET /api/direitos/refactor/categorias - Listar categorias
router.get('/refactor/categorias', DireitoController.listarCategorias);

// GET /api/direitos/refactor/categoria/:categoria - Listar por categoria
router.get('/refactor/categoria/:categoria', DireitoController.listarPorCategoria);

// GET /api/direitos/refactor/:id - Obter por ID
router.get('/refactor/:id', DireitoController.obterPorId);

// POST /api/direitos/refactor - Criar (admin)
router.post('/refactor', verificarToken, DireitoController.criar);

// PUT /api/direitos/refactor/:id - Atualizar (admin)
router.put('/refactor/:id', verificarToken, DireitoController.atualizar);

// DELETE /api/direitos/refactor/:id - Deletar (admin)
router.delete('/refactor/:id', verificarToken, DireitoController.deletar);

export default router;
