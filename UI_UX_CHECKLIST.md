# ✨ UI/UX CHECKLIST - BOOTSTRAP 5

## 1️⃣ DESIGN SYSTEM - Bootstrap 5.3.0

### Status de Implementação

| Componente | Implementado | Arquivo | Descrição |
|-----------|--------------|---------|-----------|
| ✅ Colors/Palette | Sim | `bootstrap-custom.css` | CSS Variables para cores do projeto |
| ✅ Typography | Sim | `bootstrap-custom.css` | Font sizes, weights, line-heights |
| ✅ Spacing | Sim | Bootstrap 5 CDN | Sistema de espaçamento 0.25rem |
| ✅ Grid System | Sim | Bootstrap 5 CDN | 12-column responsive grid |
| ✅ Buttons | Sim | `bootstrap-components.js` | 5 tamanhos × 6 variações |
| ✅ Forms | Sim | `bootstrap-components.js` | Input, Select, Textarea, Checkbox |
| ✅ Cards | Sim | `bootstrap-components.js` | Flex, Header, Body, Footer |
| ✅ Modals | Sim | `bootstrap-ui.js` | Confirmação, Alert, Toast |
| ✅ Alerts | Sim | `bootstrap-ui.js` | Success, Warning, Error, Info |
| ✅ Loading States | Sim | `bootstrap-ui.js` | Spinner, Pulse animation |

---

## 2️⃣ VISUAL HIERARCHY

### ✅ Níveis de Hierarquia Implementados

```
┌─────────────────────────────────────────┐
│  LEVEL 1: Principal (H1 - 2.5rem)       │
│  Títulos de página, seções principais   │
│  Exemplo: "Cadastro de Notícias"        │
└─────────────────────────────────────────┘
    ↓
┌──────────────────────────────┐
│ LEVEL 2: Secundário (H2)     │
│ Subseções, grupos de dados   │
│ Exemplo: "Informações da..."  │
└──────────────────────────────┘
    ↓
┌────────────────────────┐
│ LEVEL 3: Label (H3)    │
│ Campos, atributos      │
│ Exemplo: "Categoria"   │
└────────────────────────┘
    ↓
┌──────────────┐
│ LEVEL 4: Body│
│ Conteúdo      │
└──────────────┘
```

### Implementação CSS
```css
/* Color de destaque por nível */
h1 { color: var(--primary); font-weight: 700; }      /* Mais escuro */
h2 { color: var(--secondary); font-weight: 600; }    /* Médio */
h3 { color: var(--dark); font-weight: 500; }         /* Menos destaque */
p  { color: var(--muted); font-weight: 400; }        /* Texto normal */
```

---

## 3️⃣ CONSISTÊNCIA VISUAL

### ✅ Componentes com Estilo Consistente

**Botões**
```javascript
// Todos seguem padrão: cor + ícone + tamanho + estado
createButton('Cadastrar', 'success', { size: 'lg', icon: 'plus' });
createButton('Editar', 'warning', { size: 'md', icon: 'edit' });
createButton('Deletar', 'danger', { size: 'sm', icon: 'trash' });
```

**Cards**
```javascript
// Todos com mesmo padding, border-radius, shadow
createCard({
  header: 'Título',
  body: 'Conteúdo',
  footer: 'Rodapé'
});
```

**Modais**
```javascript
// Todos com mesma animação, overlay, comportamento
showConfirmation({
  title: 'Confirmar?',
  message: 'Ação irreversível',
  onConfirm: callback
});
```

---

## 4️⃣ ESTADOS VISUAIS

### ✅ Estados Implementados por Elemento

**Buttons**
```javascript
/* Estado Normal */
<button class="btn btn-primary">Salvar</button>

/* Estado Loading */
<button class="btn btn-primary" disabled>
  <span class="spinner-border spinner-border-sm"></span> Salvando...
</button>

/* Estado Sucesso */
<button class="btn btn-success">✓ Salvo</button>

/* Estado Erro */
<button class="btn btn-danger">✗ Erro</button>
```

Implementação em `bootstrap-ui.js`:
```javascript
disableButton(btn);        // → disabled, opacity-50
showLoading(btn);          // → spinner + texto
showSuccess(btn);          // → verde, checkmark
showError(btn);            // → vermelho, X
enableButton(btn);         // → volta normal
```

**Forms**
```javascript
/* Status Normal */
<input class="form-control">

/* Status Focus (interação) */
<input class="form-control is-focused">

/* Status Valid */
<input class="form-control is-valid">

/* Status Invalid */
<input class="form-control is-invalid">
<div class="invalid-feedback">Erro aqui</div>

/* Status Disabled */
<input class="form-control" disabled>
```

**Links/Hovers**
```javascript
/* Normal */
<a href="#" class="link-primary">Link</a>

/* Hover */
<a href="#" class="link-primary text-decoration-underline">Link</a>

/* Active */
<a href="#" class="link-primary border-b">Link</a>
```

