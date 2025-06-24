import { MaskService } from './masks.js'

export function initMasks(selectors) {
  // Configurações padrão para máscaras comuns
  const defaultMasks = {
    '[data-mask="cep"]': 'cep',
    '[data-mask="cpf"]': 'cpf',
    '[data-mask="cnpj"]': 'cnpj',
    '[data-mask="telefone"]': 'telefone',
    '[data-mask="rg"]': 'rg',
    '[data-mask="data"]': 'data',
    '[data-mask="hora"]': 'hora',
    '[data-mask="dinheiro"]': 'dinheiro',
    '[data-mask="porcentagem"]': 'porcentagem',
  }

  // Mescla com as configurações fornecidas
  const config = { ...defaultMasks, ...selectors }

  // Aplica as máscaras
  Object.entries(config).forEach(([selector, maskName]) => {
    document.querySelectorAll(selector).forEach((element) => {
      MaskService.apply(element, maskName)
    })
  })
}
