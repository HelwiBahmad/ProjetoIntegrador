/**
 * Componentes Bootstrap 5 reutilizáveis
 * Facilita criação de elementos comuns
 */

class BootstrapComponents {
  /**
   * Criar um card listando itens
   */
  static createCard(title, content, footer = null) {
    const card = document.createElement('div');
    card.className = 'card h-100';
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${content}</p>
      </div>
      ${footer ? `<div class="card-footer bg-transparent border-top"><small class="text-muted">${footer}</small></div>` : ''}
    `;
    return card;
  }

  /**
   * Criar badge com tipo
   */
  static createBadge(text, type = 'primary') {
    const badge = document.createElement('span');
    badge.className = `badge bg-${type}`;
    badge.textContent = text;
    return badge;
  }

  /**
   * Criar botão com ícone
   */
  static createButton(text, icon = null, type = 'primary', size = '') {
    const button = document.createElement('button');
    button.className = `btn btn-${type} ${size}`;
    
    if (icon) {
      button.innerHTML = `<i data-lucide="${icon}" class="me-2" style="width: 1rem; height: 1rem;"></i>${text}`;
    } else {
      button.textContent = text;
    }
    
    return button;
  }

  /**
   * Criar formulário simples
   */
  static createForm(fields) {
    const form = document.createElement('form');
    form.className = 'needs-validation';
    form.setAttribute('novalidate', '');

    fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'mb-3';

      if (field.type === 'text' || field.type === 'email' || field.type === 'password') {
        group.innerHTML = `
          <label for="${field.name}" class="form-label">${field.label}</label>
          <input 
            type="${field.type}" 
            class="form-control" 
            id="${field.name}" 
            name="${field.name}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
          />
          <div class="invalid-feedback">
            ${field.errorMessage || 'Este campo é obrigatório'}
          </div>
        `;
      } else if (field.type === 'textarea') {
        group.innerHTML = `
          <label for="${field.name}" class="form-label">${field.label}</label>
          <textarea 
            class="form-control"
            id="${field.name}"
            name="${field.name}"
            rows="${field.rows || 4}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
          ></textarea>
          <div class="invalid-feedback">
            ${field.errorMessage || 'Este campo é obrigatório'}
          </div>
        `;
      } else if (field.type === 'select') {
        group.innerHTML = `
          <label for="${field.name}" class="form-label">${field.label}</label>
          <select 
            class="form-select"
            id="${field.name}"
            name="${field.name}"
            ${field.required ? 'required' : ''}
          >
            <option value="">Selecione...</option>
            ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
          <div class="invalid-feedback">
            ${field.errorMessage || 'Este campo é obrigatório'}
          </div>
        `;
      } else if (field.type === 'checkbox') {
        group.innerHTML = `
          <div class="form-check">
            <input 
              class="form-check-input"
              type="checkbox"
              id="${field.name}"
              name="${field.name}"
            />
            <label class="form-check-label" for="${field.name}">
              ${field.label}
            </label>
          </div>
        `;
      }

      form.appendChild(group);
    });

    return form;
  }

  /**
   * Criar tabela com dados
   */
  static createTable(headers, rows, options = {}) {
    const table = document.createElement('table');
    table.className = `table ${options.striped !== false ? 'table-striped' : ''} ${options.hover !== false ? 'table-hover' : ''}`;
    
    // Header
    const thead = document.createElement('thead');
    thead.className = 'table-light';
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.innerHTML = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
  }

  /**
   * Criar item de lista com avatar
   */
  static createListItem(avatar, title, subtitle, badge = null) {
    const item = document.createElement('div');
    item.className = 'd-flex align-items-center p-3 border-bottom';
    
    let html = `
      <img src="${avatar}" alt="" class="rounded-circle me-3" style="width: 40px; height: 40px;">
      <div class="flex-grow-1">
        <h6 class="mb-0">${title}</h6>
        <small class="text-muted">${subtitle}</small>
      </div>
    `;
    
    if (badge) {
      html += `<span class="badge bg-primary">${badge}</span>`;
    }
    
    item.innerHTML = html;
    return item;
  }

  /**
   * Criar grid responsivo
   */
  static createGrid(items, cols = 3) {
    const grid = document.createElement('div');
    grid.className = `row g-3`;
    
    items.forEach(item => {
      const col = document.createElement('div');
      const colClass = cols === 1 ? 'col-12' : cols === 2 ? 'col-md-6' : 'col-md-4';
      col.className = `col-12 ${colClass}`;
      col.appendChild(item);
      grid.appendChild(col);
    });

    return grid;
  }

  /**
   * Criar modal simples
   */
  static createModal(id, title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');

    let buttonsHtml = '';
    if (buttons.length === 0) {
      buttonsHtml = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>';
    } else {
      buttonsHtml = buttons.map(btn => 
        `<button type="button" class="btn btn-${btn.type || 'primary'}" ${btn.id ? `id="${btn.id}"` : ''} ${btn.dismiss ? 'data-bs-dismiss="modal"' : ''}>${btn.label}</button>`
      ).join('');
    }

    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-bottom-0">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          <div class="modal-footer border-top-0">
            ${buttonsHtml}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return new bootstrap.Modal(modal);
  }

  /**
   * Criar pagination
   */
  static createPagination(currentPage, totalPages, onPageChange) {
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Previous
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = '<a class="page-link" href="#">Anterior</a>';
    if (currentPage > 1) {
      prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        onPageChange(currentPage - 1);
      });
    }
    ul.appendChild(prevLi);

    // Numbers
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${currentPage === i ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', (e) => {
        e.preventDefault();
        onPageChange(i);
      });
      ul.appendChild(li);
    }

    // Next
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = '<a class="page-link" href="#">Próximo</a>';
    if (currentPage < totalPages) {
      nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        onPageChange(currentPage + 1);
      });
    }
    ul.appendChild(nextLi);

    nav.appendChild(ul);
    return nav;
  }

  /**
   * Criar skeleton loader (para loading states)
   */
  static createSkeleton(width = '100%', height = '20px', count = 3) {
    const container = document.createElement('div');
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'placeholder-glow';
      skeleton.innerHTML = `
        <span class="placeholder" style="width: ${width}; height: ${height};"></span>
      `;
      container.appendChild(skeleton);
    }
    
    return container;
  }
}

export default BootstrapComponents;
