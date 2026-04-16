/**
 * Rotas de Notícias - Utilizando padrão MVC
 * Camadas: Routes → Controllers → Services → Repositories
 */

import express from 'express';
import NoticiaController from '../controllers/NoticiaController.js';
import { verificarToken, verificarAutorOuAdmin } from './rotasAutenticacao.js';

const router = express.Router();

/**
 * @route GET /api/noticias/refactor
 * @desc Listar todas as notícias (público)
 */
router.get('/refactor', NoticiaController.listar);

/**
 * @route GET /api/noticias/refactor/usuario/minhas
 * @desc Listar notícias do usuário logado (autenticado)
 */
router.get('/refactor/usuario/minhas', verificarToken, NoticiaController.listarMinhas);

/**
 * @route GET /api/noticias/refactor/:id
 * @desc Obter notícia por ID ou slug (público)
 */
router.get('/refactor/:id', NoticiaController.obterPorId);

/**
 * @route POST /api/noticias/refactor
 * @desc Criar nova notícia (autor/admin)
 */
router.post('/refactor', verificarToken, verificarAutorOuAdmin, NoticiaController.criar);

/**
 * @route PUT /api/noticias/refactor/:id
 * @desc Atualizar notícia (author/admin)
 */
router.put('/refactor/:id', verificarToken, verificarAutorOuAdmin, NoticiaController.atualizar);

/**
 * @route DELETE /api/noticias/refactor/:id
 * @desc Deletar notícia (admin)
 */
router.delete('/refactor/:id', verificarToken, NoticiaController.deletar);

export default router;
