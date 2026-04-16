# 🧪 TESTING GUIDE

## Setup de Testes

### Instalação de Dependências

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  supertest
```

### Configuração Jest

**jest.config.js**
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'servidor/**/*.js',
    'public/js/**/*.js',
    '!node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 1️⃣ TESTES UNITÁRIOS - SERVICES

### Exemplo: NoticiaService

**servidor/__tests__/services/NoticiaService.test.js**

```javascript
import NoticiaService from '../../services/NoticiaService.js';
import NoticiaRepository from '../../repositories/NoticiaRepository.js';

// Mock do Repository
jest.mock('../../repositories/NoticiaRepository.js');

describe('NoticiaService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Teste: Criar notícia com dados válidos
  test('criar() retorna notícia quando dados válidos', async () => {
    // Arrange (Preparar)
    const dadosEntrada = {
      titulo: 'Bitcoin atinge novo recorde',
      conteudo: 'O Bitcoin subiu para $65.000 no mercado internacional...',
      categoriaId: 1
    };
    
    const noticiaEsperada = {
      id: 42,
      titulo: 'Bitcoin atinge novo recorde',
      conteudo: 'O Bitcoin subiu para $65.000...',
      categoriaId: 1,
      autorId: 2,
      dataCriacao: '2024-01-15T10:30:00Z'
    };
    
    NoticiaRepository.criar.mockReturnValue(noticiaEsperada);

    // Act (Agir)
    const resultado = NoticiaService.criar(dadosEntrada);

    // Assert (Validar)
    expect(resultado).toEqual(noticiaEsperada);
    expect(NoticiaRepository.criar).toHaveBeenCalledWith(dadosEntrada);
    expect(resultado.id).toBe(42);
  });

  // ✅ Teste: Validação - Título obrigatório
  test('criar() lança erro quando título vazio', () => {
    const dados = {
      titulo: '',  // Inválido
      conteudo: 'Conteúdo válido',
      categoriaId: 1
    };

    expect(() => NoticiaService.criar(dados)).toThrow('Título obrigatório');
    expect(NoticiaRepository.criar).not.toHaveBeenCalled();
  });

  // ✅ Teste: Validação - Título mínimo
  test('criar() lança erro quando título < 5 caracteres', () => {
    const dados = {
      titulo: 'Test',  // Só 4 caracteres
      conteudo: 'Conteúdo válido com mais de 20 caracteres aqui',
      categoriaId: 1
    };

    expect(() => NoticiaService.criar(dados))
      .toThrow('Mínimo 5 caracteres');
  });

  // ✅ Teste: Validação - Conteúdo mínimo
  test('criar() lança erro quando conteúdo < 20 caracteres', () => {
    const dados = {
      titulo: 'Título válido',
      conteudo: 'Curto',  // Menos de 20
      categoriaId: 1
    };

    expect(() => NoticiaService.criar(dados))
      .toThrow('Mínimo 20 caracteres');
  });

  // ✅ Teste: Buscar existente
  test('buscarPorId() retorna notícia quando existe', () => {
    const idExpected = 1;
    const noticiaEsperada = {
      id: 1,
      titulo: 'Bitcoin atinge novo recorde',
      conteudo: '...'
    };
    
    NoticiaRepository.buscarPorId.mockReturnValue(noticiaEsperada);

    const resultado = NoticiaService.buscarPorId(idExpected);

    expect(resultado).toEqual(noticiaEsperada);
    expect(NoticiaRepository.buscarPorId).toHaveBeenCalledWith(idExpected);
  });

  // ✅ Teste: Buscar não existente
  test('buscarPorId() lança erro quando não encontrada', () => {
    NoticiaRepository.buscarPorId.mockReturnValue(null);

    expect(() => NoticiaService.buscarPorId(999))
      .toThrow('Notícia não encontrada');
  });

  // ✅ Teste: Deletar com sucesso
  test('deletar() retorna sucesso quando deletada', () => {
    const resultado = { linhasAfetadas: 1 };
    NoticiaRepository.deletar.mockReturnValue(resultado);

    const resposta = NoticiaService.deletar(1);

    expect(resposta.linhasAfetadas).toBe(1);
    expect(NoticiaRepository.deletar).toHaveBeenCalledWith(1);
  });

  // ✅ Teste: Deletar inexistente
  test('deletar() lança erro quando não encontrada', () => {
    NoticiaRepository.deletar.mockReturnValue({ linhasAfetadas: 0 });

    expect(() => NoticiaService.deletar(999))
      .toThrow('Notícia não encontrada');
  });
});
```

### Rodando Testes Unitários

```bash
npm test -- NoticiaService.test.js        # Arquivo específico
npm test -- --coverage                    # Com cobertura
npm test -- --watch                       # Watch mode
npm test -- --verbose                     # Detalhado
```

---

## 2️⃣ TESTES INTEGRAÇÃO - CONTROLLERS + API

### Exemplo: NoticiaController com HTTP

**servidor/__tests__/integration/noticias.test.js**

```javascript
import request from 'supertest';
import app from '../../app.js';  // Express app
import db from '../../banco/conexao.js';

