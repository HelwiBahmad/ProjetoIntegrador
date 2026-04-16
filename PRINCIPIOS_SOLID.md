# 📋 PRINCÍPIOS SOLID APLICADOS

## 1️⃣ S - Single Responsibility Principle (SRP)

### Definição
Cada classe deve ter uma única razão para mudar (uma única responsabilidade).

### Implementação: Exemplo Notícia

#### ❌ ANTES (Violando SRP)
```javascript
// BAD: Uma classe fazendo tudo
class Noticia {
  constructor(dados) {
    this.titulo = dados.titulo;
    this.conteudo = dados.conteudo;
  }
  
  // Responsabilidade 1: Validação
  validar() {
    if (!this.titulo) throw new Error('Título obrigatório');
  }
  
  // Responsabilidade 2: Persistência
  salvar() {
    const stmt = db.prepare('INSERT INTO Noticia VALUES (?, ?)');
    return stmt.run(this.titulo, this.conteudo);
  }
  
  // Responsabilidade 3: HTTP Response
  toJSON() {
    return { id: this.id, titulo: this.titulo, conteudo: this.conteudo };
  }
  
  // Responsabilidade 4: Formatação para Email
  formatarParaEmail() {
    return `
      <h1>${this.titulo}</h1>
      <p>${this.conteudo}</p>
      <footer>Publicado em ${this.dataCriacao}</footer>
    `;
  }
}

// Problema: Se mudar layout do email, tabela do banco, ou validação = muda a classe
```

#### ✅ DEPOIS (Respeitando SRP)

**Classe com 1 responsabilidade: Representa dados da notícia**
```javascript
// servidor/models/Noticia.js
class Noticia {
  constructor(id, titulo, conteudo, autorId) {
    this.id = id;
    this.titulo = titulo;
    this.conteudo = conteudo;
    this.autorId = autorId;
  }
}
module.exports = Noticia;

// Responsabilidade: Única - Representar notícia
```

**Classe com 1 responsabilidade: Validação**
```javascript
// servidor/services/NoticiaService.js
class NoticiaService {
  static criar(dados) {
    // Única responsabilidade: Lógica de negócio e validação
    if (!dados.titulo) throw new Error('Título obrigatório');
    if (dados.titulo.length < 5) throw new Error('Mínimo 5 caracteres');
    
    // Delega persistência
    return NoticiaRepository.criar(dados);
  }
}

// Se mudar regra de validação: só muda Service
```

**Classe com 1 responsabilidade: Persistência**
```javascript
// servidor/repositories/NoticiaRepository.js
class NoticiaRepository {
  static criar(dados) {
    // Única responsabilidade: Acesso a dados
    const stmt = db.prepare(`
      INSERT INTO Noticia (titulo, conteudo, autorId)
      VALUES (?, ?, ?)
    `);
    return stmt.run(dados.titulo, dados.conteudo, dados.autorId);
  }
}

// Se mudar banco: só muda Repository
```

**Classe com 1 responsabilidade: HTTP Response**
```javascript
// servidor/controllers/NoticiaController.js
class NoticiaController {
  static criar(req, res) {
    // Única responsabilidade: Gerenciar HTTP
    const noticia = NoticiaService.criar(req.body);
    return res.json(ApiResponse.success(noticia, 'Criada', 201));
  }
}

// Se mudar status code ou header: só muda Controller
```

### Benefício
```
Se mudar validação  → Muda só NoticiaService
Se mudar banco     → Muda só NoticiaRepository  
Se mudar HTTP      → Muda só NoticiaController
Se mudar regra     → Muda só NoticiaService

SEM SRP (a classe faz tudo): muda = risco em toda aplicação
COM SRP (cada classe: 1 coisa): muda = seguro, só uma classe
```

---

## 2️⃣ O - Open/Closed Principle (OCP)

### Definição
Aberto para extensão, fechado para modificação. Adicionar funcionalidade sem alterar código existente.

### Implementação: Estratégia de Validação

