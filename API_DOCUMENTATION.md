# 📚 API DOCUMENTATION

## Base URL
```
http://localhost:3000
```

---

## 🔐 AUTHENTICATION

### JWT Token
- **Type**: Bearer Token
- **Expiration**: 7 days
- **Header**: `Authorization: Bearer <token>`
- **Issued on**: Registration or Login

### Authorization Header
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3000/api/endpoint
```

---

## 👤 ENDPOINTS - AUTENTICAÇÃO

### 1. Register
```http
POST /api/autenticacao/registrar
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "password123",
  "tipo": "leitor"  # Can be: leitor, autor, admin
}
```

**Response 201 (Success)**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "tipo": "leitor"
  },
  "message": "Usuário criado com sucesso"
}
```

**Response 400 (Validation Error)**
```json
{
  "status": "error",
  "code": 400,
  "message": "Email já cadastrado"
}
```

---

### 2. Login
```http
POST /api/autenticacao/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "password123"
}
```

**Response 200 (Success)**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "token": "eyJhbGc...",
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@example.com",
      "tipo": "leitor"
    }
  },
  "message": "Login realizado"
}
```

**Response 401 (Unauthorized)**
```json
{
  "status": "unauthorized",
  "code": 401,
  "message": "Email ou senha inválidos"
}
```

---

### 3. Validate Token
```http
GET /api/autenticacao/validar
Authorization: Bearer <token>
```

**Response 200 (Valid Token)**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "tipo": "leitor"
  },
  "message": "Token válido"
}
```

**Response 401 (Invalid Token)**
```json
{
  "status": "unauthorized",
  "code": 401,
  "message": "Token inválido ou expirado"
}
```

---

## 📰 ENDPOINTS - NOTÍCIAS

### ✅ REFACTORED ROUTES (Recommended)

### 1. Get All News
```http
GET /api/v2/noticias
Authorization: Bearer <token>
```

**Query Parameters**
```
?page=1&limit=10&categoria=1&search=bitcoin
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "titulo": "Bitcoin atinge novo recorde",
      "conteudo": "O Bitcoin subiu para $65.000...",
      "categoriaId": 1,
      "autorId": 2,
      "dataCriacao": "2024-01-15T10:30:00Z",
      "dataAtualizacao": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  },
  "message": "Notícias recuperadas"
}
```

---

### 2. Get News by ID
```http
GET /api/v2/noticias/:id
Authorization: Bearer <token>
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "titulo": "Bitcoin atinge novo recorde",
    "conteudo": "O Bitcoin subiu para $65.000...",
    "categoriaId": 1,
    "autorId": 2,
    "dataCriacao": "2024-01-15T10:30:00Z"
  },
  "message": "Notícia encontrada"
}
```

---

### 3. Create News
```http
POST /api/v2/noticias
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Novo evento de tecnologia",
  "conteudo": "Descrição detalhada do evento...",
  "categoriaId": 1
}
```

**Requirements**
- Logged in as `autor` or `admin`
- Título: min 5 characters
- Conteúdo: min 20 characters
- Categoria: must exist

**Response 201**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 51,
    "titulo": "Novo evento de tecnologia",
    "conteudo": "Descrição detalhada...",
    "categoriaId": 1,
    "autorId": 2,
    "dataCriacao": "2024-01-20T14:30:00Z"
  },
  "message": "Notícia criada com sucesso"
}
```

**Response 403 (Forbidden)**
```json
{
  "status": "forbidden",
  "code": 403,
  "message": "Apenas autores podem criar notícias"
}
```

---

### 4. Update News
```http
PUT /api/v2/noticias/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Novo título atualizado",
  "conteudo": "Conteúdo atualizado...",
  "categoriaId": 2
}
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "titulo": "Novo título atualizado",
    "conteudo": "Conteúdo atualizado...",
    "categoriaId": 2,
    "dataAtualizacao": "2024-01-20T15:45:00Z"
  },
  "message": "Notícia atualizada com sucesso"
}
```

---

### 5. Delete News
```http
DELETE /api/v2/noticias/:id
Authorization: Bearer <token>
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "linhasAfetadas": 1
  },
  "message": "Notícia deletada com sucesso"
}
```

---

## 📂 ENDPOINTS - CATEGORIAS

### 1. Get All Categories
```http
GET /api/v2/categorias
Authorization: Bearer <token>
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "nome": "Tecnologia",
      "descricao": "Notícias sobre tecnologia",
      "dataCriacao": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "nome": "Saúde",
      "descricao": "Notícias sobre saúde",
      "dataCriacao": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Categorias recuperadas"
}
```

---

### 2. Create Category
```http
POST /api/v2/categorias
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Educação",
  "descricao": "Notícias sobre educação"
}
```

**Requirements**
- Admin only
- Nome: required, unique
- Descrição: optional

**Response 201**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 3,
    "nome": "Educação",
    "descricao": "Notícias sobre educação"
  },
  "message": "Categoria criada com sucesso"
}
```

