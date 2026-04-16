/**
 * Controller para Histórias
 */

import HistoriaService from '../services/HistoriaService.js';
import ApiResponse from '../utils/ApiResponse.js';

class HistoriaController {
  static listar(req, res) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;

      const resultado = HistoriaService.buscarTodas(pagina, limite);
      const resposta = ApiResponse.success(resultado, 'Histórias carregadas');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static obterPorId(req, res) {
    try {
      const historia = HistoriaService.buscarPorId(parseInt(req.params.id));
      const resposta = ApiResponse.success(historia, 'História encontrada');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.notFound('História');
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static listarPendentes(req, res) {
    try {
      if (!req.usuario || req.usuario.tipo !== 'admin') {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const resultado = HistoriaService.buscarPendentes();
      const resposta = ApiResponse.success(resultado, 'Histórias pendentes');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static criar(req, res) {
    try {
      const resultado = HistoriaService.criar(req.body);
      const resposta = ApiResponse.success({ id: resultado.id }, resultado.mensagem, 201);
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static aprovar(req, res) {
    try {
      if (!req.usuario || req.usuario.tipo !== 'admin') {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const resultado = HistoriaService.aprovar(parseInt(req.params.id));
      const resposta = ApiResponse.success({}, resultado.mensagem);
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static rejeitar(req, res) {
    try {
      if (!req.usuario || req.usuario.tipo !== 'admin') {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const resultado = HistoriaService.rejeitar(parseInt(req.params.id));
      const resposta = ApiResponse.success({}, resultado.mensagem);
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

      HistoriaService.deletar(parseInt(req.params.id));
      const resposta = ApiResponse.success({}, 'História deletada');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }
}

export default HistoriaController;
