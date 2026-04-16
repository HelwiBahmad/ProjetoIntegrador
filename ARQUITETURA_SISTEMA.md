# 🏗️ ARQUITETURA DO SISTEMA - Comunidade em Sinais

## 📐 Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP CLIENT (Browser)                     │
│              HTML5 + CSS3 + JavaScript Vanilla               │
│                  ↑                           ↑                │
└──────────────────┼───────────────────────────┼────────────────┘
                   │                           │
          GET/POST/PUT/DELETE            JSON Response
                   │                           │
┌──────────────────▼───────────────────────────▼────────────────┐
│                     EXPRESS.JS SERVER                          │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ROUTES LAYER                                          │   │
│  │  - Defina endpoints (/api/noticias, /api/eventos)   │   │
│  │  - Middleware (autenticação, CORS, etc)              │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │  CONTROLLERS LAYER                                   │   │
│  │  - Recebem requisição HTTP (req, res)               │   │
│  │  - Delegam ao Service                                │   │
│  │  - Retornam resposta JSON padronizada               │   │
│  │  (NoticiaController, CategoriaController, etc)      │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │  SERVICES LAYER                                      │   │
│  │  - Lógica de negócio (sem req/res)                  │   │
│  │  - Validações                                        │   │
│  │  - Chamadas ao Repository                            │   │
│  │  - Tratamento de erros                               │   │
│  │  (NoticiaService, CategoriaService, etc)            │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │  REPOSITORIES LAYER                                  │   │
│  │  - Abstração do acesso a dados                       │   │
│  │  - Queries SQL parametrizadas                        │   │
│  │  - Relacionamentos (FK, joins)                       │   │
│  │  (NoticiaRepository, CategoriaRepository, etc)      │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │  UTILS LAYER                                         │   │
│  │  - ApiResponse Factory (padronizar respostas)       │   │
│  │  - Helpers e utilitários                             │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│                  DATABASE (SQLite)                         │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │ Usuario      │ Noticia      │ Categoria           │   │
│  │ - id (PK)    │ - id (PK)    │ - id (PK)           │   │
│  │ - email      │ - titulo     │ - nome              │   │
│  │ - senha      │ - categoriaId│ - slug              │   │
│  │ - tipo       │ - autorId    │ - cor               │   │
│  └──────────────┴──────────────┴──────────────────────┘   │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │ Evento       │ Historia     │ Direito             │   │
│  │ - id (PK)    │ - id (PK)    │ - id (PK)           │   │
│  │ - titulo     │ - titulo     │ - titulo            │   │
│  │ - data       │ - usuarioId  │ - categoria         │   │
│  │ - local      │ - aprovado   │ - numeroLei         │   │
│  └──────────────┴──────────────┴──────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Uma Requisição

```
1. CLIENT
   ↓
   GET /api/noticias/refactor?categoria=1&pagina=1
   
2. ROUTES LAYER
   ↓
   router.get('/refactor', NoticiaController.listar)
   
3. CONTROLLER LAYER
   ↓
   static listar(req, res) {
     const filtros = req.query
     const resultado = NoticiaService.buscarTodas(filtros)
     return res.json(ApiResponse.success(resultado))
   }
   
4. SERVICE LAYER
   ↓
   static buscarTodas(filtros) {
     const noticias = NoticiaRepository.buscarTodas(filtros)
     const total = NoticiaRepository.contar()
     return { noticias, total, paginacao }
   }
   
5. REPOSITORY LAYER
   ↓
   static buscarTodas(filtros) {
     let query = 'SELECT * FROM Noticia WHERE publicado = 1'
     if (filtros.categoria) query += ' AND categoriaId = ?'
     return db.prepare(query).all(...params)
   }
   
6. DATABASE
   ↓
   SELECT * FROM Noticia WHERE publicado = 1 AND categoriaId = 1 LIMIT 10 OFFSET 0
   
7. RESPONSE
   ↓
   {
     "sucesso": true,
     "mensagem": "Notícias carregadas",
     "dados": [
       { "id": 1, "titulo": "...", "categoria": 1, ... },
       { "id": 2, "titulo": "...", "categoria": 1, ... }
     ],
     "paginacao": { "total": 50, "pagina": 1, "limite": 10 }
   }
```

---

## 🔄 Padrão MVC Implementado

```
REQUEST
  ↓
ROUTES (Define endpoints)
  ├─ GET    /api/noticias/refactor
  ├─ POST   /api/noticias/refactor
  ├─ PUT    /api/noticias/refactor/:id
  └─ DELETE /api/noticias/refactor/:id
  ↓
CONTROLLERS (Recebe HTTP)
  ├─ NoticiaController.listar(req, res)
  ├─ NoticiaController.criar(req, res)
  ├─ NoticiaController.atualizar(req, res)
  └─ NoticiaController.deletar(req, res)
  ↓
SERVICES (Lógica de negócio)
  ├─ NoticiaService.buscarTodas(filtros)
  ├─ NoticiaService.criar(dados, usuarioId)
  ├─ NoticiaService.atualizar(id, dados)
  └─ NoticiaService.deletar(id, usuarioId)
  ↓
REPOSITORIES (Acesso a dados)
  ├─ NoticiaRepository.buscarTodas(filtros)
  ├─ NoticiaRepository.criar(dados)
  ├─ NoticiaRepository.atualizar(id, dados)
  └─ NoticiaRepository.deletar(id)
  ↓
DATABASE (SQLite)
  └─ Execution
  ↓
RESPONSE (JSON padronizado)
```

---

## 🗄️ Modelo de Dados (ER)

