/**
 * Controller para Direitos
 */

import DireitoService from '../services/DireitoService.js';
import ApiResponse from '../utils/ApiResponse.js';

class DireitoController {
  static listar(req, res) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;

      const resultado = DireitoService.buscarTodos(pagina, limite);
      const resposta = ApiResponse.success(resultado, 'Direitos carregados');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static obterPorId(req, res) {
    try {
      const direito = DireitoService.buscarPorId(parseInt(req.params.id));
      const resposta = ApiResponse.success(direito, 'Direito encontrado');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.notFound('Direito');
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static listarPorCategoria(req, res) {
    try {
      const { categoria } = req.params;
      const direitos = DireitoService.buscarPorCategoria(categoria);
      const resposta = ApiResponse.success(direitos, 'Direitos carregados');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static listarCategorias(req, res) {
    try {
      const categorias = DireitoService.buscarCategorias();
      const resposta = ApiResponse.success(categorias, 'Categorias carregadas');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static criar(req, res) {
    try {
      if (!req.usuario || req.usuario.tipo !== 'admin') {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const direito = DireitoService.criar(req.body);
      const resposta = ApiResponse.success(direito, 'Direito criado', 201);
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

      const direito = DireitoService.atualizar(parseInt(req.params.id), req.body);
      const resposta = ApiResponse.success(direito, 'Direito atualizado');
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

      DireitoService.deletar(parseInt(req.params.id));
      const resposta = ApiResponse.success({}, 'Direito deletado');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }
}

export default DireitoController;
