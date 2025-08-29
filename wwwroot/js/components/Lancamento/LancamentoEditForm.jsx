import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import axios from 'axios'

const API_PESSOAS = '/api/pessoas'
const API_PLANOS_CONTAS = '/api/planoContas/hierarquia'
const API_CONTAS_BANCARIAS = '/api/contas'

const getLeafNodes = (nodes) => {
  let leafNodes = []
  if (!Array.isArray(nodes)) return leafNodes
  nodes.forEach((node) => {
    if (!node.filhos || node.filhos.length === 0) {
      leafNodes.push(node)
    } else {
      leafNodes = leafNodes.concat(getLeafNodes(node.filhos))
    }
  })
  return leafNodes
}

const renderSelectOptions = (items, keyField, valueField) => {
  if (!Array.isArray(items)) return null
  return items.map((item) => (
    <MenuItem key={item[keyField]} value={item[keyField]}>
      {item[valueField]}
    </MenuItem>
  ))
}

const LancamentoEditForm = ({ lancamentoId }) => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(null)
  const [pessoas, setPessoas] = useState([])
  const [planosContas, setPlanosContas] = useState([])
  const [contasBancarias, setContasBancarias] = useState([])
  const [loading, setLoading] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pessoasRes, planosRes, contasRes, lancamentoRes] =
          await axios.all([
            axios.get(API_PESSOAS),
            axios.get(API_PLANOS_CONTAS),
            axios.get(API_CONTAS_BANCARIAS),
            axios.get(`/api/lancamentos/${lancamentoId}`),
          ])

        setPessoas(pessoasRes.data.data || pessoasRes.data || [])
        setPlanosContas(planosRes.data || [])
        setContasBancarias(contasRes.data.data || contasRes.data || [])

        const lancamento = lancamentoRes.data.data
        setFormData({
          descricao: lancamento.descricao,
          tipo: lancamento.tipo === 'Receita' ? '1' : '2',
          valor: lancamento.valor,
          dataCompetencia: lancamento.dataCompetencia?.slice(0, 10) || '',
          dataVencimento: lancamento.dataVencimento?.slice(0, 10) || '',
          dataPagamento: lancamento.dataPagamento?.slice(0, 10) || '',
          pago: lancamento.pago,
          contaBancariaId: lancamento.contaBancaria?.id || '',
          planoContasId: lancamento.planoContas?.id || '',
          pessoaId: lancamento.pessoa?.id || '',
        })
      } catch (error) {
        const eventoErro = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: 'Erro ao carregar os dados para edição.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoErro)
        navigate('/lancamentos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lancamentoId, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const finalValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: finalValue }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)

    const dados = {
      ...formData,
      tipo: formData.tipo === '1' ? 'R' : 'D',
      planoContasId: formData.planoContasId || null,
      contaBancariaId: formData.contaBancariaId || null,
      pessoaId: formData.pessoaId || null,
      dataPagamento: formData.dataPagamento || null,
    }

    try {
      await axios.put(`/api/lancamentos/${lancamentoId}`, dados)
      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Lançamento atualizado com sucesso.',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)
      navigate('/lancamentos')
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data.errors || {})
        const eventoAlerta = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: 'Por favor, corrija os erros no formulário.',
            variant: 'warning',
          },
        })
        window.dispatchEvent(eventoAlerta)
      } else {
        const eventoErro = new CustomEvent('onNotificacao', {
          detail: {
            mensagem:
              error.response?.data?.message || 'Erro ao salvar alterações.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoErro)
      }
    } finally {
      setFormSubmitting(false)
    }
  }

  const planosDeContaFilhos = getLeafNodes(
    planosContas.filter((p) => p.tipo.toString() === formData?.tipo),
  )

  if (loading || !formData) {
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
        Editar Lançamento
      </Typography>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Tipo de Lançamento</FormLabel>
        <RadioGroup row name="tipo" value={formData.tipo}>
          <FormControlLabel
            value="1"
            control={<Radio />}
            label="Receita"
            disabled
          />
          <FormControlLabel
            value="2"
            control={<Radio />}
            label="Despesa"
            disabled
          />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={8}>
          <TextField
            name="descricao"
            label="Descrição"
            value={formData.descricao || ''}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.Descricao}
            helperText={errors.Descricao?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="valor"
            label="Valor (R$)"
            type="number"
            value={formData.valor || ''}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.Valor}
            helperText={errors.Valor?.[0]}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <TextField
            select
            label="Pessoa (Cliente/Fornecedor)"
            name="pessoaId"
            value={formData.pessoaId || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.PessoaId}
            helperText={errors.PessoaId?.[0]}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {renderSelectOptions(pessoas, 'id', 'nome')}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <TextField
            select
            label="Plano de Contas"
            name="planoContasId"
            value={formData.planoContasId || ''}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.PlanoContasId}
            helperText={errors.PlanoContasId?.[0]}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            {renderSelectOptions(planosDeContaFilhos, 'id', 'descricao')}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <TextField
            select
            label="Conta Bancária"
            name="contaBancariaId"
            value={formData.contaBancariaId || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.ContaBancariaId}
            helperText={errors.ContaBancariaId?.[0]}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">
              <em>Nenhuma</em>
            </MenuItem>
            {renderSelectOptions(contasBancarias, 'id', 'descricao')}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            name="dataCompetencia"
            label="Data de Competência"
            type="date"
            value={formData.dataCompetencia || ''}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.DataCompetencia}
            helperText={errors.DataCompetencia?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            name="dataVencimento"
            label="Data de Vencimento"
            type="date"
            value={formData.dataVencimento || ''}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.DataVencimento}
            helperText={errors.DataVencimento?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Situação"
            name="pago"
            value={formData.pago}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value={false}>Em Aberto</MenuItem>
            <MenuItem value={true}>Pago</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            name="dataPagamento"
            label="Data de Pagamento"
            type="date"
            value={formData.dataPagamento || ''}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={!formData.pago}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={formSubmitting}
          startIcon={
            formSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {formSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/lancamentos')}
          startIcon={<ArrowBackIcon />}
        >
          Voltar
        </Button>
      </Box>
    </Box>
  )
}

export default LancamentoEditForm
