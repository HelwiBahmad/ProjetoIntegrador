# 🎯 DESIGN PATTERNS IMPLEMENTADOS

## 1. Repository Pattern ⭐⭐⭐

### Categoria
**Padrão:** Estrutural  
**Problema:** Isolar lógica de dados da lógica de negócio. Se mudar de SQLite para PostgreSQL, só muda o Repository.  
**Benefício:** Services não conhecem SQLite, fácil testar, trocar banco sem quebrar código.

**Implementação:**
```javascript
// servidor/repositories/NoticiaRepository.js

class NoticiaRepository {
  static buscarTodas(filtros = {}) {
    const { categoria, pagina = 1, limite = 10 } = filtros;
    let query = 'SELECT * FROM Noticia WHERE publicado = 1';
    let params = [];
    
    if (categoria) {
      query += ' AND categoriaId = ?';
      params.push(categoria);
    }
    
    const offset = (pagina - 1) * limite;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limite, offset);
    
    const stmt = db.prepare(query);
    return stmt.all(...params);  // Parametrizado = seguro contra SQL Injection
  }
  
  static criar(dados) {
    const stmt = db.prepare(`
      INSERT INTO Noticia (titulo, slug, resumo, conteudo, categoriaId, autorId, publicado)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const resultado = stmt.run(...Object.values(dados));
    return this.buscarPorId(resultado.lastInsertRowid);
  }
}
```

**Como o Service Usa:**
```javascript
// servidor/services/NoticiaService.js

class NoticiaService {
  static buscarTodas(filtros = {}) {
    try {
      const noticias = NoticiaRepository.buscarTodas(filtros);  // ← Depende do Repository
      return { sucesso: true, noticias };
    } catch (erro) {
      throw new Error(`Erro ao buscar notícias: ${erro.message}`);
    }
  }
}
```

**Vantagem:** Se precisar mudar para MongoDB:
```javascript
// Muda só aqui:
class NoticiaRepository {
  static buscarTodas(filtros) {
    return db.collection('noticias').find({ publicado: true }).toArray();
  }
}

// Service continua igual!
```

---

## 2. Service Layer Pattern ⭐⭐⭐

### Categoria
**Padrão:** Arquitetural  
**Problema:** Lógica de negócio misturada com HTTP request/response é difícil testar e reutilizar.  
**Benefício:** Lógica pura, testável, reutilizável em CLI, WebSocket, gRPC, etc.

**Implementação:**
```javascript
// servidor/services/NoticiaService.js

class NoticiaService {
  // NEM RECEBE req/res - só dados puros
  static criar(dados, usuarioId) {
    // VALIDAÇÕES
    if (!dados.titulo || dados.titulo.trim() === '') {
      throw new Error('Título é obrigatório');  // ← Erro puro
    }
    
    if (dados.titulo.trim().length < 5) {
      throw new Error('Título deve ter pelo menos 5 caracteres');
    }
    
    // LÓGICA DE NEGÓCIO
    const existente = NoticiaRepository.buscarPorSlug(dados.slug);
    if (existente) {
      throw new Error('Slug já existe');  // ← Regra de negócio
    }
    
    // CHAMADA REPOSITORY
    const noticia = NoticiaRepository.criar({
      ...dados,
      autorId: usuarioId
    });
    
    return noticia;  // ← Retorna dado puro
  }
}
```

**Uso no Controller:**
```javascript
// servidor/controllers/NoticiaController.js

class NoticiaController {
  static criar(req, res) {
    try {
      // Validação HTTP (autenticação)
      if (!req.usuario) {
        return res.status(401).json(ApiResponse.unauthorized());
      }
      
      // Chama Service (lógica pura)
      const noticia = NoticiaService.criar(req.body, req.usuario.id);
      
      // Formata resposta HTTP
      return res.status(201).json(
        ApiResponse.success(noticia, 'Notícia criada', 201)
      );
    } catch (erro) {
      // Converte erro puro em resposta HTTP
      return res.status(400).json(
        ApiResponse.error(erro.message, 400)
      );
    }
  }
}
```

**Vantagem - Testar sem HTTP:**
```javascript
// test/noticia.test.js
const service = NoticiaService;