#### ❌ ANTES (Violando OCP)
```javascript
class NoticiaService {
  static criar(dados) {
    // Se adicionar novo tipo de validação, muda esta função
    
    // Validação 1
    if (!dados.titulo) throw new Error('Título obrigatório');
    
    // Validação 2
    if (dados.titulo.length < 5) throw new Error('Mínimo 5');
    
    // Validação 3
    if (!dados.conteudo) throw new Error('Conteúdo obrigatório');
    
    // Validação 4: Novo! Precisa modificar a classe
    if (dados.conteudo.length < 20) throw new Error('Mínimo 20 chars');
    
    // Validação 5: Novo! Precisa modificar NOVAMENTE
    if (dados.categoriaId && !this.categoriaExiste(dados.categoriaId)) {
      throw new Error('Categoria inválida');
    }
  }
}

// Problema: Adicionando validações = modificando código antigo
```

#### ✅ DEPOIS (Respeitando OCP)

**Definir estratégia de validação (extensível)**
```javascript
// servidor/validators/Validator.js
class Validator {
  constructor() {
    this.regras = [];
  }
  
  adicionar(validacao) {
    this.regras.push(validacao);
  }
  
  validar(dados) {
    for (const validacao of this.regras) {
      validacao(dados);  // Executa validação
    }
  }
}

// Exportar interface
module.exports = Validator;
```

**Definir validações específicas (extensível)**
```javascript
// servidor/validators/NoticiaValidations.js

const validacoes = {
  // Validação: Título obrigatório
  tituloObrigatorio: (dados) => {
    if (!dados.titulo) throw new Error('Título obrigatório');
  },
  
  // Validação: Título mínimo
  tituloMinimo: (dados) => {
    if (dados.titulo.length < 5) throw new Error('Mínimo 5 caracteres');
  },
  
  // Validação: Conteúdo obrigatório
  conteudoObrigatorio: (dados) => {
    if (!dados.conteudo) throw new Error('Conteúdo obrigatório');
  },
  
  // Validação: Conteúdo mínimo
  conteudoMinimo: (dados) => {
    if (dados.conteudo.length < 20) throw new Error('Mínimo 20 caracteres');
  },
  
  // Validação: Categoria válida
  categoriaValida: (dados) => {
    if (dados.categoriaId && !CategoriaRepository.buscarPorId(dados.categoriaId)) {
      throw new Error('Categoria inválida');
    }
  }
};

module.exports = validacoes;
```

**Service usa validações (não precisa modificar)**
```javascript
// servidor/services/NoticiaService.js

import Validator from '../validators/Validator.js';
import validacoes from '../validators/NoticiaValidations.js';

class NoticiaService {
  static criar(dados) {
    // Criar validador
    const validator = new Validator();
    
    // Adicionar validações (composição, não modificação)
    validator.adicionar(validacoes.tituloObrigatorio);
    validator.adicionar(validacoes.tituloMinimo);
    validator.adicionar(validacoes.conteudoObrigatorio);
    validator.adicionar(validacoes.conteudoMinimo);
    validator.adicionar(validacoes.categoriaValida);
    
    // Executar todas
    validator.validar(dados);
    
    // Se novo tipo de validação: adiciona em NoticiaValidations.js
    // Service não muda!
    
    return NoticiaRepository.criar(dados);
  }
}
```

**Se precisar adicionar nova validação (extensão, não modificação):**
```javascript
// Apenas ADICIONAR em NoticiaValidations.js

validacoes.imagemValida = (dados) => {
  if (dados.imagem && !isValidImageFormat(dados.imagem)) {
    throw new Error('Formato de imagem inválido');
  }
};

// Depois em NoticiaService:
validator.adicionar(validacoes.imagemValida);

// Service ainda não foi MODIFICADO, apenas ESTENDIDO
```

### Benefício
```
Novo requisito de validação?
ANTES: Modify NoticiaService.criar() → Risco de quebrar código antigo
DEPOIS: Extend NoticiaValidations.js → Seguro, código antigo intocado
```

---

## 3️⃣ L - Liskov Substitution Principle (LSP)

### Definição
Subtipos podem substituir tipos base sem quebrar comportamento. Se S é subtipo de T, T pode ser substituído por S.

### Implementação: Usuários com diferentes tipos

