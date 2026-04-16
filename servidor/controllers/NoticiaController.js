/**
 * Controller para Notícias
 * Responsabilidade: Receber requisição, delegar ao serviço, retornar resposta HTTP
 * Benefício: Separação entre camada HTTP e lógica de negócio
 */

import NoticiaService from '../services/NoticiaService.js';
import ApiResponse from '../utils/ApiResponse.js';

class NoticiaController {
  /**
   * GET /api/noticias - Listar todas as notícias
   */
  static listar(req, res) {
    try {
      const filtros = {
        categoria: req.query.categoria,
        destaque: req.query.destaque,
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 10
      };

      const resultado = NoticiaService.buscarTodas(filtros);
      const resposta = ApiResponse.success(resultado, 'Notícias carregadas com sucesso');
      
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      console.error('Erro ao listar notícias:', erro);
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  /**
   * GET /api/noticias/:id ou /api/noticias/slug/:slug
   */
  static obterPorId(req, res) {
    try {
      const { id } = req.params;
      
      let noticia;
      if (id.includes('-')) {
        // É um slug
        noticia = NoticiaService.buscarPorSlug(id);
      } else {
        // É um ID
        noticia = NoticiaService.buscarPorId(parseInt(id));
      }

      const resposta = ApiResponse.success(noticia, 'Notícia encontrada');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      console.error('Erro ao obter notícia:', erro);
      const resposta = ApiResponse.notFound('Notícia');
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  /**
   * POST /api/noticias - Criar nova notícia
   */
  static criar(req, res) {
    try {
      // Verificar autenticação
      if (!req.usuario) {
        const resposta = ApiResponse.unauthorized();
        return res.status(resposta.statusCode).json(resposta);
      }

      // Verificar tipo de usuário
      if (!['autor', 'admin'].includes(req.usuario.tipo)) {
        const resposta = ApiResponse.forbidden();
        return res.status(resposta.statusCode).json(resposta);
      }

      const { titulo, slug, resumo, conteudo, categoriaId, imagem } = req.body;

      const noticia = NoticiaService.criar(
        { titulo, slug, resumo, conteudo, categoriaId, imagem },
        req.usuario.id
      );

      const resposta = ApiResponse.success(noticia, 'Notícia criada com sucesso', 201);
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      console.error('Erro ao criar notícia:', erro);
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  /**
   * PUT /api/noticias/:id - Atualizar notícia
   */
  static atualizar(req, res) {
    try {
      // Verificar autenticação
      if (!req.usuario) {
        const resposta = ApiResponse.unauthorized();
        return res.status(resposta.statusCode).json(resposta);
      }

      const { id } = req.params;
      const dados = req.body;

      const noticia = NoticiaService.atualizar(
        parseInt(id),
        dados,
        req.usuario.id,
        req.usuario.tipo
      );

      const resposta = ApiResponse.success(noticia, 'Notícia atualizada com sucesso');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      console.error('Erro ao atualizar notícia:', erro);
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  /**
   * DELETE /api/noticias/:id - Deletar notícia
   */
  static deletar(req, res) {
    try {
      // Verificar autenticação
      if (!req.usuario) {
        const resposta = ApiResponse.unauthorized();
        return res.status(resposta.statusCode).json(resposta);
      }

      const { id } = req.params;

      NoticiaService.deletar(parseInt(id), req.usuario.id, req.usuario.tipo);

      const resposta = ApiResponse.success({}, 'Notícia deletada com sucesso');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      console.error('Erro ao deletar notícia:', erro);
      const resposta = ApiResponse.error(erro.message, 400);
      return res.status(resposta.statusCode).json(resposta);
    }
  }

  /**
   * GET /api/noticias/usuario/minhas - Listar notícias do usuário logado
   */
  static listarMinhas(req, res) {
    try {
      // Verificar autenticação
      if (!req.usuario) {
        const resposta = ApiResponse.unauthorized();
        return res.status(resposta.statusCode).json(resposta);
      }

      const pagina = parseInt(req.query.pagina) || 1;
      const noticias = NoticiaService.buscarMinhas(req.usuario.id, pagina);

      const resposta = ApiResponse.success(noticias, 'Notícias do usuário carregadas');
      return res.status(resposta.statusCode).json(resposta);
    } catch (erro) {
      console.error('Erro ao listar notícias do usuário:', erro);
      const resposta = ApiResponse.error(erro.message, 500);
      return res.status(resposta.statusCode).json(resposta);
    }
  }
}

export default NoticiaController;