```
┌─────────────────────────────────────┐
│            USUARIO                  │
├─────────────────────────────────────┤
│ id (PK)                  INTEGER    │ ◄─────┐
│ nome                     TEXT       │       │
│ email                    TEXT       │       │
│ senha (hash bcrypt)      TEXT       │       │
│ tipo (leitor|autor|admin) TEXT      │       │
│ avatar                   TEXT       │       │
│ bio                      TEXT       │       │
│ dataCriacao              DATETIME   │       │
│ ativo                    INTEGER    │       │
└─────────────────────────────────────┘       │
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
        ┌───────────▼──────────────────┐              ┌────────────────▼─────────────────┐
        │       NOTICIA                │              │       HISTORIA                   │
        ├───────────────────────────────┤              ├──────────────────────────────────┤
        │ id (PK)             INTEGER  │              │ id (PK)              INTEGER     │
        │ titulo              TEXT      │              │ titulo               TEXT        │
        │ slug (UNIQUE)       TEXT      │              │ conteudo             TEXT        │
        │ resumo              TEXT      │              │ usuarioId (FK) ──────┼──────────│ usuario.id
        │ conteudo            TEXT      │              │ nomeAutor            TEXT        │
        │ imagem              TEXT      │              │ emailAutor           TEXT        │
        │ categoriaId (FK) ───┼─────────┼──────────────┼──────────────┐ cidade  TEXT        │
        │ autorId (FK) ───────┼─────────┼──────────────┼──────────────┤ estado           │
        │ destaque            INTEGER  │              │ aprovado             INTEGER     │
        │ publicado           INTEGER  │              │ publicado            INTEGER     │
        │ dataCriacao         DATETIME │              │ dataCriacao          DATETIME    │
        │ dataAtualizacao     DATETIME │              └──────────────────────────────────┘
        └───────────┬──────────────────┘
                    │
                    │ categoriaId (FK)
                    │
        ┌───────────▼──────────────────┐
        │     CATEGORIA                │
        ├───────────────────────────────┤
        │ id (PK)             INTEGER  │
        │ nome                TEXT      │
        │ slug (UNIQUE)       TEXT      │
        │ descricao           TEXT      │
        │ icone               TEXT      │
        │ cor                 TEXT      │
        │ ativo               INTEGER  │
        └───────────────────────────────┘

        ┌───────────────────────────────┐
        │      EVENTO                   │
        ├───────────────────────────────┤
        │ id (PK)             INTEGER  │
        │ titulo              TEXT      │
        │ descricao           TEXT      │
        │ data                DATE      │
        │ local               TEXT      │
        │ acessibilidade      INTEGER  │
        │ ativo               INTEGER  │
        │ dataCriacao         DATETIME │
        └───────────────────────────────┘

        ┌───────────────────────────────┐
        │      DIREITO                  │
        ├───────────────────────────────┤
        │ id (PK)             INTEGER  │
        │ titulo              TEXT      │
        │ descricao           TEXT      │
        │ numeroLei           TEXT      │
        │ linkOficial         TEXT      │
        │ categoria           TEXT      │
        │ ativo               INTEGER  │
        │ dataCriacao         DATETIME │
        └───────────────────────────────┘
```

**Relacionamentos:**
- Usuario (1) → (N) Noticia (autorId FK)
- Usuario (1) → (N) Historia (usuarioId FK)
- Categoria (1) → (N) Noticia (categoriaId FK)

---

## 📈 Estatísticas de Código

| Métrica | Valor |
|---------|-------|
| **Camadas** | 4 |
| **Módulos** | 5 (Noticias, Categorias, Eventos, Histórias, Direitos) |
| **Controllers** | 5 |
| **Services** | 5 |
| **Repositories** | 5 |
| **Rotas Refatoradas** | 5 sets |
| **Tabelas DB** | 6 |
| **Relacionamentos** | 3 |
| **Design Patterns** | 6 |
| **Princípios SOLID** | 5 |

---

## 🔐 Fluxo de Autenticação

```
1. LOGIN
   POST /api/auth/login
   { email, senha }
   ↓
2. VERIFICAÇÃO
   - Email existe?
   - Senha corresponde? (bcrypt.compare)
   ↓
3. GERAÇÃO DE TOKEN
   JWT.sign({ id, tipo }, JWT_SECRET, { expiresIn: '7d' })
   ↓
4. RESPOSTA
   { token, usuario: { id, nome, tipo } }
   ↓
5. ARMAZENAMENTO (Client)
   localStorage.setItem('token', token)
   ↓
6. USO EM REQUISIÇÕES
   Authorization: Bearer <token>
   ↓
7. VERIFICAÇÃO (Server)
   Middleware verificarToken:
   - Token presente?
   - Token válido?
   - Token expirado?
   ↓
8. AUTORIZAÇÃO
   Middleware verificarAutorOuAdmin:
   - Usuário é autor ou admin?
   ↓
9. ACESSO CONCEDIDO/NEGADO
   200 OK | 401 Unauthorized | 403 Forbidden
```

---

## 🛡️ Segurança Implementada

| Aspecto | Implementação |
|---------|----------------|
| **Autenticação** | JWT com token de 7 dias |
| **Hash de Senha** | bcryptjs com salt 10 |
| **Validação de Email** | Regex + Unique constraint |
| **CORS** | Habilitado com credentials |
| **Queries Parametrizadas** | Proteção contra SQL Injection |
| **Autorização por Perfil** | Middleware por tipo (leitor/autor/admin) |
| **HTTPS Ready** | Cookies HTTP-only quando produção |
| **Rate Limiting** | Implementável via middleware |

