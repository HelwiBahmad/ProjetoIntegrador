/**
 * Repository Pattern para Histórias
 */

import db from '../banco/conexao.js';

class HistoriaRepository {
  static buscarTodas(filtros = {}) {
    const { pagina = 1, limite = 10 } = filtros;
    const offset = (pagina - 1) * limite;

    const stmt = db.prepare(`
      SELECT h.id, h.titulo, h.conteudo, h.cidade, h.estado, h.dataCriacao,
        COALESCE(u.nome, h.nomeAutor) as autorNome
      FROM Historia h
      LEFT JOIN Usuario u ON h.usuarioId = u.id
      WHERE h.publicado = 1 AND h.aprovado = 1
      ORDER BY h.dataCriacao DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limite, offset);
  }

  static buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT h.id, h.titulo, h.conteudo, h.cidade, h.estado, h.dataCriacao,
        COALESCE(u.nome, h.nomeAutor) as autorNome
      FROM Historia h
      LEFT JOIN Usuario u ON h.usuarioId = u.id
      WHERE h.id = ? AND h.publicado = 1 AND h.aprovado = 1
    `);
    return stmt.get(id);
  }

  static buscarPendenteAprovacao() {
    const stmt = db.prepare(`
      SELECT h.id, h.titulo, h.conteudo, h.cidade, h.estado, h.dataCriacao,
        COALESCE(u.nome, h.nomeAutor) as autorNome, h.aprovado
      FROM Historia h
      LEFT JOIN Usuario u ON h.usuarioId = u.id
      WHERE h.aprovado = 0
      ORDER BY h.dataCriacao ASC
    `);
    return stmt.all();
  }

  static criar(dados) {
    const { titulo, conteudo, usuarioId, nomeAutor, emailAutor, cidade, estado } = dados;
    const stmt = db.prepare(`
      INSERT INTO Historia (titulo, conteudo, usuarioId, nomeAutor, emailAutor, cidade, estado, aprovado, publicado, dataCriacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)
    `);
    const resultado = stmt.run(titulo, conteudo, usuarioId || null, nomeAutor, emailAutor, cidade, estado);
    return resultado.lastInsertRowid;
  }

  static aprovar(id) {
    const stmt = db.prepare('UPDATE Historia SET aprovado = 1, publicado = 1 WHERE id = ?');
    return stmt.run(id);
  }

  static rejeitar(id) {
    const stmt = db.prepare('UPDATE Historia SET aprovado = -1 WHERE id = ?');
    return stmt.run(id);
  }

  static deletar(id) {
    const stmt = db.prepare('DELETE FROM Historia WHERE id = ?');
    return stmt.run(id);
  }

  static contar() {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM Historia WHERE publicado = 1 AND aprovado = 1');
    return stmt.get().total;
  }

  static contarPendentes() {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM Historia WHERE aprovado = 0');
    return stmt.get().total;
  }
}

export default HistoriaRepository;