test('criar notícia sem título deve falhar', () => {
  expect(() => {
    service.criar({ conteudo: 'Teste' }, 1);
  }).toThrow('Título é obrigatório');
});

// Teste puro, sem mock de req/res!
```

---

## 3. Controller Pattern ⭐⭐

### Categoria
**Padrão:** Estrutural  
**Problema:** Rotas com lógica complexa são difíceis de manter.  
**Benefício:** Controllers isolam lógica HTTP, rotas ficam limpas.

**Implementação:**
```javascript
// servidor/rotas/rotasNoticiasRefator.js

router.get('/refactor', NoticiaController.listar);
router.post('/refactor', verificarToken, NoticiaController.criar);
router.put('/refactor/:id', verificarToken, NoticiaController.atualizar);
router.delete('/refactor/:id', verificarToken, NoticiaController.deletar);

// Rotas limpas - lógica está no Controller
```

```javascript
// servidor/controllers/NoticiaController.js

class NoticiaController {
  static listar(req, res) {
    try {
      const filtros = {
        categoria: req.query.categoria,
        destaque: req.query.destaque,
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 10
      };
      
      const resultado = NoticiaService.buscarTodas(filtros);
      return res.status(200).json(ApiResponse.success(resultado));
    } catch (erro) {
      return res.status(500).json(ApiResponse.error(erro.message, 500));
    }
  }
  
  static criar(req, res) {
    try {
      if (!req.usuario) {
        return res.status(401).json(ApiResponse.unauthorized());
      }
      
      const noticia = NoticiaService.criar(req.body, req.usuario.id);
      return res.status(201).json(ApiResponse.success(noticia, '', 201));
    } catch (erro) {
      return res.status(400).json(ApiResponse.error(erro.message, 400));
    }
  }
}
```

---

## 4. Factory Pattern ⭐⭐

### Categoria
**Padrão:** Criacional  
**Problema:** Respostas da API variam (sucesso, erro, validação) → difícil manter consistência.  
**Benefício:** Factory padroniza todas as respostas, cliente sabe exatamente o que esperar.

**Implementação:**
```javascript
// servidor/utils/ApiResponse.js

class ApiResponse {
  static success(data, mensagem = 'Sucesso', statusCode = 200) {
    return {
      statusCode,
      sucesso: true,
      mensagem,
      dados: data
    };
  }
  
  static error(erro, statusCode = 400, detalhes = null) {
    return {
      statusCode,
      sucesso: false,
      mensagem: erro,
      detalhes
    };
  }
  
  static validationError(erros) {
    return {
      statusCode: 422,
      sucesso: false,
      mensagem: 'Erro de validação',
      erros  // { campo: mensagem, ... }
    };
  }
  
  static unauthorized() {
    return {
      statusCode: 401,
      sucesso: false,
      mensagem: 'Acesso não autorizado'
    };
  }
}
```

**Uso:**
```javascript
// Antes (sem pattern):
res.json({ ok: true, data: noticia });          // Inconsistente
res.json({ error: 'Erro!', code: 400 });        // Diferente
res.status(401).send('Unauthorized');           // Mais inconsistente

// Depois (com Factory):
res.json(ApiResponse.success(noticia));         // Padronizado
res.json(ApiResponse.error('Erro!'));           // Padronizado
res.json(ApiResponse.unauthorized());           // Padronizado

// Cliente sempre recebe:
// { statusCode, sucesso, mensagem, dados/detalhes }
```

---

## 5. Middleware Pattern ⭐⭐⭐

### Categoria
**Padrão:** Comportamental  
**Problema:** Verificar autenticação em toda rota é repetitivo.  
**Benefício:** Middleware centraliza, reutilizável, fácil manter.

**Implementação:**
```javascript
// servidor/rotas/rotasAutenticacao.js

