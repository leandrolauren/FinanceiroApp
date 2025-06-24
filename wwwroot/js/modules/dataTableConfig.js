export const baseDataTableConfig = {
  language: {
    emptyTable: 'Nenhum registro encontrado',
    info: 'Mostrando de _START_ até _END_ de _TOTAL_ registros',
    infoEmpty: 'Mostrando 0 até 0 de 0 registros',
    infoFiltered: '(Filtrados de _MAX_ registros)',
    infoThousands: '.',
    loadingRecords: 'Carregando...',
    processing: 'Processando...',
    zeroRecords: 'Nenhum registro encontrado',
    search: 'Pesquisar',
    paginate: {
      next: 'Próximo',
      previous: 'Anterior',
      first: 'Primeiro',
      last: 'Último',
    },
    lengthMenu: '_MENU_ resultados por página',
  },
  responsive: true,
  dom: '<"d-flex justify-content-between align-items-center mb-3"Bf>rt<"d-flex justify-content-between align-items-center"lip>',
  buttons: [
    {
      extend: 'copy',
      className: 'btn btn-secondary',
      text: '<i class="fa-solid fa-copy fa-beat-fade"></i> Copiar',
    },
    {
      extend: 'excel',
      className: 'btn btn-secondary',
      text: '<i class="fa-solid fa-file-excel fa-shake"></i> Excel',
    },
    {
      extend: 'pdf',
      className: 'btn btn-secondary',
      text: '<i class="fa-solid fa-file-pdf fa-spin-pulse"></i> PDF',
    },
  ],
  pageLength: 10,
  lengthMenu: [
    [10, 25, 50, -1],
    [10, 25, 50, 'Todos'],
  ],
}
