import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  MenuItem,
  Alert,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import axios from 'axios'

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
    <MenuItem
      key={node.id}
      value={node.id}
      sx={{ paddingLeft: `${1 + level * 2}rem` }}
    >
      {node.descricao}
    </MenuItem>,
    ...(node.filhos.length > 0 ? renderTreeItems(node.filhos, level + 1) : []),
  ])
}

const initialState = {
  descricao: '',
  tipo: 2,
  planoContasPaiId: '',
}

const PlanoContaCreateForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialState)
  const [todosPlanosPai, setTodosPlanosPai] = useState([])
  const [planosPaiFiltrados, setPlanosPaiFiltrados] = useState([])

  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlanosPai = useCallback(() => {
    setPageLoading(true)
    axios
      .get('/api/planoContas/pais')
      .then((response) => {
        const planos = response.data
        setTodosPlanosPai(planos)

        setPlanosPaiFiltrados(planos.filter((p) => p.tipo === formData.tipo))
      })
      .catch((err) => {
        setError('Erro ao carregar a lista de planos de contas.')
        console.error(err)
      })
      .finally(() => {
        setPageLoading(false)
      })
  }, [formData.tipo])

  useEffect(() => {
    fetchPlanosPai()
  }, [fetchPlanosPai])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTipoChange = (event) => {
    const novoTipo = parseInt(event.target.value, 10)
    setFormData((prev) => ({
      ...prev,
      tipo: novoTipo,
      planoContasPaiId: '',
    }))
    setPlanosPaiFiltrados(todosPlanosPai.filter((p) => p.tipo === novoTipo))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const dadosParaEnviar = {
      ...formData,
      planoContasPaiId: formData.planoContasPaiId || null,
    }

    try {
      await axios.post('/api/planoContas', dadosParaEnviar)
      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Plano de Contas criado com sucesso.',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)

      setFormData(initialState)
      fetchPlanosPai()
    } catch (err) {
      const apiErrorMessage =
        err.response?.data?.message || 'Erro ao salvar. Verifique os dados.'
      setError(apiErrorMessage)
    } finally {
      setLoading(false)
    }
  }

  const arvoreFiltrada = sortTree(buildTree(planosPaiFiltrados))

  if (pageLoading && todosPlanosPai.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Novo Plano de Contas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            name="descricao"
            label="Descrição"
            value={formData.descricao}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Tipo</FormLabel>
            <RadioGroup
              row
              name="tipo"
              value={formData.tipo}
              onChange={handleTipoChange}
            >
              <FormControlLabel value={1} control={<Radio />} label="Receita" />
              <FormControlLabel value={2} control={<Radio />} label="Despesa" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            name="planoContasPaiId"
            label="Plano de Contas Pai (Opcional)"
            value={formData.planoContasPaiId}
            onChange={handleChange}
            fullWidth
            sx={{ minWidth: 270 }}
          >
            <MenuItem value="">
              <em>Nenhum (Conta Principal)</em>
            </MenuItem>
            {renderTreeItems(arvoreFiltrada)}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/PlanoContas')}
          startIcon={<ArrowBackIcon />}
        >
          Voltar para Lista
        </Button>
      </Box>
    </Box>
  )
}

export default PlanoContaCreateForm