---

### 3. Update Category
```http
PUT /api/v2/categorias/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Educação Digital",
  "descricao": "Atualizado"
}
```

---

### 4. Delete Category
```http
DELETE /api/v2/categorias/:id
Authorization: Bearer <token>
```

---

## 📅 ENDPOINTS - EVENTOS

### 1. Get All Events
```http
GET /api/v2/eventos
Authorization: Bearer <token>
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "titulo": "Webinar de Acessibilidade",
      "descricao": "Eventos sobre tecnologia acessível",
      "data": "2024-02-15T14:00:00Z",
      "local": "Online via Zoom",
      "dataCriacao": "2024-01-10T00:00:00Z"
    }
  ],
  "message": "Eventos recuperados"
}
```

---

### 2. Create Event
```http
POST /api/v2/eventos
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Webinar de Acessibilidade",
  "descricao": "Workshop sobre WCAG 2.1",
  "data": "2024-02-15T14:00:00Z",
  "local": "Online"
}
```

**Requirements**
- Admin or author
- Todos os campos: required
- Data: future date

---

### 3. Update Event
```http
PUT /api/v2/eventos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Webinar atualizado",
  "descricao": "Nova descrição",
  "data": "2024-02-20T15:00:00Z",
  "local": "Hybrid"
}
```

---

### 4. Delete Event
```http
DELETE /api/v2/eventos/:id
Authorization: Bearer <token>
```

---

## 📖 ENDPOINTS - HISTÓRIAS

### 1. Get All Stories
```http
GET /api/v2/historias
Authorization: Bearer <token>
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "titulo": "Minha Jornada em Libras",
      "conteudo": "Aos 5 anos descobri que era surdo...",
      "autorId": 3,
      "dataCriacao": "2024-01-05T10:00:00Z"
    }
  ],
  "message": "Histórias recuperadas"
}
```

---

### 2. Create Story
```http
POST /api/v2/historias
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Minha experiência com Libras",
  "conteudo": "Texto longo da história..."
}
```

**Requirements**
- Logged in user
- Título: min 5 characters
- Conteúdo: min 50 characters

---

### 3. Update Story
```http
PUT /api/v2/historias/:id
Authorization: Bearer <token>

{
  "titulo": "Atualizado",
  "conteudo": "Conteúdo atualizado..."
}
```

---

### 4. Delete Story
```http
DELETE /api/v2/historias/:id
Authorization: Bearer <token>
```

---

## ⚖️ ENDPOINTS - DIREITOS

### 1. Get All Rights
```http
GET /api/v2/direitos
Authorization: Bearer <token>
```

**Response 200**
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "titulo": "Direito à Educação em Libras",
      "descricao": "Todo surdo tem direito a educação em sua língua materna",
      "categoria": "Educação",
      "dataCriacao": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Direitos recuperados"
}
```

---

### 2. Create Right
```http
POST /api/v2/direitos
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Novo Direito",
  "descricao": "Descrição do direito",
  "categoria": "Saúde"
}
```

**Requirements**
- Admin only
- Título: required
- Descricao: required

---

### 3. Update Right
```http
PUT /api/v2/direitos/:id
Authorization: Bearer <token>

