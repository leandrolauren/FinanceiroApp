import React from 'react'
import { IMaskInput } from 'react-imask'
import axios from 'axios'

export const CpfMask = React.forwardRef(function CpfMask(props, ref) {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask="000.000.000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  )
})

export const CnpjMask = React.forwardRef(function CnpjMask(props, ref) {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask="00.000.000/0000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  )
})

export const TelefoneMask = React.forwardRef(function TelefoneMask(props, ref) {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  )
})

export const CepMask = React.forwardRef(function CepMask(props, ref) {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask="00000-000"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  )
})

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

export function formatarCpf(cpf) {
  if (!cpf) return ''
  const cleaned = String(cpf).replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

export function formatarCnpj(cnpj) {
  if (!cnpj) return ''
  const cleaned = String(cnpj).replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  )
}

export function formatarTelefone(tel) {
  if (!tel) return ''
  const cleaned = String(tel).replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }
  return tel
}

export function formatarCep(cep) {
  if (!cep) return ''
  const cleaned = String(cep).replace(/\D/g, '')
  if (cleaned.length !== 8) return cep
  return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2')
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
