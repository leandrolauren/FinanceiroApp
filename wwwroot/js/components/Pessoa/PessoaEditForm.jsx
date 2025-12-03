import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Tabs, Tab, Spinner } from '@heroui/react'
import axios from 'axios'
import {
  buscarDadosPorCnpj,
  buscarEnderecoPorCep,
  limparMascaras,
  formatarCpf,
  formatarCnpj,
  formatarTelefone,
  formatarCep,
} from '../../utils/form-utils'

// --- Ícones ---
const SaveIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const ArrowBackIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 12H5" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

const PessoaEditForm = ({ pessoaId }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cnpjLoading, setCnpjLoading] = useState(false)

  useEffect(() => {
    const fetchPessoa = async () => {
      try {
        const response = await axios.get(`/api/pessoas/${pessoaId}`)
        const data = response.data
        if (data.dataNascimento) {
          data.dataNascimento = data.dataNascimento.split('T')[0]
        }
        const maskedData = {
          ...data,
          cpf: data.cpf ? formatarCpf(data.cpf) : '',
          cnpj: data.cnpj ? formatarCnpj(data.cnpj) : '',
          telefone: data.telefone ? formatarTelefone(data.telefone) : '',
          cep: data.cep ? formatarCep(data.cep) : '',
        }
        setFormData(maskedData)
      } catch (error) {
        showNotification(
          error.response.data.message || 'Erro ao carregar a pessoa.',
          'error',
        )
        navigate('/pessoas')
      } finally {
        setLoading(false)
      }
    }

    if (pessoaId) {
      fetchPessoa()
    }
  }, [pessoaId, navigate])

  const handleChange = useCallback((name, value) => {
    let formattedValue = value
    switch (name) {
      case 'cpf':
        formattedValue = formatarCpf(value)
        break
      case 'cnpj':
        formattedValue = formatarCnpj(value)
        break
      case 'telefone':
        formattedValue = formatarTelefone(value)
        break
      case 'cep':
        formattedValue = formatarCep(value)
        break
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }, [])

  const handleCepBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '')
    if (cep?.length !== 8) return

    setCepLoading(true)
    try {
      const data = await buscarEnderecoPorCep(formData.cep)
      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }))
    } catch (error) {
      showNotification('CEP não encontrado ou inválido.', 'warning')
      console.error(error.message || 'Erro ao buscar CEP.')
    } finally {
      setCepLoading(false)
    }
  }

  const handleCnpjBlur = async () => {
    const cnpj = formData.cnpj?.replace(/\D/g, '')
    if (cnpj?.length !== 14) return

    setCnpjLoading(true)
    try {
      const data = await buscarDadosPorCnpj(formData.cnpj)
      setFormData((prev) => ({
        ...prev,
        nome: data.nome_fantasia || '',
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        email: data.email || prev.email,
        telefone: data.ddd_telefone_1 || prev.telefone,
        cep: data.cep || '',
        endereco: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        cidade: data.municipio || '',
        estado: data.uf || '',
        complemento: data.complemento || '',
      }))
    } catch (error) {
      showNotification('Erro ao buscar CNPJ.', 'error')
    } finally {
      setCnpjLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { email } = formData
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      showNotification('O formato do e-mail é inválido.', 'warning')
      setErrors((prev) => ({
        ...prev,
        Email: ['O formato do e-mail é inválido.'],
      }))
      return
    }
    setFormSubmitting(true)

    const dados = { ...limparMascaras(formData), tipo: formData.tipo }
    if (!dados.nome && dados.razaoSocial) dados.nome = dados.razaoSocial

    for (const key in dados) {
      if (dados[key] === '') {
        dados[key] = null
      }
    }

    try {
      await axios.put(`/api/pessoas/${pessoaId}`, dados)
      showNotification('Pessoa alterada com sucesso!', 'success')
      navigate('/pessoas')
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data.errors || {})
        showNotification(
          error.response.data.message ||
            'Por favor, corrija os erros no formulário.',
          'warning',
        )
      } else {
        showNotification(
          error.response.data.message || 'Ocorreu um erro ao salvar a pessoa.',
          'error',
        )
      }
    } finally {
      setFormSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Carregando dados da pessoa..." />
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 rounded-lg shadow-sm text-gray-900 dark:text-gray-100">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Editar Pessoa</h1>

      {formData && (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <Tabs
            aria-label="Tipo de Pessoa"
            selectedKey={String(formData.tipo)}
            color="primary"
            radius="md"
            isDisabled
            size="sm"
            classNames={{
              tabContent:
                'group-data-[selected=true]:group-data-[disabled=true]:text-white/90',
              tabList: "flex-wrap"
            }}
          >
            <Tab key="1" title="Pessoa Física" />
            <Tab key="2" title="Pessoa Jurídica" />
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {String(formData.tipo) === '1' && (
              <>
                <Input
                  name="nome"
                  label="Nome Completo"
                  value={formData.nome || ''}
                  onValueChange={(v) => handleChange('nome', v)}
                  isRequired
                  isInvalid={!!errors.Nome}
                  errorMessage={errors.Nome?.[0]}
                />
                <Input
                  name="cpf"
                  label="CPF"
                  value={formData.cpf || ''}
                  onValueChange={(v) => handleChange('cpf', v)}
                  isRequired
                  isInvalid={!!errors.Cpf}
                  errorMessage={errors.Cpf?.[0]}
                />
                <Input
                  name="rg"
                  label="RG"
                  value={formData.rg || ''}
                  onValueChange={(v) => handleChange('rg', v)}
                />
                <Input
                  name="dataNascimento"
                  label="Data de Nascimento"
                  type="date"
                  value={formData.dataNascimento || ''}
                  onValueChange={(v) => handleChange('dataNascimento', v)}
                />
              </>
            )}

            {String(formData.tipo) === '2' && (
              <>
                <Input
                  name="razaoSocial"
                  label="Razão Social"
                  value={formData.razaoSocial || ''}
                  onValueChange={(v) => handleChange('razaoSocial', v)}
                  isRequired
                  isInvalid={!!errors.razaoSocial}
                  errorMessage={errors.razaoSocial?.[0]}
                />
                <Input
                  name="nomeFantasia"
                  label="Nome Fantasia"
                  value={formData.nomeFantasia || ''}
                  onValueChange={(v) => handleChange('nomeFantasia', v)}
                />
                <Input
                  name="cnpj"
                  label="CNPJ"
                  value={formData.cnpj || ''}
                  onValueChange={(v) => handleChange('cnpj', v)}
                  onBlur={handleCnpjBlur}
                  isRequired
                  isInvalid={!!errors.Cnpj}
                  errorMessage={errors.Cnpj?.[0]}
                  endContent={
                    cnpjLoading && <Spinner size="sm" color="primary" />
                  }
                />
                <Input
                  name="inscricaoEstadual"
                  label="Inscrição Estadual"
                  value={formData.inscricaoEstadual || ''}
                  onValueChange={(v) => handleChange('inscricaoEstadual', v)}
                />
              </>
            )}

            <Input
              name="telefone"
              label="Telefone"
              value={formData.telefone || ''}
              onValueChange={(v) => handleChange('telefone', v)}
            />
            <Input
              name="email"
              label="E-mail"
              type="email"
              value={formData.email || ''}
              onValueChange={(v) => handleChange('email', v)}
              isInvalid={!!errors.Email}
              errorMessage={errors.Email?.[0]}
            />
            <Input
              name="cep"
              label="CEP"
              value={formData.cep || ''}
              onValueChange={(v) => handleChange('cep', v)}
              onBlur={handleCepBlur}
              endContent={cepLoading && <Spinner size="sm" color="primary" />}
            />
            <Input
              name="endereco"
              label="Endereço"
              value={formData.endereco || ''}
              onValueChange={(v) => handleChange('endereco', v)}
            />
            <Input
              name="numero"
              label="Número"
              value={formData.numero || ''}
              onValueChange={(v) => handleChange('numero', v)}
            />
            <Input
              name="bairro"
              label="Bairro"
              value={formData.bairro || ''}
              onValueChange={(v) => handleChange('bairro', v)}
            />
            <Input
              name="cidade"
              label="Cidade"
              value={formData.cidade || ''}
              onValueChange={(v) => handleChange('cidade', v)}
            />
            <Input
              name="estado"
              label="Estado"
              value={formData.estado || ''}
              onValueChange={(v) => handleChange('estado', v)}
            />
            <Input
              name="complemento"
              label="Complemento"
              value={formData.complemento || ''}
              onValueChange={(v) => handleChange('complemento', v)}
              className="md:col-span-2"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="submit"
              color="primary"
              isDisabled={formSubmitting}
              startIcon={
                formSubmitting ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <SaveIcon />
                )
              }
              className="w-full sm:w-auto"
              size="sm"
            >
              {formSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button
              variant="bordered"
              onClick={() => navigate('/pessoas')}
              startIcon={<ArrowBackIcon />}
              className="w-full sm:w-auto"
              size="sm"
            >
              Voltar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PessoaEditForm
