# ✅ Checklist de Requisitos Funcionais

## 1. Autenticação com 2+ Perfis
- ✅ **Estrutura**: Já implementada (leitor, autor, admin)
  - Arquivo: [servidor/rotas/rotasAutenticacao.js](servidor/rotas/rotasAutenticacao.js)
  - Tipos: "leitor" (padrão), "autor" (escreve notícias), "admin" (gerencia tudo)

### Ações necessárias:
- [ ] Melhorar UI do login/cadastro
- [ ] Adicionar formulário de admin para promover usuários a autores
- [ ] Implementar senha "esqueci" e reset
- [ ] Melhorar validações no front-end

---

## 2. CRUD Completo (Entidade: NOTÍCIAS)
- ✅ **CREATE**: POST /api/noticias (apenas autor/admin)
- ✅ **READ**: GET /api/noticias (todos)
- ✅ **UPDATE**: PUT /api/noticias/:id (apenas autor/admin)
- ✅ **DELETE**: DELETE /api/noticias/:id (apenas admin)
  - Arquivo: [servidor/rotas/rotasNoticias.js](servidor/rotas/rotasNoticias.js)

### Ações necessárias:
- [ ] Implementar painel admin para CRUD visual
- [ ] Adicionar upload de imagens
- [ ] Validar campos obrigatórios

---

## 3. Listagem com Filtro/Busca
- ✅ **Filtros existentes**: categoria, destaque, limite, pagina
- ✅ **Busca**: Buscar por slug

### Ações necessárias:
- [ ] Adicionar busca por título/conteúdo
- [ ] Melhorar interface de filtros
- [ ] Persistir filtros na URL

---

## 4. Feedback Visual
- ✅ **Toast**: Sistema pronto (use-toast.ts)
- ❌ **Spinners**: Não implementado
- ❌ **Skeletons**: Não implementado
- ❌ **Modais de confirmação**: Não implementado

### Ações necessárias:
- [ ] Adicionar loading spinners
- [ ] Implementar feedback de erro/sucesso
- [ ] Toast para ações bem-sucedidas
- [ ] Confirmação para ações destrutivas

---

## 5. Interface Responsiva
- ✅ **CSS**: globals.css com media queries
- ✅ **Menu mobile**: Já implementado
- ⚠️ **Testar em dispositivos reais**

### Ações necessárias:
- [ ] Testar em mobile real ou emulador
- [ ] Ajustar tamanhos de fonte
- [ ] Verificar touch targets (botões ≥ 44px)
- [ ] Testar no Safari/Chrome mobile

---

## 6. Validações Front-end e Back-end

### Back-end (Node.js/Express):
- ✅ Email obrigatório e único
- ✅ Senha mínimo 6 caracteres
- ✅ Token JWT para autenticação
- ❌ Validar email válido
- ❌ Validar formato de dados de entrada

### Front-end (JavaScript):
- ❌ Sem validação de formulário visual
- ❌ Sem máscara de entrada
- ❌ Sem feedback de validação em tempo real

### Ações necessárias:
- [ ] Adicionar library de validação (zod/yup/joi)
- [ ] Validar email com regex
- [ ] Adicionar confirmação de senha
- [ ] Mensagens de erro específicas

---

## Resumo Status
- **Requisito 1**: 60% ✅
- **Requisito 2**: 80% ✅
- **Requisito 3**: 70% ✅
- **Requisito 4**: 20% ❌
- **Requisito 5**: 70% ⚠️
- **Requisito 6**: 40% ❌

**Score Geral**: ~57% - Precisa de melhorias
