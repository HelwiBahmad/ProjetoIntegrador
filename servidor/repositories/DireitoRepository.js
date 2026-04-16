/**
 * Repository Pattern para Direitos
 */

import db from '../banco/conexao.js';

class DireitoRepository {
  static buscarTodos(filtros = {}) {
    const { categoria, pagina = 1, limite = 10 } = filtros;
    let query = 'SELECT * FROM Direito WHERE ativo = 1';
    let params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY dataCriacao DESC LIMIT ? OFFSET ?';
    
    const offset = (pagina - 1) * limite;
    params.push(limite, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static buscarPorId(id) {
    const stmt = db.prepare('SELECT * FROM Direito WHERE id = ? AND ativo = 1');
    return stmt.get(id);
  }

  static buscarPorCategoria(categoria) {
    const stmt = db.prepare('SELECT * FROM Direito WHERE categoria = ? AND ativo = 1 ORDER BY dataCriacao DESC');
    return stmt.all(categoria);
  }

  static buscarCategorias() {
    const stmt = db.prepare(`
      SELECT DISTINCT categoria 
      FROM Direito 
      WHERE ativo = 1 
      ORDER BY categoria
    `);
    return stmt.all();
  }

  static criar(dados) {
    const { titulo, descricao, numeroLei, linkOficial, categoria } = dados;
    const stmt = db.prepare(`
      INSERT INTO Direito (titulo, descricao, numeroLei, linkOficial, categoria, ativo, dataCriacao)
      VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `);
    const resultado = stmt.run(titulo, descricao, numeroLei, linkOficial, categoria);
    return this.buscarPorId(resultado.lastInsertRowid);
  }

  static atualizar(id, dados) {
    const { titulo, descricao, numeroLei, linkOficial, categoria } = dados;
    const stmt = db.prepare(`
      UPDATE Direito 
      SET titulo = ?, descricao = ?, numeroLei = ?, linkOficial = ?, categoria = ?
      WHERE id = ?
    `);
    stmt.run(titulo, descricao, numeroLei, linkOficial, categoria, id);
    return this.buscarPorId(id);
  }

  static deletar(id) {
    const stmt = db.prepare('UPDATE Direito SET ativo = 0 WHERE id = ?');
    return stmt.run(id);
  }

  static contar() {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM Direito WHERE ativo = 1');
    return stmt.get().total;
  }
}

export default DireitoRepository;
