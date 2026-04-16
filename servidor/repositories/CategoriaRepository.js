/**
 * Repository Pattern para Categorias
 */

import db from '../banco/conexao.js';

class CategoriaRepository {
  static buscarTodas() {
    const stmt = db.prepare(`
      SELECT 
        c.*,
        COUNT(n.id) as totalNoticias
      FROM Categoria c
      LEFT JOIN Noticia n ON c.id = n.categoriaId AND n.publicado = 1
      WHERE c.ativo = 1
      GROUP BY c.id
      ORDER BY c.nome
    `);
    return stmt.all();
  }

  static buscarPorSlug(slug) {
    const stmt = db.prepare('SELECT * FROM Categoria WHERE slug = ? AND ativo = 1');
    return stmt.get(slug);
  }

  static buscarPorId(id) {
    const stmt = db.prepare('SELECT * FROM Categoria WHERE id = ? AND ativo = 1');
    return stmt.get(id);
  }

  static buscarNoticiasCategoria(categoriaId, limite, offset) {
    const stmt = db.prepare(`
      SELECT 
        n.id, n.titulo, n.slug, n.resumo, n.imagem, n.dataCriacao,
        u.nome as autorNome
      FROM Noticia n
      JOIN Usuario u ON n.autorId = u.id
      WHERE n.categoriaId = ? AND n.publicado = 1
      ORDER BY n.dataCriacao DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(categoriaId, limite, offset);
  }

  static contarNoticiasCategoria(categoriaId) {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM Noticia WHERE categoriaId = ? AND publicado = 1');
    return stmt.get(categoriaId).total;
  }

  static criar(dados) {
    const { nome, slug, descricao, cor } = dados;
    const stmt = db.prepare(`
      INSERT INTO Categoria (nome, slug, descricao, cor, ativo)
      VALUES (?, ?, ?, ?, 1)
    `);
    const resultado = stmt.run(nome, slug, descricao, cor);
    return this.buscarPorId(resultado.lastInsertRowid);
  }

  static atualizar(id, dados) {
    const { nome, slug, descricao, cor } = dados;
    const stmt = db.prepare(`
      UPDATE Categoria 
      SET nome = ?, slug = ?, descricao = ?, cor = ?
      WHERE id = ?
    `);
    stmt.run(nome, slug, descricao, cor, id);
    return this.buscarPorId(id);
  }

  static deletar(id) {
    const stmt = db.prepare('UPDATE Categoria SET ativo = 0 WHERE id = ?');
    return stmt.run(id);
  }
}

export default CategoriaRepository;
