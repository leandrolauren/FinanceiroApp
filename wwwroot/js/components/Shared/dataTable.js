import { baseDataTableConfig } from '../../modules/dataTableConfig.js'

export function initDataTable(tableSelector, customConfig = {}) {
  const mergedConfig = {
    ...baseDataTableConfig,
    ...customConfig,
    language: {
      ...baseDataTableConfig.language,
      ...(customConfig.language || {}),
    },
    buttons: customConfig.buttons || baseDataTableConfig.buttons, // garante que os botões venham do padrão se não forem informados
  }

  const filterColumns = customConfig.filterColumns || 4

  const fullConfig = {
    ...mergedConfig,
    initComplete: function () {
      // Filtros por coluna
      this.api()
        .columns()
        .every(function (index) {
          if (index < filterColumns) {
            const column = this
            const title = $(column.header()).text()
            const input = $(
              `<input type="text" class="form-control form-control-sm" placeholder="Filtrar ${title}" />`,
            )

            $(column.header()).empty().append(title).append(input)

            input.on('keyup change clear', function () {
              if (column.search() !== this.value) {
                column.search(this.value).draw()
              }
            })
          }
        })

      // Callback personalizado
      if (typeof customConfig.onInitComplete === 'function') {
        customConfig.onInitComplete.call(this)
      }
    },
  }

  return $(tableSelector).DataTable(fullConfig)
}

export function refreshDataTable(tableSelector, config) {
  const table = $(tableSelector).DataTable()
  if (table) {
    table.destroy()
    $(tableSelector).empty()
  }
  return initDataTable(tableSelector, config)
}
