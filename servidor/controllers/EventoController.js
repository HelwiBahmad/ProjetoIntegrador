/**
 * Controller para Eventos
 */

import EventoService from '../services/EventoService.js';
import ApiResponse from '../utils/ApiResponse.js';

class EventoController {
  static listarProximos(req, res) {
    try {
      const limite = parseInt(req.query.limite) || 20;
      const eventos = EventoService.buscarProximos(limite);
      const resposta = ApiResponse.success(eventos, 'Próximos eventos');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static listarPassados(req, res) {
    try {
      const limite = parseInt(req.query.limite) || 20;
      const eventos = EventoService.buscarPassados(limite);
      const resposta = ApiResponse.success(eventos, 'Eventos passados');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static listarTodos(req, res) {
    try {
      const resultado = EventoService.buscarTodos();
      const resposta = ApiResponse.success(resultado.eventos, 'Todos os eventos');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static obterPorId(req, res) {
    try {
      const evento = EventoService.buscarPorId(parseInt(req.params.id));
      const resposta = ApiResponse.success(evento, 'Evento encontrado');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.notFound('Evento');
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static criar(req, res) {
    try {
      if (!req.usuario || !['autor', 'admin'].includes(req.usuario.tipo)) {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const evento = EventoService.criar(req.body);
      const resposta = ApiResponse.success(evento, 'Evento criado', 201);
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  static atualizar(req, res) {
    try {
      if (!req.usuario || !['autor', 'admin'].includes(req.usuario.tipo)) {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const evento = EventoService.atualizar(parseInt(req.params.id), req.body);
      const resposta = ApiResponse.success(evento, 'Evento atualizado');
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

      EventoService.deletar(parseInt(req.params.id));
      const resposta = ApiResponse.success({}, 'Evento deletado');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }
}

export default EventoController;
