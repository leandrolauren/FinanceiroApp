import axios from 'axios'

export const buscarEnderecoPorCep = async (cep) => {
  const cepLimpo = cep.replace(/\D/g, '')
  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido.')
  }
  const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
  if (response.data.erro) {
    throw new Error('CEP não encontrado.')
  }
  return response.data
}

export const buscarDadosPorCnpj = async (cnpj) => {
  const cnpjLimpo = cnpj.replace(/\D/g, '')
  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ inválido.')
  }
  const response = await axios.get(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
  )
  return response.data
}

export function formatarCpf(value) {
  if (!value) return ''
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatarCnpj(value) {
  if (!value) return ''
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function formatarTelefone(value) {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '').slice(0, 11)

  if (cleaned.length > 10) {
    // Celular (11 dígitos)
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }
  // Telefone (10 dígitos ou menos)
  return cleaned
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function formatarCep(value) {
  if (!value) return ''
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export const formatarData = (data) => {
  if (!data) return '---'
  const date = new Date(data)
  if (isNaN(date.getTime())) {
    return '---'
  }
  return new Date(
    date.valueOf() + date.getTimezoneOffset() * 60000,
  ).toLocaleDateString('pt-BR')
}

export const limparMascaras = (formData) => {
  const dadosLimpos = { ...formData }

  if (dadosLimpos.cpf) dadosLimpos.cpf = dadosLimpos.cpf.replace(/\D/g, '')
  if (dadosLimpos.cnpj) dadosLimpos.cnpj = dadosLimpos.cnpj.replace(/\D/g, '')
  if (dadosLimpos.cep) dadosLimpos.cep = dadosLimpos.cep.replace(/\D/g, '')
  if (dadosLimpos.telefone)
    dadosLimpos.telefone = dadosLimpos.telefone.replace(/\D/g, '')

  return dadosLimpos
}