describe('POST /api/v2/noticias - Criar Notícia', () => {
  
  let token;
  let usuarioId;

  beforeAll(async () => {
    // Criar usuário de teste
    const stmt = db.prepare(`
      INSERT INTO Usuario (nome, email, senha, tipo) 
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      'Teste User',
      'teste@test.com',
      'hashed_password',
      'autor'
    );
    usuarioId = result.lastInsertRowid;

    // Gerar token
    token = generateJWT(usuarioId, 'autor');
  });

  afterAll(() => {
    // Limpar dados de teste
    db.prepare('DELETE FROM Noticia WHERE autorId = ?').run(usuarioId);
    db.prepare('DELETE FROM Usuario WHERE id = ?').run(usuarioId);
  });

  // ✅ Teste: POST sucesso 201
  test('POST /api/v2/noticias com dados válidos retorna 201', async () => {
    const dados = {
      titulo: 'Notícia de Teste',
      conteudo: 'Conteúdo da notícia com mais de 20 caracteres aqui',
      categoriaId: 1
    };

    const response = await request(app)
      .post('/api/v2/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send(dados)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.titulo).toBe('Notícia de Teste');
    expect(response.body.data.id).toBeDefined();
  });

  // ✅ Teste: POST sem token retorna 401
  test('POST /api/v2/noticias sem token retorna 401', async () => {
    const dados = {
      titulo: 'Notícia',
      conteudo: 'Conteúdo válido'
    };

    const response = await request(app)
      .post('/api/v2/noticias')
      .send(dados)
      .expect(401);

    expect(response.body.status).toBe('unauthorized');
  });

  // ✅ Teste: POST com validação inválida retorna 400
  test('POST /api/v2/noticias com título curto retorna 400', async () => {
    const dados = {
      titulo: 'Bad',  // < 5 caracteres
      conteudo: 'Conteúdo longo o suficiente'
    };

    const response = await request(app)
      .post('/api/v2/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send(dados)
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Mínimo');
  });
});

describe('GET /api/v2/noticias - Listar Notícias', () => {
  
  let token;

  beforeAll(async () => {
    // Setup token
    const response = await request(app)
      .post('/api/autenticacao/login')
      .send({
        email: 'teste@test.com',
        senha: 'senha123'
      });
    
    token = response.body.data.token;
  });

  // ✅ Teste: GET lista notícias
  test('GET /api/v2/noticias retorna array de notícias', async () => {
    const response = await request(app)
      .get('/api/v2/noticias')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toBeDefined();
  });

  // ✅ Teste: GET com filtros
  test('GET /api/v2/noticias?categoriaId=1 filtra por categoria', async () => {
    const response = await request(app)
      .get('/api/v2/noticias?categoriaId=1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Verificar que todas as notícias têm categoriaId = 1
    response.body.data.forEach(noticia => {
      expect(noticia.categoriaId).toBe(1);
    });
  });

  // ✅ Teste: GET por ID
  test('GET /api/v2/noticias/1 retorna notícia específica', async () => {
    const response = await request(app)
      .get('/api/v2/noticias/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.id).toBe(1);
    expect(response.body.data.titulo).toBeDefined();
  });

  // ✅ Teste: GET ID não existe
  test('GET /api/v2/noticias/999 retorna 404', async () => {
    const response = await request(app)
      .get('/api/v2/noticias/999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body.status).toBe('error');
  });
});

describe('PUT /api/v2/noticias/:id - Atualizar Notícia', () => {
  
  let token;
  let noticiaId;

  beforeAll(async () => {
    // Criar notícia de teste
    const stmt = db.prepare(`
      INSERT INTO Noticia (titulo, conteudo, categoriaId, autorId)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run('Original', 'Conteúdo original...', 1, 1);
    noticiaId = result.lastInsertRowid;

    // Setup token
    token = generateJWT(1, 'autor');
  });

  // ✅ Teste: PUT com sucesso
  test('PUT /api/v2/noticias/:id com dados válidos retorna 200', async () => {
    const dados = {
      titulo: 'Título Atualizado',
      conteudo: 'Conteúdo atualizado com mais informação...'
    };

    const response = await request(app)
      .put(`/api/v2/noticias/${noticiaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dados)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.titulo).toBe('Título Atualizado');
  });

  // ✅ Teste: PUT validação falha
  test('PUT /api/v2/noticias/:id com título inválido retorna 400', async () => {
    const dados = {
      titulo: 'Bad'  // < 5 caracteres
    };

    const response = await request(app)
      .put(`/api/v2/noticias/${noticiaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dados)
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});

describe('DELETE /api/v2/noticias/:id - Deletar Notícia', () => {
  
  let token;
  let noticiaId;

  beforeAll(async () => {
    // Setup
    const stmt = db.prepare(`
      INSERT INTO Noticia (titulo, conteudo, categoriaId, autorId)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run('Para Deletar', 'Conteúdo...', 1, 1);
    noticiaId = result.lastInsertRowid;

    token = generateJWT(1, 'autor');
  });

  // ✅ Teste: DELETE sucesso
  test('DELETE /api/v2/noticias/:id com sucesso retorna 200', async () => {
    const response = await request(app)
      .delete(`/api/v2/noticias/${noticiaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.linhasAfetadas).toBe(1);
  });

  // ✅ Teste: DELETE não encontrada
  test('DELETE /api/v2/noticias/999 retorna 404', async () => {
    const response = await request(app)
      .delete('/api/v2/noticias/999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body.status).toBe('error');
  });
});
```

### Rodando Testes de Integração

```bash
npm test -- noticias.test.js --coverage
npm test -- --testMatch="**__tests__/integration/**"
```

---

## 3️⃣ TESTES UNITÁRIOS - UTILS

### Exemplo: ApiResponse Factory

**servidor/__tests__/utils/ApiResponse.test.js**

```javascript
import ApiResponse from '../../utils/ApiResponse.js';

describe('ApiResponse Factory', () => {

  // ✅ Teste: Success response
  test('success() retorna formato esperado', () => {
    const resultado = ApiResponse.success(
      { id: 1, name: 'Test' },
      'Criado com sucesso',
      201
    );

    expect(resultado.status).toBe('success');
    expect(resultado.code).toBe(201);
    expect(resultado.data).toEqual({ id: 1, name: 'Test' });
    expect(resultado.message).toBe('Criado com sucesso');
  });

  // ✅ Teste: Error response
  test('error() retorna formato esperado', () => {
    const resultado = ApiResponse.error('Erro de validação', 400);

    expect(resultado.status).toBe('error');
    expect(resultado.code).toBe(400);
    expect(resultado.message).toBe('Erro de validação');
  });

  // ✅ Teste: Unauthorized
  test('unauthorized() retorna 401', () => {
    const resultado = ApiResponse.unauthorized('Token inválido');

    expect(resultado.status).toBe('unauthorized');
    expect(resultado.code).toBe(401);
  });

  // ✅ Teste: Forbidden
  test('forbidden() retorna 403', () => {
    const resultado = ApiResponse.forbidden('Sem permissão');

    expect(resultado.status).toBe('forbidden');
    expect(resultado.code).toBe(403);
  });

  // ✅ Teste: Validation error com múltiplos erros
  test('validationError() retorna múltiplos erros', () => {
    const resultado = ApiResponse.validationError({
      titulo: 'Campo obrigatório',
      email: 'Email inválido'
    });

    expect(resultado.status).toBe('validationError');
    expect(resultado.code).toBe(400);
    expect(resultado.errors.titulo).toBe('Campo obrigatório');
    expect(resultado.errors.email).toBe('Email inválido');
  });
});
```

---

## 4️⃣ TESTES E2E - FRONTEND

### Exemplo: Testing Componentes Bootstrap

**public/js/__tests__/bootstrap-components.test.js**

```javascript
import { 
  createButton,
  createCard,
  createFormGroup,
  createTable
} from '../bootstrap-components.js';

describe('Bootstrap Components', () => {

  // ✅ Teste: Criar botão
  test('createButton() retorna elemento com classe correta', () => {
    const btn = createButton('Clique', 'primary', { size: 'lg' });

    expect(btn).toBeInstanceOf(HTMLButtonElement);
    expect(btn.classList.contains('btn')).toBe(true);
    expect(btn.classList.contains('btn-primary')).toBe(true);
    expect(btn.classList.contains('btn-lg')).toBe(true);
    expect(btn.textContent).toBe('Clique');
  });

  // ✅ Teste: Criar card
  test('createCard() retorna div com estrutura', () => {
    const card = createCard({
      header: 'Título',
      body: 'Conteúdo',
      footer: 'Rodapé'
    });

    expect(card.classList.contains('card')).toBe(true);
    expect(card.querySelector('.card-header')).toBeTruthy();
    expect(card.querySelector('.card-body')).toBeTruthy();
    expect(card.querySelector('.card-footer')).toBeTruthy();
  });

  // ✅ Teste: Criar formulário
  test('createFormGroup() retorna input com label', () => {
    const form = createFormGroup({
      label: 'Email',
      type: 'email',
      name: 'email'
    });

    expect(form.querySelector('label')).toBeTruthy();
    expect(form.querySelector('input')).toBeTruthy();
    expect(form.querySelector('input').type).toBe('email');
  });

  // ✅ Teste: Criar tabela
  test('createTable() retorna table HTML', () => {
    const dados = [
      { name: 'Item 1', value: 100 },
      { name: 'Item 2', value: 200 }
    ];

    const table = createTable(dados);

    expect(table).toBeInstanceOf(HTMLTableElement);
    expect(table.querySelectorAll('tr').length).toBeGreaterThan(0);
  });
});
```

---

## 5️⃣ COBERTURA DE TESTES

### Executar Cobertura

```bash
npm test -- --coverage
```

**Output esperado:**
```
PASS  servidor/__tests__/services/NoticiaService.test.js
PASS  servidor/__tests__/integration/noticias.test.js
PASS  public/js/__tests__/bootstrap-components.test.js

Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        3.582 s
Coverage summary for untested files
├─ Lines:       82.5% (165/200)
├─ Statements:  82.5% (165/200)
├─ Functions:   80.2% (41/51)
└─ Branches:    75.8% (209/275)
```

### Badge Coverage
```markdown
[![Coverage Status](coverage/badge.svg)](coverage/)
```

---

## 6️⃣ CI/CD - GitHub Actions

**.github/workflows/test.yml**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test -- --coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

---

## 7️⃣ CHECKLIST PRÉ-MERGE

- ✅ Todos os testes passam (`npm test`)
- ✅ Cobertura acima de 80% (`npm test -- --coverage`)
- ✅ Sem lint errors (`npm run lint`)
- ✅ Build sem erros (`npm run build`)
- ✅ Integração manual testada no navegador
- ✅ Documentação atualizada

---

## 📊 Áreas de Teste Recomendadas

| Área | Tipo | Prioridade | Status |
|------|------|-----------|--------|
| NoticiaService | Unit | 🔴 Alta | ✅ Implementado |
| CategoriaService | Unit | 🔴 Alta | ✅ Implementado |
| EventoService | Unit | 🔴 Alta | ⏳ Pendente |
| HistoriaService | Unit | 🔴 Alta | ⏳ Pendente |
| Autenticação | Integration | 🔴 Alta | ✅ Implementado |
| Autorização | Integration | 🔴 Alta | ⏳ Pendente |
| Bootstrap Components | E2E | 🟡 Média | ⏳ Pendente |
| UI Estados | E2E | 🟡 Média | ⏳ Pendente |
| API Errors | Integration | 🟡 Média | ⏳ Pendente |

---

## Comandos Úteis

```bash
# Rodar testes uma vez
npm test

# Modo watch (rerun ao salvar)
npm test -- --watch

# Teste específico
npm test -- NoticiaService

# Com cobertura
npm test -- --coverage

# Cobertura detalhada
npm test -- --coverage --collectCoverageFrom="src/**"

# Verbose output
npm test -- --verbose

# Update snapshots (se usar snapshots)
npm test -- -u
```

