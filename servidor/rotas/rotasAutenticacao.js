import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../banco/conexao.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'comunidade-em-sinais-secret-key-2024';

// Middleware para verificar token JWT
export function verificarToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: 'Acesso não autorizado. Faça login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Middleware para verificar se é autor ou admin
export function verificarAutorOuAdmin(req, res, next) {
  if (req.usuario.tipo !== 'autor' && req.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas autores e administradores.' });
  }
  next();
}

// Middleware para verificar se é admin
export function verificarAdmin(req, res, next) {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

// Função para validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Função para validar senha
function validarSenha(senha) {
  if (senha.length < 6) return false;
  return true;
}

// POST /api/auth/cadastro - Cadastrar novo usuário
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      return res.status(400).json({ erro: 'Nome, email, senha e confirmação são obrigatórios.' });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ erro: 'Email inválido.' });
    }

    if (!validarSenha(senha)) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({ erro: 'As senhas não conferem.' });
    }

    if (nome.trim().length < 3) {
      return res.status(400).json({ erro: 'O nome deve ter pelo menos 3 caracteres.' });
    }

    // Verificar se email já existe
    const usuarioExistente = db.prepare('SELECT id FROM Usuario WHERE email = ?').get(email);
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Este email já está cadastrado.' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const result = db.prepare(`
      INSERT INTO Usuario (nome, email, senha, tipo)
      VALUES (?, ?, ?, 'leitor')
    `).run(nome.trim(), email.toLowerCase(), senhaHash);

    // Buscar usuário criado
    const novoUsuario = db.prepare('SELECT id, nome, email, tipo, dataCriacao FROM Usuario WHERE id = ?').get(result.lastInsertRowid);

    // Gerar token
    const token = jwt.sign(
      { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email, tipo: novoUsuario.tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Definir cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      usuario: novoUsuario,
      token
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// POST /api/auth/login - Fazer login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    // Buscar usuário
    const usuario = db.prepare('SELECT * FROM Usuario WHERE email = ? AND ativo = 1').get(email);
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Definir cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Retornar sem a senha
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      mensagem: 'Login realizado com sucesso!',
      usuario: usuarioSemSenha,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// POST /api/auth/logout - Fazer logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ mensagem: 'Logout realizado com sucesso!' });
});

// GET /api/auth/me - Obter usuário logado
router.get('/me', verificarToken, (req, res) => {
  try {
    const usuario = db.prepare('SELECT id, nome, email, tipo, avatar, bio, dataCriacao FROM Usuario WHERE id = ?').get(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ usuario });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// PUT /api/auth/perfil - Atualizar perfil
router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const { nome, bio, senhaAtual, novaSenha } = req.body;
    const usuarioId = req.usuario.id;

    // Se quiser mudar a senha
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ erro: 'Senha atual é obrigatória para alterar a senha.' });
      }

      const usuario = db.prepare('SELECT senha FROM Usuario WHERE id = ?').get(usuarioId);
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Senha atual incorreta.' });
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
      db.prepare('UPDATE Usuario SET senha = ? WHERE id = ?').run(novaSenhaHash, usuarioId);
    }

    // Atualizar nome e bio
    if (nome || bio !== undefined) {
      db.prepare('UPDATE Usuario SET nome = COALESCE(?, nome), bio = COALESCE(?, bio) WHERE id = ?')
        .run(nome || null, bio !== undefined ? bio : null, usuarioId);
    }

    const usuarioAtualizado = db.prepare('SELECT id, nome, email, tipo, avatar, bio FROM Usuario WHERE id = ?').get(usuarioId);

    res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario: usuarioAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// GET /api/auth/usuarios - Listar todos os usuários (apenas admin)
router.get('/usuarios/listar', verificarToken, verificarAdmin, (req, res) => {
  try {
    const usuarios = db.prepare(`
      SELECT id, nome, email, tipo, dataCriacao, ativo
      FROM Usuario
      ORDER BY dataCriacao DESC
    `).all();

    res.json({ usuarios });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// PUT /api/auth/usuarios/:id/tipo - Mudar tipo de usuário (apenas admin)
router.put('/usuarios/:id/tipo', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    if (!['leitor', 'autor', 'admin'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo de usuário inválido.' });
    }

    const usuario = db.prepare('SELECT id FROM Usuario WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    db.prepare('UPDATE Usuario SET tipo = ? WHERE id = ?').run(tipo, id);

    res.json({ mensagem: `Usuário promovido para ${tipo} com sucesso!` });
  } catch (error) {
    console.error('Erro ao atualizar tipo de usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

export default router;
