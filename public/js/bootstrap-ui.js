/**
 * Bootstrap 5 UI Utilities
 * Helpers para criar componentes Bootstrap facilmente
 */

class BootstrapUI {
  /**
   * Criar e mostrar um spinner de loading
   */
  static showSpinner(containerId = 'body', message = 'Carregando...') {
    const container = document.querySelector(containerId) || document.body;
    const spinner = document.createElement('div');
    spinner.className = 'spinner-container position-fixed top-50 start-50 translate-middle text-center';
    spinner.id = 'loading-spinner';
    spinner.innerHTML = `
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">${message}</p>
    `;
    container.appendChild(spinner);
    return spinner;
  }

  /**
   * Esconder spinner
   */
  static hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.remove();
  }

  /**
   * Mostrar toast de sucesso
   */
  static showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-descartar após 3 segundos
    setTimeout(() => toast.remove(), 3000);
  }

  /**
   * Criar container de toasts se não existir
   */
  static createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Mostrar modal de confirmação
   */
  static showConfirmation(title, message, onConfirm, onCancel = null) {
    const modal = this.createConfirmationModal(title, message, onConfirm, onCancel);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    return bsModal;
  }

  /**
   * Criar modal de confirmação
   */
  static createConfirmationModal(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-bottom-0">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${message}
          </div>
          <div class="modal-footer border-top-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="confirm-btn">Confirmar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const confirmBtn = modal.querySelector('#confirm-btn');
    confirmBtn.addEventListener('click', () => {
      onConfirm();
      bootstrap.Modal.getInstance(modal).hide();
    });
    
    if (onCancel) {
      const cancelBtn = modal.querySelector('[data-bs-dismiss="modal"]');
      cancelBtn.addEventListener('click', onCancel);
    }
    
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
    
    return modal;
  }

  /**
   * Desabilitar botão durante envio
   */
  static disableButton(button, message = 'Processando...') {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ${message}
    `;
  }

  /**
   * Reabilitar botão após envio
   */
  static enableButton(button) {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
  }

  /**
   * Validar formulário do Bootstrap
   */
  static validateForm(form) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add('was-validated');
      return false;
    }
    return true;
  }

  /**
   * Mostrar alert inline
   */
  static showAlert(message, type = 'danger', containerId = 'alerts-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(alert);
    
    // Auto-descartar após 5 segundos
    setTimeout(() => alert.remove(), 5000);
  }
}

export default BootstrapUI;
