/**
 * Rotas de Categorias - Padrão MVC
 */

import express from 'express';
import CategoriaController from '../controllers/CategoriaController.js';
import { verificarToken } from './rotasAutenticacao.js';

const router = express.Router();

// GET /api/categorias/refactor - Listar todas
router.get('/refactor', CategoriaController.listar);

// GET /api/categorias/refactor/:slug - Obter com notícias
router.get('/refactor/:slug', CategoriaController.obterComNoticias);

// POST /api/categorias/refactor - Criar (admin)
router.post('/refactor', verificarToken, CategoriaController.criar);

// PUT /api/categorias/refactor/:id - Atualizar (admin)
router.put('/refactor/:id', verificarToken, CategoriaController.atualizar);

// DELETE /api/categorias/refactor/:id - Deletar (admin)
router.delete('/refactor/:id', verificarToken, CategoriaController.deletar);

export default router;