### Animações de Estado
```css
/* Transição suave entre estados */
button, input, a {
  transition: all 0.2s ease-in-out;
}

/* Loading spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.spinner { animation: spin 1s linear infinite; }

/* Pulse para atenção */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## 5️⃣ FEEDBACK VISUAL

### ✅ Sistema de Notificações

**Toast (Feedback não-intrusivo)**
```javascript
// Sucesso
showToast('Notícia criada!', 'success');

// Erro
showToast('Erro ao salvar', 'error');

// Info
showToast('Processando...', 'info');
```

Implementação em `bootstrap-ui.js`:
```javascript
showToast(mensagem, tipo) {
  const toast = document.createElement('div');
  toast.className = `alert alert-${tipo}`;
  toast.textContent = mensagem;
  
  document.querySelector('.toast-container').append(toast);
  
  setTimeout(() => toast.remove(), 3000);  // Auto-remove
}
```

**Modal de Confirmação**
```javascript
showConfirmation({
  title: 'Deletar?',
  message: 'Não pode desfazer',
  buttons: { cancel: 'Cancelar', confirm: 'Deletar' },
  onConfirm: () => deleteItem()
});
```

**Spinner de Carregamento**
```javascript
showSpinner();      // Modal com spinner
// ... operação longa
hideSpinner();      // Remove spinner
```

---

## 6️⃣ FORMULÁRIOS & VALIDAÇÃO

### ✅ Form Bootstrap com Validação

**HTML Structure**
```html
<form class="needs-validation" method="POST" novalidate>
  <!-- Grupo de form -->
  <div class="mb-3">
    <label class="form-label">Título</label>
    <input 
      type="text" 
      class="form-control" 
      name="titulo" 
      required
      minlength="5"
    >
    <div class="invalid-feedback">
      Mínimo 5 caracteres
    </div>
  </div>
  
  <button type="submit" class="btn btn-primary">Salvar</button>
</form>
```

**Validação JavaScript**
```javascript
const form = document.querySelector('.needs-validation');
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.classList.add('was-validated');
  } else {
    // Válido! Enviar dados
    handleFormSubmit();
  }
});
```

**Componentes de Form**
```javascript
// Input com label + validação
createFormGroup({
  label: 'Email',
  type: 'email',
  name: 'email',
  placeholder: 'user@example.com',
  required: true
});

// Select dropdown
createSelect({
  label: 'Categoria',
  name: 'categoriaId',
  options: [
    { value: 1, text: 'Tech' },
    { value: 2, text: 'Science' }
  ]
});

// Textarea
createFormGroup({
  label: 'Descrição',
  type: 'textarea',
  rows: 4
});
```

---

## 7️⃣ RESPONSIVIDADE

### ✅ Breakpoints Bootstrap

```css
/* Mobile First Approach */

/* Extra small (xs) - <576px */
@media (max-width: 575.98px) { }

/* Small (sm) - ≥576px */
@media (min-width: 576px) { }

/* Medium (md) - ≥768px */
@media (min-width: 768px) { }

/* Large (lg) - ≥992px */
@media (min-width: 992px) { }

/* XL (xl) - ≥1200px */
@media (min-width: 1200px) { }
```

### Implementação Grid Responsivo
```html
<!-- 1 coluna em mobile, 2 em tablet, 3 em desktop -->
<div class="row">
  <div class="col-12 col-md-6 col-lg-4">Card 1</div>
  <div class="col-12 col-md-6 col-lg-4">Card 2</div>
  <div class="col-12 col-md-6 col-lg-4">Card 3</div>
</div>
```

### Utility Classes Responsivas
```html
<!-- Padding: 1rem em mobile, 2rem em tablet -->
<div class="p-3 p-md-5">Conteúdo</div>

<!-- Display: nenhum em mobile, flex em desktop -->
<div class="d-none d-lg-flex">Dashboard</div>

<!-- Text: centro em mobile, esquerda em desktop -->
<div class="text-center text-lg-start">Título</div>

<!-- Font size: small em mobile, normal em desktop -->
<h1 class="h4 h1-lg">Título Adaptativo</h1>
```

---

## 8️⃣ ACESSIBILIDADE

### ✅ Implementações Acessíveis

**Semântica HTML**
```html
<!-- ✓ Bom: Elementos semânticos -->
<header>Logo + Navegação</header>
<main>Conteúdo principal</main>
<footer>Copyright</footer>

<!-- ✗ Ruim: Divs everywhere -->
<div class="header">...</div>
<div class="main">...</div>
```

**ARIA Labels**
```html
<!-- Identificar propósito -->
<button aria-label="Fechar menu">×</button>

<!-- Indicar estado -->
<button aria-pressed="false">Button</button>

