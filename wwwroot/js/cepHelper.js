// wwwroot/js/cepConsult.js
export class cepHelper {
  constructor(options) {
    // Configurações padrão
    this.defaults = {
      cepSelector: '#cep',
      enderecoSelector: '#endereco',
      bairroSelector: '#bairro',
      cidadeSelector: '#cidade',
      estadoSelector: '#estado',
      complementoSelector: '#complemento',
      debounceTime: 800,
      apiUrl: 'https://brasilapi.com.br/api/cep/v2/',
    }

    // Mescla as opções fornecidas com os padrões
    this.settings = { ...this.defaults, ...options }

    // Inicializa
    this.init()
  }

  init() {
    this.setupMasks()
    this.setupEvents()
    this.autoSearchIfFilled()
  }

  setupMasks() {
    $(this.settings.cepSelector).mask('00000-000')
  }

  setupEvents() {
    let cepTimeout = null

    $(this.settings.cepSelector).on('input', () => {
      clearTimeout(cepTimeout)
      cepTimeout = setTimeout(
        () => this.buscarCEP(),
        this.settings.debounceTime,
      )
    })
  }

  autoSearchIfFilled() {
    const cepValue = $(this.settings.cepSelector).val().replace(/\D/g, '')
    if (cepValue.length === 8) {
      this.buscarCEP()
    }
  }

  async buscarCEP() {
    const cep = $(this.settings.cepSelector).val().replace(/\D/g, '')

    if (cep.length !== 8) return

    try {
      this.clearAddressFields()

      const response = await $.get(`${this.settings.apiUrl}${cep}`)
      this.fillAddressFields(response)

      if ($(this.settings.enderecoSelector).val()) {
        $(this.settings.numeroSelector).focus()
      }
    } catch (error) {
      if (error.status !== 404) {
        console.error('Erro ao buscar CEP:', error)
        alert('Erro ao consultar CEP. Tente novamente.')
      }
    }
  }

  clearAddressFields() {
    $(`${this.settings.enderecoSelector}, 
           ${this.settings.bairroSelector}, 
           ${this.settings.cidadeSelector}, 
           ${this.settings.estadoSelector}, 
           ${this.settings.complementoSelector}`).val('')
  }

  fillAddressFields(data) {
    $(this.settings.enderecoSelector).val(data.street || '')
    $(this.settings.bairroSelector).val(data.neighborhood || '')
    $(this.settings.cidadeSelector).val(data.city || '')
    $(this.settings.estadoSelector).val(data.state || '')
    $(this.settings.complementoSelector).val(data.complement || '')
  }
}
