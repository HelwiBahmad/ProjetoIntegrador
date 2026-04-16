/**
 * Repository Pattern para Eventos
 */

import db from '../banco/conexao.js';

class EventoRepository {
  static buscarProximos(limite = 20) {
    const stmt = db.prepare(`
      SELECT * FROM Evento 
      WHERE ativo = 1 AND data >= date('now')
      ORDER BY data ASC
      LIMIT ?
    `);
    return stmt.all(limite);
  }

  static buscarPassados(limite = 20) {
    const stmt = db.prepare(`
      SELECT * FROM Evento 
      WHERE ativo = 1 AND data < date('now')
      ORDER BY data DESC
      LIMIT ?
    `);
    return stmt.all(limite);
  }

  static buscarPorId(id) {
    const stmt = db.prepare('SELECT * FROM Evento WHERE id = ? AND ativo = 1');
    return stmt.get(id);
  }

  static buscarTodos(limite = 50) {
    const stmt = db.prepare(`
      SELECT * FROM Evento 
      WHERE ativo = 1
      ORDER BY data DESC
      LIMIT ?
    `);
    return stmt.all(limite);
  }

  static criar(dados) {
    const { titulo, descricao, data, local, acessibilidade } = dados;
    const stmt = db.prepare(`
      INSERT INTO Evento (titulo, descricao, data, local, acessibilidade, ativo, dataCriacao)
      VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `);
    const resultado = stmt.run(titulo, descricao, data, local, acessibilidade ? 1 : 0);
    return this.buscarPorId(resultado.lastInsertRowid);
  }

  static atualizar(id, dados) {
    const { titulo, descricao, data, local, acessibilidade } = dados;
    const stmt = db.prepare(`
      UPDATE Evento 
      SET titulo = ?, descricao = ?, data = ?, local = ?, acessibilidade = ?
      WHERE id = ?
    `);
    stmt.run(titulo, descricao, data, local, acessibilidade ? 1 : 0, id);
    return this.buscarPorId(id);
  }

  static deletar(id) {
    const stmt = db.prepare('UPDATE Evento SET ativo = 0 WHERE id = ?');
    return stmt.run(id);
  }

  static contar() {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM Evento WHERE ativo = 1');
    return stmt.get().total;
  }
}

export default EventoRepository;