#### ❌ ANTES (Violando LSP)
```javascript
class Usuario {
  criaNoticias() {
    // Usuário comum: não pode criar
    throw new Error('Permissão negada');
  }
}

class Autor extends Usuario {
  criaNoticias() {
    // Autor: pode criar
    return true;
  }
}

// Problema: Subclasse viola comportamento esperado da superclasse
```

#### ✅ DEPOIS (Respeitando LSP)

**Definir interface clara**
```javascript
// servidor/repositories/NoticiaRepository.js

class NoticiaRepository {
  static criar(dados, usuarioId) {
    // Contrato: Aceita qualquer usuário
    // Espera: usuarioId válido
    
    if (!usuarioId) throw new Error('usuarioId obrigatório');
    
    const stmt = db.prepare(`
      INSERT INTO Noticia (...) VALUES (...)
    `);
    return stmt.run(dados);
  }
}
```

**Service verifica permissão antes de chamar repository**
```javascript
// servidor/services/NoticiaService.js

class NoticiaService {
  static criar(dados, usuarioId, tipoUsuario) {
    // Validar ANTES no service (não no repository)
    if (!['autor', 'admin'].includes(tipoUsuario)) {
      throw new Error('Apenas autores podem criar notícias');
    }
    
    // Repository aceita qualquer usuário válido
    return NoticiaRepository.criar(dados, usuarioId);
  }
}
```

**Controller passa tipo do usuário**
```javascript
// servidor/controllers/NoticiaController.js

class NoticiaController {
  static criar(req, res) {
    try {
      // req.usuario vem do middleware de autenticação
      const noticia = NoticiaService.criar(
        req.body,
        req.usuario.id,
        req.usuario.tipo  // ← Passa tipo para Service validar
      );
      
      return res.json(ApiResponse.success(noticia, '', 201));
    } catch (erro) {
      return res.json(ApiResponse.error(erro.message, 400));
    }
  }
}
```

### Benefício
```
Qualquer usuário (leitor, autor, admin) pode ser passado para Repository
Repository sempre funciona igual (acessa dados)
Service valida permissão → Seguro, sem quebrar contrato
```

---

## 4️⃣ I - Interface Segregation Principle (ISP)

### Definição
Clientes não devem ser forçados a depender de métodos que não usam. Muitas interfaces específicas melhor que uma interface geral.

### Implementação: Operações de Notícia

#### ❌ ANTES (Violando ISP)
```javascript
class INoticiaService {
  // Interface gigante
  criar(dados) {}
  buscarTodas(filtros) {}
  buscarPorId(id) {}
  atualizar(id, dados) {}
  deletar(id) {}
  enviarEmail(id) {}
  gerarPDF(id) {}
  publicarSocial(id) {}
  analisarSentimento(id) {}
  traduzir(id, idioma) {}
  criarMiniatura(imagemId) {}
  
  // Problema: Se implementar apenas leitura, obrigatorio implementar tudo
}

class NoticiaServiceLeitura implements INoticiaService {
  criar() { throw new Error('Não implementado'); }
  buscarTodas() { return []; }
  buscarPorId() { return null; }
  atualizar() { throw new Error('Não implementado'); }
  deletar() { throw new Error('Não implementado'); }
  enviarEmail() { throw new Error('Não implementado'); }
  // ... mais throws
}
```

#### ✅ DEPOIS (Respeitando ISP)

**Separar em interfaces específicas**
```javascript
// servidor/interfaces/INoticiaRead.js
export interface INoticiaRead {
  buscarTodas(filtros);
  buscarPorId(id);
}

// servidor/interfaces/INoticiaWrite.js
export interface INoticiaWrite {
  criar(dados, usuarioId);
  atualizar(id, dados);
  deletar(id);
}

// servidor/interfaces/INoticiaProcess.js
export interface INoticiaProcess {
  enviarEmail(id);
  gerarPDF(id);
  publicarSocial(id);
}
```

