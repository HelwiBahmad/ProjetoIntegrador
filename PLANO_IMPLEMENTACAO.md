# 📋 Plano de Implementação - Requisitos Funcionais

## Fase 1: Validações (Front-end e Back-end)

### 1.1 Instalar validador de email no back-end
```javascript
// Em servidor/rotas/rotasAutenticacao.js
// Instalar: npm install email-validator
import EmailValidator from 'email-validator';

if (!EmailValidator.validate(email)) {
  return res.status(400).json({ erro: 'Email inválido.' });
}
```

### 1.2 Adicionar validação de formulário no front-end
```javascript
// Em public/js/app.js - Adicionar validações antes de enviar
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha) {
  return senha.length >= 6;
}

function validarFormulario(nome, email, senha, confirmarSenha) {
  const erros = [];
  
  if (!nome.trim()) erros.push('Nome é obrigatório');
  if (!email.trim()) erros.push('Email é obrigatório');
  if (!validarEmail(email)) erros.push('Email inválido');
  if (!validarSenha(senha)) erros.push('Senha deve ter mínimo 6 caracteres');
  if (senha !== confirmarSenha) erros.push('Senhas não conferem');
  
  return erros;
}
```

---

## Fase 2: Feedback Visual

### 2.1 Sistema de Toasts (Notificações)
```javascript
// Implementar toasts para:
// ✅ Sucesso: "Notícia criada com sucesso!"
// ❌ Erro: "Erro ao criar notícia"
// ⏳ Carregamento: "Salvando..."

// Exemplo de uso:
async function criarNoticia(dados) {
  mostrarToast('Criando notícia...', 'loading');
  
  try {
    const resposta = await fetch('/api/noticias', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    
    if (resposta.ok) {
      mostrarToast('Notícia criada com sucesso!', 'success');
    } else {
      mostrarToast('Erro ao criar notícia', 'error');
    }
  } catch (erro) {
    mostrarToast('Erro na conexão', 'error');
  }
}
```

### 2.2 Spinner de carregamento
```html
<!-- Adicionar em index.html -->
<div id="spinner-global" class="oculto">
  <div class="spinner"></div>
  <p>Carregando...</p>
</div>
```

```css
/* Em css/estilos.css */
.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## Fase 3: Painel de Admin para CRUD

### 3.1 Nova página: /admin/noticias
```html
<!-- public/index.html - Adicionar após </main> -->
<section id="admin-noticias" class="oculto">
  <div class="container">
    <h2>Gerenciar Notícias</h2>
    
    <button id="btn-nova-noticia" class="botao botao--primario">Criar Notícia</button>
    
    <table class="tabela-noticias">
      <thead>
        <tr>
          <th>Título</th>
          <th>Categoria</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="lista-noticias-admin">
        <!-- Preenchido por JavaScript -->
      </tbody>
    </table>
  </div>
</section>
```

### 3.2 Modal para criar/editar notícia
```html
<!-- Modal -->
<div id="modal-noticia" class="modal oculto">
  <div class="modal__conteudo">
    <h3>Criar/Editar Notícia</h3>
    <form id="form-noticia">
      <input type="text" placeholder="Título" required>
      <textarea placeholder="Resumo" required></textarea>
      <textarea placeholder="Conteúdo" required></textarea>
      <select required>
        <option value="">Selecione a categoria</option>
      </select>
      <label>
        <input type="checkbox"> Destaque
      </label>
      <button type="submit">Salvar</button>
      <button type="button" id="btn-fechar-modal">Cancelar</button>
    </form>
  </div>
</div>
```

---

## Fase 4: Melhorar Responsividade

### 4.1 Verificar meta viewport (✅ já existe)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 4.2 Adicionar media queries para mobile
```css
/* Em css/estilos.css */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .tabela-noticias {
    font-size: 12px;
  }
  
  .botao {
    min-height: 44px; /* Touch target mínimo */
  }
}
```

### 4.3 Testar touch targets
- Botões e links devem ter ≥ 44x44 pixels
- Espaçamento entre elementos touchables

---

## Fase 5: Permissões por Perfil

### 5.1 Estrutura de Permissões
```javascript
const PERMISSOES = {
  leitor: ['ler', 'buscar'],
  autor: ['ler', 'buscar', 'criar', 'editar_proprios'],
  admin: ['ler', 'buscar', 'criar', 'editar', 'deletar', 'promover']
};
```

### 5.2 Proteger rotas
```javascript
// Em servidor/rotas/rotasNoticias.js
router.post('/', verificarToken, verificarAutorOuAdmin, (req, res) => {
  // Apenas autores e admins podem criar
});

router.delete('/:id', verificarToken, verificarAdmin, (req, res) => {
  // Apenas admins podem deletar
});
```

---

## Cronograma Sugerido

1. **Dia 1**: Implementar validações fase 1 e 2
2. **Dia 2**: Criar painel de admin (fase 3)
3. **Dia 3**: Testar responsividade e corrigir
4. **Dia 4**: Testar todas as permissões
5. **Dia 5**: Testes finais e ajustes

---

## Próximos Passos

👉 **Qual quer fazer primeiro?** Recomendo começar pela Fase 1 (Validações) que é rápida e crucial.
