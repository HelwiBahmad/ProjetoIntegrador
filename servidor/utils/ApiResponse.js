/**
 * Factory Pattern para respostas padronizadas da API
 * Garante que todas as respostas seguem o mesmo padrão
 */

class ApiResponse {
  /**
   * Criar resposta de sucesso
   * @param {Object} data - Dados a retornar
   * @param {string} mensagem - Mensagem de sucesso
   * @param {number} statusCode - Código HTTP (padrão 200)
   */
  static success(data, mensagem = 'Sucesso', statusCode = 200) {
    return {
      statusCode,
      sucesso: true,
      mensagem,
      dados: data
    };
  }

  /**
   * Criar resposta de erro
   * @param {string} erro - Mensagem de erro
   * @param {number} statusCode - Código HTTP (padrão 400)
   * @param {Object} detalhes - Detalhes adicionais do erro
   */
  static error(erro, statusCode = 400, detalhes = null) {
    return {
      statusCode,
      sucesso: false,
      mensagem: erro,
      detalhes
    };
  }

  /**
   * Criar resposta de validação com erros de campo
   * @param {Object} erros - Objeto com erros por campo
   */
  static validationError(erros) {
    return {
      statusCode: 422,
      sucesso: false,
      mensagem: 'Erro de validação',
      erros
    };
  }

  /**
   * Criar resposta de acesso não autorizado
   */
  static unauthorized() {
    return {
      statusCode: 401,
      sucesso: false,
      mensagem: 'Acesso não autorizado'
    };
  }

  /**
   * Criar resposta de recurso não encontrado
   */
  static notFound(recurso = 'Recurso') {
    return {
      statusCode: 404,
      sucesso: false,
      mensagem: `${recurso} não encontrado`
    };
  }

  /**
   * Criar resposta de permissão negada
   */
  static forbidden() {
    return {
      statusCode: 403,
      sucesso: false,
      mensagem: 'Acesso negado'
    };
  }
}

export default ApiResponse;
