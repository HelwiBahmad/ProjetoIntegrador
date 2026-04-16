/**
 * Exemplo de Integração Bootstrap 5 com o projeto
 * Este arquivo mostra como usar BootstrapUI e BootstrapComponents
 */

// import BootstrapUI from '/js/bootstrap-ui.js';
// import BootstrapComponents from '/js/bootstrap-components.js';

/**
 * EXEMPLO 1: Mostrar loading spinner
 */
// function exemploSpinner() {
//   BootstrapUI.showSpinner('#conteudo-principal', 'Carregando notícias...');
//   
//   setTimeout(() => BootstrapUI.hideSpinner(), 2000);
// }

/**
 * EXEMPLO 2: Mostrar toast de sucesso/erro
 */
// function exemploToast() {
//   BootstrapUI.showToast('Notícia criada com sucesso!', 'success');
//   
//   setTimeout(() => {
//     BootstrapUI.showToast('Erro ao atualizar categoria', 'error');
//   }, 2000);
// }

/**
 * EXEMPLO 3: Modal de confirmação para delete
 */
// function exemploConfirmacao() {
//   BootstrapUI.showConfirmation(
//     'Deletar Notícia',
//     'Tem certeza que deseja deletar esta notícia? Esta ação não pode ser desfeita.',
//     () => {
//       console.log('Notícia deletada');
//       BootstrapUI.showToast('Notícia deletada com sucesso', 'success');
//     },
//     () => {
//       console.log('Cancelou delete');
//     }
//   );
// }

/**
 * EXEMPLO 4: Desabilitar botão durante envio
 */
// function exemploDownloadButton() {
//   const btn = document.getElementById('btn-salvar');
//   
//   btn.addEventListener('click', () => {
//     BootstrapUI.disableButton(btn, 'Salvando...');
//     
//     // Simular requisição
//     setTimeout(() => {
//       BootstrapUI.enableButton(btn);
//       BootstrapUI.showToast('Salvo com sucesso', 'success');
//     }, 2000);
//   });
// }

/**
 * EXEMPLO 5: Criar card com BootstrapComponents
 */
// function exemploCard() {
//   const card = BootstrapComponents.createCard(
//     'Título da Notícia',
//     'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
//     '2024-04-14'
//   );
//   
//   document.getElementById('cards-container').appendChild(card);
// }

/**
 * EXEMPLO 6: Criar tabela com dados
 */
// function exemploTabela() {
//   const headers = ['ID', 'Título', 'Categoria', 'Data'];
//   const rows = [
//     ['1', 'Notícia 1', 'Educação', '2024-04-14'],
//     ['2', 'Notícia 2', 'Direitos', '2024-04-13'],
//     ['3', 'Notícia 3', 'Eventos', '2024-04-12']
//   ];
//   
//   const table = BootstrapComponents.createTable(headers, rows);
//   document.getElementById('table-container').appendChild(table);
// }

/**
 * EXEMPLO 7: Criar grid responsivo
 */
// function exemploGrid() {
//   const items = [];
//   for (let i = 1; i <= 6; i++) {
//     items.push(
//       BootstrapComponents.createCard(`Card ${i}`, `Descrição do card ${i}`)
//     );
//   }
//   
//   const grid = BootstrapComponents.createGrid(items, 3);
//   document.getElementById('grid-container').appendChild(grid);
// }

/**
 * EXEMPLO 8: Alert inline
 */
// function exemploAlert() {
//   BootstrapUI.showAlert(
//     '<strong>Atenção!</strong> Existem 3 histórias pendentes de aprovação.',
//     'warning'
//   );
// }

/**
 * EXEMPLO 9: Usar em requisição API
 */
// async function exemploAPIcomUI() {
//   const btn = document.getElementById('btn-buscar');
//   
//   try {
//     BootstrapUI.disableButton(btn, 'Buscando...');
//     BootstrapUI.showSpinner();
//     
//     const response = await fetch('/api/noticias/refactor');
//     const data = await response.json();
//     
//     BootstrapUI.hideSpinner();
//     BootstrapUI.enableButton(btn);
//     
//     if (data.sucesso) {
//       BootstrapUI.showToast('Notícias carregadas', 'success');
//       console.log(data.dados);
//     } else {
//       BootstrapUI.showToast('Erro ao carregar notícias', 'error');
//     }
//   } catch (erro) {
//     BootstrapUI.hideSpinner();
//     BootstrapUI.enableButton(btn);
//     BootstrapUI.showToast('Erro na requisição', 'error');
//   }
// }

/**
 * EXEMPLO 10: Formulário com validação Bootstrap
 */
// function exemploFormulario() {
//   const fields = [
//     {
//       name: 'titulo',
//       label: 'Título',
//       type: 'text',
//       placeholder: 'Digite o título',
//       required: true,
//       errorMessage: 'O título é obrigatório'
//     },
//     {
//       name: 'categoria',
//       label: 'Categoria',
//       type: 'select',
//       required: true,
//       options: [
//         { value: 'educacao', label: 'Educação' },
//         { value: 'direitos', label: 'Direitos' },
//         { value: 'eventos', label: 'Eventos' }
//       ]
//     },
//     {
//       name: 'conteudo',
//       label: 'Conteúdo',
//       type: 'textarea',
//       placeholder: 'Digite o conteúdo...',
//       required: true,
//       rows: 5
//     }
//   ];
//   
//   const form = BootstrapComponents.createForm(fields);
//   document.getElementById('form-container').appendChild(form);
// }

export default {
  // Importar e exportar para usar em outros arquivos
};
