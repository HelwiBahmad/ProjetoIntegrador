/**
 * Service para Direitos
 */

import DireitoRepository from '../repositories/DireitoRepository.js';

class DireitoService {
  static buscarTodos(pagina = 1, limite = 10) {
    try {
      const direitos = DireitoRepository.buscarTodos({ pagina, limite });
      const total = DireitoRepository.contar();

      return {
        direitos,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      };
    } catch (erro) {
      throw new Error(`Erro ao buscar direitos: ${erro.message}`);
    }
  }

  static buscarPorId(id) {
    try {
      const direito = DireitoRepository.buscarPorId(id);
      if (!direito) {
        throw new Error('Direito não encontrado');
      }
      return direito;
    } catch (erro) {
      throw new Error(`Erro ao buscar direito: ${erro.message}`);
    }
  }

  static buscarPorCategoria(categoria) {
    try {
      const direitos = DireitoRepository.buscarPorCategoria(categoria);
      return direitos;
    } catch (erro) {
      throw new Error(`Erro ao buscar direitos por categoria: ${erro.message}`);
    }
  }

  static buscarCategorias() {
    try {
      const categorias = DireitoRepository.buscarCategorias();
      return categorias;
    } catch (erro) {
      throw new Error(`Erro ao buscar categorias: ${erro.message}`);
    }
  }

  static criar(dados) {
    try {
      if (!dados.titulo || dados.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
      }
      if (!dados.categoria || dados.categoria.trim() === '') {
        throw new Error('Categoria é obrigatória');
      }

      const direito = DireitoRepository.criar(dados);
      return direito;
    } catch (erro) {
      throw new Error(`Erro ao criar direito: ${erro.message}`);
    }
  }

  static atualizar(id, dados) {
    try {
      const direito = DireitoRepository.buscarPorId(id);
      if (!direito) {
        throw new Error('Direito não encontrado');
      }

      const atualizado = DireitoRepository.atualizar(id, dados);
      return atualizado;
    } catch (erro) {
      throw new Error(`Erro ao atualizar direito: ${erro.message}`);
    }
  }

  static deletar(id) {
    try {
      const direito = DireitoRepository.buscarPorId(id);
      if (!direito) {
        throw new Error('Direito não encontrado');
      }

      DireitoRepository.deletar(id);
      return { mensagem: 'Direito deletado com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar direito: ${erro.message}`);
    }
  }
}

export default DireitoService;