export function verificarToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json(ApiResponse.unauthorized());
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;  // ← Passa usuário para próximo middleware
    next();
  } catch (error) {
    return res.status(401).json(ApiResponse.unauthorized());
  }
}

export function verificarAutorOuAdmin(req, res, next) {
  if (!['autor', 'admin'].includes(req.usuario.tipo)) {
    return res.status(403).json(ApiResponse.forbidden());
  }
  next();
}
```

**Uso:**
```javascript
// Rotas protegidas
router.post('/refactor', verificarToken, verificarAutorOuAdmin, NoticiaController.criar);
//                       ↑                  ↑
//                   1º middleware      2º middleware
//                   (autenticação)     (autorização)

// Fluxo:
// Request → verificarToken → verificarAutorOuAdmin → Controller → Response
```

---

## 6. Observer Pattern ⭐

### Categoria
**Padrão:** Comportamental  
**Problema:** UI precisa reagir a eventos (loading, sucesso, erro).  
**Benefício:** Desacopla UI da lógica, componentes "observam" eventos.

**Implementação (Front-end):**
```javascript
// public/js/bootstrap-ui.js

class BootstrapUI {
  static showToast(message, type = 'success') {
    // Cria e mostra elemento
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type}`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    // Observer: auto-remove após 3 segundos
    setTimeout(() => toast.remove(), 3000);
  }
  
  static showConfirmation(title, message, onConfirm) {
    // Cria modal
    const modal = this.createConfirmationModal(title, message);
    
    // Observer: ao clicar confirmar
    modal.querySelector('#confirm-btn').addEventListener('click', onConfirm);
    
    // Observer: ao fechar
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  }
}
```

**Uso:**
```javascript
// Componente observer que "vê" ações do usuário
async function enviarNoticias(dados) {
  try {
    BootstrapUI.showSpinner();  // Notifica "começou"
    
    const response = await fetch('/api/noticias/refactor', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    
    BootstrapUI.hideSpinner();  // Notifica "terminou"
    
    if (response.ok) {
      BootstrapUI.showToast('Sucesso!', 'success');  // Notifica "OK"
    } else {
      BootstrapUI.showToast('Erro!', 'error');  // Notifica "erro"
    }
  } catch (erro) {
    BootstrapUI.hideSpinner();
    BootstrapUI.showToast(erro.message, 'error');
  }
}
```

---

## 📊 Resumo dos Patterns

| Pattern | Tipo | Arquivo | Benefício |
|---------|------|---------|-----------|
| **Repository** | Estrutural | `repositories/*.js` | Isolação de dados |
| **Service** | Arquitetural | `services/*.js` | Lógica testável |
| **Controller** | Estrutural | `controllers/*.js` | HTTP desacoplado |
| **Factory** | Criacional | `utils/ApiResponse.js` | Respostas padronizadas |
| **Middleware** | Comportamental | `rotas/rotasAutenticacao.js` | Autenticação reutilizável |
| **Observer** | Comportamental | `public/js/bootstrap-ui.js` | UI reativa |

---

## 🔗 Relacionamento entre Patterns

```
Router (define endpoints)
  ↓
Middleware (verificarToken) ← Middleware Pattern
  ↓
Controller ← Controller Pattern
  ├─ Valida req.body
  └─ Chama Service
  
Service ← Service Layer Pattern
  ├─ Valida lógica de negócio
  └─ Chama Repository
  
Repository ← Repository Pattern
  ├─ Constrói query SQL
  └─ Retorna dados
  
Response ← Factory Pattern
  ├─ ApiResponse.success()
  ├─ ApiResponse.error()
  └─ ApiResponse.unauthorized()
  
UI ← Observer Pattern
  ├─ showSpinner()
  ├─ showToast()
  └─ showConfirmation()
```

