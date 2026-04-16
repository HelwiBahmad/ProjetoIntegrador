/**
 * Service para Categorias
 */

import CategoriaRepository from '../repositories/CategoriaRepository.js';

class CategoriaService {
  static buscarTodas() {
    try {
      const categorias = CategoriaRepository.buscarTodas();
      return {
        sucesso: true,
        categorias
      };
    } catch (erro) {
      throw new Error(`Erro ao buscar categorias: ${erro.message}`);
    }
  }

  static buscarPorSlug(slug) {
    try {
      const categoria = CategoriaRepository.buscarPorSlug(slug);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }
      return categoria;
    } catch (erro) {
      throw new Error(`Erro ao buscar categoria: ${erro.message}`);
    }
  }

  static buscarComNoticias(slug, pagina = 1, limite = 10) {
    try {
      const categoria = CategoriaRepository.buscarPorSlug(slug);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }

      const offset = (pagina - 1) * limite;
      const noticias = CategoriaRepository.buscarNoticiasCategoria(categoria.id, limite, offset);
      const total = CategoriaRepository.contarNoticiasCategoria(categoria.id);

      return {
        categoria,
        noticias,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      };
    } catch (erro) {
      throw new Error(`Erro ao buscar categoria com notícias: ${erro.message}`);
    }
  }

  static criar(dados) {
    try {
      if (!dados.nome || dados.nome.trim() === '') {
        throw new Error('Nome é obrigatório');
      }
      if (!dados.slug || dados.slug.trim() === '') {
        throw new Error('Slug é obrigatório');
      }

      const categoria = CategoriaRepository.criar(dados);
      return categoria;
    } catch (erro) {
      throw new Error(`Erro ao criar categoria: ${erro.message}`);
    }
  }

  static atualizar(id, dados) {
    try {
      const categoria = CategoriaRepository.buscarPorId(id);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }

      const atualizada = CategoriaRepository.atualizar(id, dados);
      return atualizada;
    } catch (erro) {
      throw new Error(`Erro ao atualizar categoria: ${erro.message}`);
    }
  }

  static deletar(id) {
    try {
      const categoria = CategoriaRepository.buscarPorId(id);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }

      CategoriaRepository.deletar(id);
      return { mensagem: 'Categoria deletada com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar categoria: ${erro.message}`);
    }
  }
}

export default CategoriaService;
