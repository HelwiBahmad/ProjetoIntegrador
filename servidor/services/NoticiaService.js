/**
 * Service para Notícias
 * Responsabilidade: Lógica de negócio, não conhece req/res do Express
 * Benefício: Fácil de testar, reutilizável, separado da camada HTTP
 */

import NoticiaRepository from '../repositories/NoticiaRepository.js';
import db from '../banco/conexao.js';

class NoticiaService {
  /**
   * Buscar todas as notícias
   */
  static buscarTodas(filtros = {}) {
    try {
      const noticias = NoticiaRepository.buscarTodas(filtros);
      const total = NoticiaRepository.contar();
      
      return {
        sucesso: true,
        noticias,
        total,
        pagina: filtros.pagina || 1,
        limite: filtros.limite || 10
      };
    } catch (erro) {
      throw new Error(`Erro ao buscar notícias: ${erro.message}`);
    }
  }

  /**
   * Buscar notícia por ID
   */
  static buscarPorId(id) {
    try {
      const noticia = NoticiaRepository.buscarPorId(id);
      if (!noticia) {
        throw new Error('Notícia não encontrada');
      }
      return noticia;
    } catch (erro) {
      throw new Error(`Erro ao buscar notícia: ${erro.message}`);
    }
  }

  /**
   * Buscar notícia por slug
   */
  static buscarPorSlug(slug) {
    try {
      const noticia = NoticiaRepository.buscarPorSlug(slug);
      if (!noticia) {
        throw new Error('Notícia não encontrada');
      }
      return noticia;
    } catch (erro) {
      throw new Error(`Erro ao buscar notícia: ${erro.message}`);
    }
  }

  /**
   * Criar nova notícia
   */
  static criar(dados, usuarioId) {
    try {
      // Validações
      if (!dados.titulo || dados.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
      }
      if (!dados.slug || dados.slug.trim() === '') {
        throw new Error('Slug é obrigatório');
      }
      if (!dados.conteudo || dados.conteudo.trim() === '') {
        throw new Error('Conteúdo é obrigatório');
      }
      if (!dados.categoriaId) {
        throw new Error('Categoria é obrigatória');
      }

      // Verificar se slug já existe
      const existente = NoticiaRepository.buscarPorSlug(dados.slug);
      if (existente) {
        throw new Error('Slug já existe');
      }

      // Verificar se categoria existe
      const categoria = db.prepare('SELECT * FROM Categoria WHERE id = ?').get(dados.categoriaId);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }

      // Criar notícia
      const noticia = NoticiaRepository.criar({
        ...dados,
        autorId: usuarioId
      });

      return noticia;
    } catch (erro) {
      throw new Error(`Erro ao criar notícia: ${erro.message}`);
    }
  }

  /**
   * Atualizar notícia
   */
  static atualizar(id, dados, usuarioId, tipoUsuario) {
    try {
      const noticia = NoticiaRepository.buscarPorId(id);
      if (!noticia) {
        throw new Error('Notícia não encontrada');
      }

      // Verificar permissão (autor só pode editar sua própria notícia)
      if (tipoUsuario === 'autor' && noticia.autorId !== usuarioId) {
        throw new Error('Acesso negado');
      }

      const atualizada = NoticiaRepository.atualizar(id, dados);
      return atualizada;
    } catch (erro) {
      throw new Error(`Erro ao atualizar notícia: ${erro.message}`);
    }
  }

  /**
   * Deletar notícia
   */
  static deletar(id, usuarioId, tipoUsuario) {
    try {
      const noticia = NoticiaRepository.buscarPorId(id);
      if (!noticia) {
        throw new Error('Notícia não encontrada');
      }

      // Apenas admin pode deletar
      if (tipoUsuario !== 'admin') {
        throw new Error('Apenas administradores podem deletar notícias');
      }

      NoticiaRepository.deletar(id);
      return { mensagem: 'Notícia deletada com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar notícia: ${erro.message}`);
    }
  }

  /**
   * Buscar notícias do usuário
   */
  static buscarMinhas(usuarioId, pagina = 1) {
    try {
      const noticias = NoticiaRepository.buscarPorAutor(usuarioId, pagina);
      return noticias;
    } catch (erro) {
      throw new Error(`Erro ao buscar notícias: ${erro.message}`);
    }
  }
}

export default NoticiaService;
