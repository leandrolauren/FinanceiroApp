import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Tabs, Tab, Spinner, Checkbox } from '@heroui/react'
import axios from 'axios'

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

const tipoEnumToString = {
  1: 'Corrente',
  2: 'Poupanca',
  3: 'Salario',
  4: 'Investimento',
}
const tipoStringToEnum = {
  Corrente: 1,
  Poupanca: 2,
  Salario: 3,
  Investimento: 4,
}

const EditContaForm = ({ contaId }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchConta = async () => {
      try {
        const response = await axios.get(`/api/contas/${contaId}`)
        const contaData = response.data.data
        setFormData({
          ...contaData,
          tipo: tipoEnumToString[contaData.tipo],
        })
      } catch (error) {
        showNotification(
          error.response?.data?.message || 'Erro ao carregar dados da conta.',
          'error',
        )
        navigate('/contas')
      } finally {
        setIsLoading(false)
      }
    }
    fetchConta()
  }, [contaId, navigate])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.name]: e.value }))
  }

  const handleDynamicChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const dataToSubmit = {
      ...formData,
      tipo: tipoStringToEnum[formData.tipo],
    }

    try {
      await axios.put(`/api/contas/${contaId}`, dataToSubmit)
      showNotification('Conta bancária atualizada com sucesso!', 'success')
      navigate('/contas')
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
          error.response?.data?.message ||
            'Erro ao atualizar a conta bancária.',
          'error',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Carregando dados da conta..." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 rounded-lg shadow-sm text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Editar Conta Bancária</h1>

      {formData && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs
            aria-label="Tipo de Conta"
            selectedKey={formData.tipo}
            onSelectionChange={(key) => handleDynamicChange('tipo', key)}
            color="primary"
            radius="md"
          >
            <Tab key="Corrente" title="Corrente" />
            <Tab key="Poupanca" title="Poupança" />
            <Tab key="Salario" title="Salário" />
            <Tab key="Investimento" title="Investimento" />
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            <Input
              className="md:col-span-6"
              name="descricao"
              label="Descrição da Conta"
              value={formData.descricao || ''}
              onValueChange={(v) => handleDynamicChange('descricao', v)}
              isRequired
              isInvalid={!!errors.Descricao}
              errorMessage={errors.Descricao?.[0]}
            />

            <Input
              className="md:col-span-2"
              name="banco"
              label="Banco"
              value={formData.banco || ''}
              onValueChange={(v) => handleDynamicChange('banco', v)}
              isInvalid={!!errors.Banco}
              errorMessage={errors.Banco?.[0]}
            />

            <Input
              name="agencia"
              label="Agência"
              value={formData.agencia || ''}
              onValueChange={(v) => handleDynamicChange('agencia', v)}
              isInvalid={!!errors.Agencia}
              errorMessage={errors.Agencia?.[0]}
            />

            <Input
              name="digitoAgencia"
              label="Dígito Agência"
              value={formData.digitoAgencia || ''}
              onValueChange={(v) => handleDynamicChange('digitoAgencia', v)}
              maxLength={2}
              isInvalid={!!errors.DigitoAgencia}
              errorMessage={errors.DigitoAgencia?.[0]}
            />

            <Input
              className="md:col-span-3"
              name="numeroConta"
              label="Número da Conta"
              value={formData.numeroConta || ''}
              onValueChange={(v) => handleDynamicChange('numeroConta', v)}
              isInvalid={!!errors.NumeroConta}
              errorMessage={errors.NumeroConta?.[0]}
            />

            <Input
              className="md:col-span-2"
              name="digitoConta"
              label="Dígito Conta"
              value={formData.digitoConta || ''}
              onValueChange={(v) => handleDynamicChange('digitoConta', v)}
              maxLength={2}
              isInvalid={!!errors.DigitoConta}
              errorMessage={errors.DigitoConta?.[0]}
            />

            <Checkbox
              isSelected={formData.ativa || false}
              onValueChange={(v) => handleDynamicChange('ativa', v)}
            >
              Conta Ativa?
            </Checkbox>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              color="primary"
              isDisabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button
              variant="bordered"
              onClick={() => navigate('/contas')}
              startIcon={<ArrowBackIcon />}
            >
              Voltar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default EditContaForm
