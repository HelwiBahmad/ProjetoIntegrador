/**
 * Repository Pattern para Notícias
 * Responsabilidade: Abstração do acesso aos dados
 * Benefício: Isola a lógica de negócio da camada de persistência
 */

import db from '../banco/conexao.js';

class NoticiaRepository {
  /**
   * Buscar todas as notícias com filtros
   */
  static buscarTodas(filtros = {}) {
    const { categoria, destaque, pagina = 1, limite = 10 } = filtros;
    let query = 'SELECT * FROM Noticia WHERE publicado = 1';
    const params = [];

    if (categoria) {
      query += ' AND categoriaId = ?';
      params.push(categoria);
    }

    if (destaque !== undefined) {
      query += ' AND destaque = ?';
      params.push(destaque ? 1 : 0);
    }

    // Ordenação
    query += ' ORDER BY dataCriacao DESC';

    // Paginação
    const offset = (pagina - 1) * limite;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limite, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Buscar notícia por ID
   */
  static buscarPorId(id) {
    const stmt = db.prepare('SELECT * FROM Noticia WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Buscar notícia por slug
   */
  static buscarPorSlug(slug) {
    const stmt = db.prepare('SELECT * FROM Noticia WHERE slug = ?');
    return stmt.get(slug);
  }

  /**
   * Criar nova notícia
   */
  static criar(dados) {
    const { titulo, slug, resumo, conteudo, categoriaId, autorId, imagem } = dados;
    const stmt = db.prepare(`
      INSERT INTO Noticia (titulo, slug, resumo, conteudo, categoriaId, autorId, imagem, publicado, dataCriacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `);
    
    const resultado = stmt.run(titulo, slug, resumo, conteudo, categoriaId, autorId, imagem);
    return this.buscarPorId(resultado.lastInsertRowid);
  }

  /**
   * Atualizar notícia
   */
  static atualizar(id, dados) {
    const { titulo, resumo, conteudo, categoriaId, imagem, destaque } = dados;
    const stmt = db.prepare(`
      UPDATE Noticia 
      SET titulo = ?, resumo = ?, conteudo = ?, categoriaId = ?, imagem = ?, destaque = ?, dataAtualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(titulo, resumo, conteudo, categoriaId, imagem, destaque ? 1 : 0, id);
    return this.buscarPorId(id);
  }

  /**
   * Deletar notícia
   */
  static deletar(id) {
    const stmt = db.prepare('DELETE FROM Noticia WHERE id = ?');
    return stmt.run(id);
  }

  /**
   * Contar total de notícias published
   */
  static contar() {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM Noticia WHERE publicado = 1');
    return stmt.get().total;
  }

  /**
   * Buscar notícias do usuário
   */
  static buscarPorAutor(autorId, pagina = 1, limite = 10) {
    const offset = (pagina - 1) * limite;
    const stmt = db.prepare(`
      SELECT * FROM Noticia 
      WHERE autorId = ? 
      ORDER BY dataCriacao DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(autorId, limite, offset);
  }
}

export default NoticiaRepository;