{
  "titulo": "Atualizado",
  "descricao": "Nova descrição"
}
```

---

### 4. Delete Right
```http
DELETE /api/v2/direitos/:id
Authorization: Bearer <token>
```

---

## ❌ LEGACY ROUTES (Deprecated)

The original routes are still available for backward compatibility but **should not be used for new implementations**:

```
GET    /api/noticias           ← Use: GET /api/v2/noticias
POST   /api/noticias           ← Use: POST /api/v2/noticias
PUT    /api/noticias/:id       ← Use: PUT /api/v2/noticias/:id
DELETE /api/noticias/:id       ← Use: DELETE /api/v2/noticias/:id

GET    /api/categorias         ← Use: GET /api/v2/categorias
POST   /api/categorias         ← Use: POST /api/v2/categorias
PUT    /api/categorias/:id     ← Use: PUT /api/v2/categorias/:id
DELETE /api/categorias/:id     ← Use: DELETE /api/v2/categorias/:id

GET    /api/eventos            ← Use: GET /api/v2/eventos
POST   /api/eventos            ← Use: POST /api/v2/eventos
PUT    /api/eventos/:id        ← Use: PUT /api/v2/eventos/:id
DELETE /api/eventos/:id        ← Use: DELETE /api/v2/eventos/:id

GET    /api/historias          ← Use: GET /api/v2/historias
POST   /api/historias          ← Use: POST /api/v2/historias
PUT    /api/historias/:id      ← Use: PUT /api/v2/historias/:id
DELETE /api/historias/:id      ← Use: DELETE /api/v2/historias/:id

GET    /api/direitos           ← Use: GET /api/v2/direitos
POST   /api/direitos           ← Use: POST /api/v2/direitos
PUT    /api/direitos/:id       ← Use: PUT /api/v2/direitos/:id
DELETE /api/direitos/:id       ← Use: DELETE /api/v2/direitos/:id
```

---

## 📊 RESPONSE FORMAT

All endpoints follow the standardized response format:

### Success Response
```json
{
  "status": "success",
  "code": 200,
  "data": { /* endpoint-specific data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation error description"
}
```

### Validation Error Response
```json
{
  "status": "validationError",
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "titulo": "Mínimo 5 caracteres",
    "conteudo": "Campo obrigatório"
  }
}
```

### Unauthorized Response
```json
{
  "status": "unauthorized",
  "code": 401,
  "message": "Token invalid or expired"
}
```

### Forbidden Response
```json
{
  "status": "forbidden",
  "code": 403,
  "message": "You don't have permission for this action"
}
```

---

## 🛡️ STATUS CODES

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal error |

---

## 🔑 Authorization Levels

| Role | Create | Read | Update | Delete | Admin |
|------|--------|------|--------|--------|-------|
| `leitor` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `autor` | ✅ | ✅ | ✅* | ✅* | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ |

*Autores podem editar/deletar apenas suas próprias criações

---

## 📝 Example: Complete Flow

```bash
# 1. Register
curl -X POST http://localhost:3000/api/autenticacao/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "senha": "senha123",
    "tipo": "autor"
  }'

# Response: { token: "eyJhbGc...", usuario: { id: 1, ... } }

# 2. Get all news (use token)
curl http://localhost:3000/api/v2/noticias \
  -H "Authorization: Bearer eyJhbGc..."

# Response: [ { id: 1, titulo: "...", ... }, ... ]

# 3. Create news
curl -X POST http://localhost:3000/api/v2/noticias \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Nova Notícia Importante",
    "conteudo": "Descrição detalhada...",
    "categoriaId": 1
  }'

# Response: { status: "success", code: 201, data: { id: 51, ... } }

# 4. Update news
curl -X PUT http://localhost:3000/api/v2/noticias/51 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Atualizado",
    "conteudo": "Novo conteúdo..."
  }'

# 5. Delete news
curl -X DELETE http://localhost:3000/api/v2/noticias/51 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🧪 Testing with cURL

```bash
# Get all (public endpoints might not need token)
curl -i http://localhost:3000/api/v2/noticias

# Create with debug output
curl -i -X POST http://localhost:3000/api/v2/noticias \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Test", "conteudo": "Content here", "categoriaId": 1}'

# Pretty print JSON response
curl -s http://localhost:3000/api/v2/noticias | jq '.'
```

---

## 📦 Integration Notes

- Use Bearer token in `Authorization` header
- Always set `Content-Type: application/json`
- Validate input before sending
- Handle all HTTP status codes
- Parse response status field for errors
- Token expiration: 7 days

