import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Spinner,
} from '@heroui/react'
import { Alert } from '@mui/material'
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

const buildTree = (list) => {
  const map = {}
  const roots = []
  list.forEach((item) => {
    map[item.id] = { ...item, filhos: [] }
  })

  list.forEach((item) => {
    if (item.planoContasPaiId && map[item.planoContasPaiId]) {
      map[item.planoContasPaiId].filhos.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })
  return roots
}

const sortTree = (nodes) => {
  nodes.sort((a, b) => a.descricao.localeCompare(b.descricao))
  nodes.forEach((node) => {
    if (node.filhos.length > 0) {
      sortTree(node.filhos)
    }
  })
  return nodes
}

const renderTreeItems = (nodes, level = 0) => {
  return nodes.flatMap((node) => [
    <SelectItem
      key={node.id}
      value={String(node.id)}
      textValue={node.descricao}
    >
      <span style={{ paddingLeft: `${level * 1.5}rem` }}>{node.descricao}</span>
    </SelectItem>,
    ...(node.filhos.length > 0 ? renderTreeItems(node.filhos, level + 1) : []),
  ])
}

const initialState = {
  descricao: '',
  tipo: 2,
  planoContasPaiId: '',
}

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

const PlanoContaCreateForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialState)
  const [todosPlanosPai, setTodosPlanosPai] = useState([])

  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlanosPai = useCallback(() => {
    axios
      .get('/api/planoContas/pais')
      .then((response) => {
        setTodosPlanosPai(response.data)
      })
      .catch((err) => {
        setError('Erro ao recarregar a lista de planos de contas.')
        console.error(err)
      })
  }, [])

  useEffect(() => {
    setPageLoading(true)
    axios
      .get('/api/planoContas/pais')
      .then((response) => {
        setTodosPlanosPai(response.data)
      })
      .catch((err) => {
        setError('Erro ao carregar a lista de planos de contas.')
        console.error(err)
      })
      .finally(() => setPageLoading(false))
  }, [])

  const planosPaiFiltrados = useMemo(() => {
    return todosPlanosPai.filter((p) => p.tipo === formData.tipo)
  }, [todosPlanosPai, formData.tipo])

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTipoChange = (key) => {
    const novoTipo = parseInt(key, 10)
    setFormData((prev) => ({
      ...prev,
      tipo: novoTipo,
      planoContasPaiId: '',
    }))
  }

  const sendCreateRequest = async (confirmarMigracao = false) => {
    const dadosParaEnviar = {
      ...formData,
      // Garante que o tipo seja enviado como número
      tipo: Number(formData.tipo),
      // Envia null se o campo estiver vazio
      planoContasPaiId: formData.planoContasPaiId || null,
    }

    let url = '/api/planoContas'
    if (confirmarMigracao) {
      url += '?confirmarMigracao=true'
    }

    return axios.post(url, dadosParaEnviar)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await sendCreateRequest(false)
      showNotification('Plano de Contas criado com sucesso.', 'success')
      setFormData(initialState)
      fetchPlanosPai()
    } catch (err) {
      const { response } = err
      if (
        response &&
        response.status === 409 &&
        response.data.requerConfirmacao
      ) {
        if (window.confirm(response.data.message)) {
          try {
            await sendCreateRequest(true)
            showNotification(
              'Plano de Contas criado e lançamentos migrados com sucesso.',
              'success',
            )
            setFormData(initialState)
            fetchPlanosPai()
          } catch (finalErr) {
            setError(
              finalErr.response?.data?.message ||
                'Erro ao confirmar a criação com migração.',
            )
            showNotification(
              finalErr.response?.data?.message ||
                'Erro ao confirmar a criação com migração.',
              'error',
            )
          }
        }
      } else {
        setError(
          response?.data?.message || 'Erro ao salvar. Verifique os dados.',
        )
        showNotification(
          response?.data?.message || 'Erro ao salvar. Verifique os dados.',
          'error',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const arvoreFiltrada = useMemo(
    () => sortTree(buildTree(planosPaiFiltrados)),
    [planosPaiFiltrados],
  )

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Carregando..." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Novo Plano de Contas
      </h1>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs
          aria-label="Tipo do Plano"
          selectedKey={String(formData.tipo)}
          onSelectionChange={handleTipoChange}
          color="primary"
          radius="md"
        >
          <Tab key="1" title="Receita" />
          <Tab key="2" title="Despesa" />
        </Tabs>

        <Input
          label="Descrição"
          name="descricao"
          value={formData.descricao}
          onValueChange={(value) => handleChange('descricao', value)}
          isRequired
          fullWidth
        />

        <Select
          label="Plano de Contas Pai (Opcional)"
          selectedKeys={
            formData.planoContasPaiId ? [String(formData.planoContasPaiId)] : []
          }
          onSelectionChange={(keys) =>
            handleChange('planoContasPaiId', Array.from(keys)[0] || '')
          }
          fullWidth
        >
          <SelectItem key="" value="">
            Nenhum
          </SelectItem>
          {renderTreeItems(arvoreFiltrada)}
        </Select>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            color="primary"
            isDisabled={loading}
            startIcon={
              loading ? <Spinner color="current" size="sm" /> : <SaveIcon />
            }
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            variant="bordered"
            onClick={() => navigate('/PlanoContas')}
            startIcon={<ArrowBackIcon />}
          >
            Voltar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PlanoContaCreateForm