**Implementar apenas o necessário**
```javascript
// servidor/services/NoticiaReadService.js
class NoticiaReadService implements INoticiaRead {
  static buscarTodas(filtros) {
    return NoticiaRepository.buscarTodas(filtros);
  }
  
  static buscarPorId(id) {
    return NoticiaRepository.buscarPorId(id);
  }
  
  // Só isso! Não precisa implementar write/process
}

// servidor/services/NoticiaWriteService.js
class NoticiaWriteService implements INoticiaWrite {
  static criar(dados, usuarioId) {
    // ...
  }
  
  static atualizar(id, dados) {
    // ...
  }
  
  static deletar(id) {
    // ...
  }
  
  // Só isso! Não precisa ler ou processar
}
```

### Benefício
```
Se preciso só ler notícias → Use NoticiaReadService
Se preciso criar/editar   → Use NoticiaWriteService
Se preciso processar      → Use NoticiaProcessService

Cada classe implementa SÓ o que precisa
Sem métodos não utilizados
```

---

## 5️⃣ D - Dependency Inversion Principle (DIP)

### Definição
Dependa de abstrações, não de implementações concretas. Classes de alto nível não devem depender de classes de baixo nível.

### Implementação: Notícia com Repository

#### ❌ ANTES (Violando DIP)
```javascript
// servidor/services/NoticiaService.js

class NoticiaService {
  static criar(dados) {
    // Depende da implementação concreta SQLite
    const db = require('better-sqlite3')('./database.db');
    const stmt = db.prepare('INSERT INTO Noticia VALUES (?)');
    stmt.run(dados);
    
    // Problema: Se quiser mudar para MongoDB, muda Service também!
  }
}
```

#### ✅ DEPOIS (Respeitando DIP)

**Service depende de abstração (Repository)**
```javascript
// servidor/services/NoticiaService.js

import NoticiaRepository from '../repositories/NoticiaRepository.js';

class NoticiaService {
  static criar(dados) {
    // Depende de ABSTRAÇÃO (interface do Repository)
    const noticia = NoticiaRepository.criar(dados);
    
    // NoticiaRepository pode ser SQLite, MongoDB, PostgreSQL
    // Service não importa a implementação!
    
    return noticia;
  }
}
```

**Repository encapsula implementação concreta**
```javascript
// servidor/repositories/NoticiaRepository.js

import db from '../banco/conexao.js';  // ← Detalhe de implementação aqui

class NoticiaRepository {
  static criar(dados) {
    // SQLite, MongoDB, PostgreSQL - detalhe aqui
    const stmt = db.prepare('INSERT INTO Noticia VALUES (?)');
    return stmt.run(dados);
  }
}
```

**Se mudar para MongoDB**
```javascript
// servidor/repositories/NoticiaRepository.js (modificado)

import mongoDb from 'mongodb';

class NoticiaRepository {
  static criar(dados) {
    // Implementação MongoDB, não SQLite
    return db.collection('noticias').insertOne(dados);
  }
}

// NoticiaService continua EXATAMENTE IGUAL
// Só o Repository mudou!
```

### Benefício
```
Service depends on Repository (abstração)
Repository depends on Database (implementação)

Trocar banco de dados = muda SÓ Repository
Service é blindado de mudanças na persistência
```

---

## 📊 Resumo SOLID

| Princípio | Definição | Arquivo | Benefício |
|-----------|-----------|---------|-----------|
| **S** | Single Responsibility | Cada classe: 1 razão | Mudanças isoladas |
| **O** | Open/Closed | Estender, não modificar | Novas funcionalidades seguras |
| **L** | Liskov Substitution | Subtipos substituem base | Polimorfismo seguro |
| **I** | Interface Segregation | Interfaces específicas | Implementes só o necessário |
| **D** | Dependency Inversion | Dependa de abstrações | Permuta de implementações |

---

## 🔗 Como SOLID Funciona Junto

```
D (DIP) ← Service depende de Repository (abstração)
  ├─ S (SRP) ← Service: só lógica de negócio
  ├─ I (ISP) ← Repository: interface específica de dados
  ├─ O (OCP) ← Adicionar validação sem modificar Service
  └─ L (LSP) ← Repository substituível (SQLite, MongoDB, etc)
  
Resultado: Código robusto, fácil testar, simples estender
```