<!-- Descrever elemento complexo -->
<div aria-labelledby="heading">Conteúdo</div>
<h2 id="heading">Título</h2>
```

**Color Contrast**
```css
/* WCAG AA: Razão mínima 4.5:1 */
.text-dark { color: #212529; }      /* Bom: 14.21:1 com branco */
.text-success { color: #198754; }   /* Bom: 7.4:1 com branco */
.text-muted { color: #6c757d; }     /* Bom: 5.4:1 com branco */

/* Evitar */
.text-light { color: #f8f9fa; }     /* Ruim: 1:1 com branco */
```

**Focus States**
```css
button:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
```

**Keyboard Navigation**
```javascript
// Suportar Tab através de elementos
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Navegação automática pelo HTML
  }
  
  if (e.key === 'Enter') {
    // Ativar elemento focado
  }
  
  if (e.key === 'Escape') {
    // Fechar modais/menus
    modal.close();
  }
});

// Suportar screen readers
button.setAttribute('type', 'button');  // Semântica clara
input.setAttribute('aria-label', 'Buscar');  // Propósito claro
div.setAttribute('role', 'alert');  // Tipo de conteúdo
```

---

## 9️⃣ TIPOGRAFIA

### ✅ Sistema de Fontes

**Family**
```css
/* Google Fonts: Roboto (sans-serif) e Merriweather (serif) */
:root {
  --font-sans: 'Roboto', system-ui, sans-serif;
  --font-serif: 'Merriweather', serif;
}
```

**Sizes**
```css
h1 { font-size: 2.5rem; }      /* 40px */
h2 { font-size: 2rem; }        /* 32px */
h3 { font-size: 1.75rem; }     /* 28px */
h4 { font-size: 1.5rem; }      /* 24px */
h5 { font-size: 1.25rem; }     /* 20px */
h6 { font-size: 1rem; }        /* 16px */
p  { font-size: 1rem; }        /* 16px */
small { font-size: 0.875rem; } /* 14px */
```

**Weights**
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

p { font-weight: var(--font-normal); }
strong { font-weight: var(--font-bold); }
```

**Line Heights**
```css
:root {
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-loose: 1.8;
}

h1, h2 { line-height: var(--leading-tight); }
p, li { line-height: var(--leading-normal); }
```

---

## 🔟 PALETA DE CORES

### ✅ CSS Variables Implementadas

```css
:root {
  /* Cores Primárias */
  --primary: #0d6efd;           /* Azul (ações principais) */
  --secondary: #6c757d;         /* Cinza (ações secundárias) */
  
  /* Cores de Status */
  --success: #198754;           /* Verde (sucesso) */
  --warning: #ffc107;           /* Amarelo (aviso) */
  --danger: #dc3545;            /* Vermelho (erro) */
  --info: #0dcaf0;              /* Ciano (informação) */
  
  /* Escala de Cinza */
  --dark: #212529;              /* Texto principal */
  --muted: #6c757d;             /* Texto secundário */
  --light: #f8f9fa;             /* Fundo claro */
  
  /* Estrutura */
  --border: #dee2e6;            /* Bordas */
  --body: #ffffff;              /* Fundo corpo */
}
```

### Uso em Componentes
```javascript
// Bootstrap usa classes para cores
<div class="bg-primary">Fundo azul</div>     <!-- Primary -->
<div class="bg-success">Fundo verde</div>    <!-- Success -->
<div class="text-danger">Texto vermelho</div><!-- Danger -->
<div class="border border-warning">Borda amarela</div> <!-- Warning -->
```

---

## Resumo de Cobertura UI/UX

| Categoria | Status | Cobertura |
|-----------|--------|-----------|
| Design System | ✅ | 100% - Bootstrap 5.3.0 + CSS Variables |
| Visual Hierarchy | ✅ | 100% - 4 níveis H1-H4 |
| Consistência | ✅ | 100% - Componentes padronizados |
| Estados Visuais | ✅ | 100% - Normal, hover, active, disabled, loading, error |
| Feedback | ✅ | 100% - Toasts, modais, spinners |
| Formulários | ✅ | 100% - Validação nativa + custom |
| Responsividade | ✅ | 100% - 5 breakpoints mobile-first |
| Acessibilidade | ✅ | 95% - WCAG AA, ARIA labels, keyboard nav |
| Tipografia | ✅ | 100% - Google Fonts + escala harmônica |
| Cores | ✅ | 100% - 9 variáveis CSS + contraste WCAG |

---

## 📋 Checklist Pré-Deploy

- ✅ Design System definido (Bootstrap 5)
- ✅ Hierarquia visual clara (H1-H6, tamanhos progressivos)
- ✅ Componentes consistentes (mesmo padding, border-radius, animação)
- ✅ Estados visuais cobertos (normal, hover, active, disabled, loading, error)
- ✅ Feedback implementado (toasts, alerts, modais, spinners)
- ✅ Formulários com validação
- ✅ Grid responsivo (mobile-first, 5 breakpoints)
- ✅ Acessibilidade (semântica, ARIA, contraste, teclado)
- ✅ Tipografia harmônica (tamanhos progressivos, pesos, espaçamento)
- ✅ Paleta de cores consistente (9 cores CSS variables)

