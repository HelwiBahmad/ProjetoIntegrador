/**
 * Controller para Categorias
 */

import CategoriaService from '../services/CategoriaService.js';
import ApiResponse from '../utils/ApiResponse.js';

class CategoriaController {
  static listar(req, res) {
    try {
      const resultado = CategoriaService.buscarTodas();
      const resposta = ApiResponse.success(resultado.categorias, 'Categorias carregadas');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static obterComNoticias(req, res) {
    try {
      const { slug } = req.params;
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;

      const resultado = CategoriaService.buscarComNoticias(slug, pagina, limite);
      const resposta = ApiResponse.success(resultado, 'Categoria encontrada');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.notFound('Categoria');
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static criar(req, res) {
    try {
      if (!req.usuario || req.usuario.tipo !== 'admin') {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const categoria = CategoriaService.criar(req.body);
      const resposta = ApiResponse.success(categoria, 'Categoria criada', 201);
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static atualizar(req, res) {
    try {
      if (!req.usuario || req.usuario.tipo !== 'admin') {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const categoria = CategoriaService.atualizar(parseInt(req.params.id), req.body);
      const resposta = ApiResponse.success(categoria, 'Categoria atualizada');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static deletar(req, res) {
    try {
      if (!req.usuario || req.usuario.tipo !== 'admin') {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      CategoriaService.deletar(parseInt(req.params.id));
      const resposta = ApiResponse.success({}, 'Categoria deletada');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }
}

export default CategoriaController;
