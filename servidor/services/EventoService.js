/**
 * Service para Eventos
 */

import EventoRepository from '../repositories/EventoRepository.js';

class EventoService {
  static buscarProximos(limite = 20) {
    try {
      const eventos = EventoRepository.buscarProximos(limite);
      return eventos;
    } catch (erro) {
      throw new Error(`Erro ao buscar próximos eventos: ${erro.message}`);
    }
  }

  static buscarPassados(limite = 20) {
    try {
      const eventos = EventoRepository.buscarPassados(limite);
      return eventos;
    } catch (erro) {
      throw new Error(`Erro ao buscar eventos passados: ${erro.message}`);
    }
  }

  static buscarPorId(id) {
    try {
      const evento = EventoRepository.buscarPorId(id);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }
      return evento;
    } catch (erro) {
      throw new Error(`Erro ao buscar evento: ${erro.message}`);
    }
  }

  static buscarTodos(limite = 50) {
    try {
      const eventos = EventoRepository.buscarTodos(limite);
      const total = EventoRepository.contar();
      return {
        eventos,
        total
      };
    } catch (erro) {
      throw new Error(`Erro ao buscar eventos: ${erro.message}`);
    }
  }

  static criar(dados) {
    try {
      if (!dados.titulo || dados.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
      }
      if (!dados.data) {
        throw new Error('Data é obrigatória');
      }

      const evento = EventoRepository.criar(dados);
      return evento;
    } catch (erro) {
      throw new Error(`Erro ao criar evento: ${erro.message}`);
    }
  }

  static atualizar(id, dados) {
    try {
      const evento = EventoRepository.buscarPorId(id);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }

      const atualizado = EventoRepository.atualizar(id, dados);
      return atualizado;
    } catch (erro) {
      throw new Error(`Erro ao atualizar evento: ${erro.message}`);
    }
  }

  static deletar(id) {
    try {
      const evento = EventoRepository.buscarPorId(id);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }

      EventoRepository.deletar(id);
      return { mensagem: 'Evento deletado com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar evento: ${erro.message}`);
    }
  }
}

export default EventoService;
