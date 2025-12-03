import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Tabs, Tab, Spinner } from '@heroui/react'
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

const initialState = {
  Descricao: '',
  NumeroConta: '',
  DigitoConta: '',
  Agencia: '',
  DigitoAgencia: '',
  Banco: '',
  Tipo: 'Corrente',
}

const CreateContaForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Tipo' ? value : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const tipoMap = {
      Corrente: 1,
      Poupanca: 2,
      Salario: 3,
      Investimento: 4,
    }

    const dataToSubmit = {
      ...formData,
      Tipo: tipoMap[formData.Tipo],
    }

    try {
      await axios.post('/api/contas', dataToSubmit)
      showNotification('Conta bancária cadastrada com sucesso!', 'success')
      setFormData(initialState)
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
            'Erro ao cadastrar a conta bancária.',
          'error',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 rounded-lg shadow-sm text-gray-900 dark:text-gray-100">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Nova Conta Bancária</h1>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <Tabs
          aria-label="Tipo de Conta"
          selectedKey={formData.Tipo}
          onSelectionChange={(key) => handleChange('Tipo', key)}
          color="primary"
          radius="md"
          size="sm"
          classNames={{
            tabList: "flex-wrap"
          }}
        >
          <Tab key="Corrente" title="Corrente" />
          <Tab key="Poupanca" title="Poupança" />
          <Tab key="Salario" title="Salário" />
          <Tab key="Investimento" title="Investimento" />
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
          <Input
            className="md:col-span-6"
            name="Descricao"
            label="Descrição da Conta"
            value={formData.Descricao}
            onValueChange={(v) => handleChange('Descricao', v)}
            isRequired
            isInvalid={!!errors.Descricao}
            errorMessage={errors.Descricao?.[0]}
          />

          <Input
            className="md:col-span-2"
            name="Banco"
            label="Banco"
            value={formData.Banco}
            onValueChange={(v) => handleChange('Banco', v)}
            isInvalid={!!errors.Banco}
            errorMessage={errors.Banco?.[0]}
          />

          <Input
            name="Agencia"
            label="Agência"
            value={formData.Agencia}
            onValueChange={(v) => handleChange('Agencia', v)}
            isInvalid={!!errors.Agencia}
            errorMessage={errors.Agencia?.[0]}
          />

          <Input
            name="DigitoAgencia"
            label="Dígito Agência"
            value={formData.DigitoAgencia}
            onValueChange={(v) => handleChange('DigitoAgencia', v)}
            maxLength={2}
            isInvalid={!!errors.DigitoAgencia}
            errorMessage={errors.DigitoAgencia?.[0]}
          />

          <Input
            className="md:col-span-3"
            name="NumeroConta"
            label="Número da Conta"
            value={formData.NumeroConta}
            onValueChange={(v) => handleChange('NumeroConta', v)}
            isInvalid={!!errors.NumeroConta}
            errorMessage={errors.NumeroConta?.[0]}
          />

          <Input
            className="md:col-span-3"
            name="DigitoConta"
            label="Dígito Conta"
            value={formData.DigitoConta}
            onValueChange={(v) => handleChange('DigitoConta', v)}
            maxLength={2}
            isInvalid={!!errors.DigitoConta}
            errorMessage={errors.DigitoConta?.[0]}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
            className="w-full sm:w-auto"
            size="sm"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            variant="bordered"
            onClick={() => navigate('/contas')}
            startIcon={<ArrowBackIcon />}
            className="w-full sm:w-auto"
            size="sm"
          >
            Voltar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateContaForm
