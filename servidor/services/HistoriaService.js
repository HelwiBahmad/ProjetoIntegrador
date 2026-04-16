/**
 * Service para Histórias
 */

import HistoriaRepository from '../repositories/HistoriaRepository.js';

class HistoriaService {
  static buscarTodas(pagina = 1, limite = 10) {
    try {
      const historias = HistoriaRepository.buscarTodas({ pagina, limite });
      const total = HistoriaRepository.contar();

      return {
        historias,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      };
    } catch (erro) {
      throw new Error(`Erro ao buscar histórias: ${erro.message}`);
    }
  }

  static buscarPorId(id) {
    try {
      const historia = HistoriaRepository.buscarPorId(id);
      if (!historia) {
        throw new Error('História não encontrada');
      }
      return historia;
    } catch (erro) {
      throw new Error(`Erro ao buscar história: ${erro.message}`);
    }
  }

  static buscarPendentes() {
    try {
      const historias = HistoriaRepository.buscarPendenteAprovacao();
      const total = HistoriaRepository.contarPendentes();
      return {
        historias,
        total
      };
    } catch (erro) {
      throw new Error(`Erro ao buscar histórias pendentes: ${erro.message}`);
    }
  }

  static criar(dados) {
    try {
      if (!dados.titulo || dados.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
      }
      if (dados.titulo.trim().length < 5) {
        throw new Error('Título deve ter pelo menos 5 caracteres');
      }
      if (!dados.conteudo || dados.conteudo.trim() === '') {
        throw new Error('Conteúdo é obrigatório');
      }
      if (dados.conteudo.trim().length < 20) {
        throw new Error('Conteúdo deve ter pelo menos 20 caracteres');
      }

      if (!dados.usuarioId && (!dados.nomeAutor || !dados.emailAutor)) {
        throw new Error('Nome e email são obrigatórios para visitantes');
      }

      if (dados.emailAutor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.emailAutor)) {
        throw new Error('Email inválido');
      }

      const id = HistoriaRepository.criar(dados);
      return {
        id,
        mensagem: 'Sua história foi enviada com sucesso! Ela será analisada pela nossa equipe.'
      };
    } catch (erro) {
      throw new Error(`Erro ao criar história: ${erro.message}`);
    }
  }

  static aprovar(id) {
    try {
      const historia = HistoriaRepository.buscarPorId(id);
      if (!historia) {
        throw new Error('História não encontrada');
      }

      HistoriaRepository.aprovar(id);
      return { mensagem: 'História aprovada com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao aprovar história: ${erro.message}`);
    }
  }

  static rejeitar(id) {
    try {
      const historia = HistoriaRepository.buscarPorId(id);
      if (!historia) {
        throw new Error('História não encontrada');
      }

      HistoriaRepository.rejeitar(id);
      return { mensagem: 'História rejeitada' };
    } catch (erro) {
      throw new Error(`Erro ao rejeitar história: ${erro.message}`);
    }
  }

  static deletar(id) {
    try {
      HistoriaRepository.deletar(id);
      return { mensagem: 'História deletada com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar história: ${erro.message}`);
    }
  }
}

export default HistoriaService;
