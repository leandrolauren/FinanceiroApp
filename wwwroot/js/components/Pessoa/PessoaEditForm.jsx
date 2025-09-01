import React, { useState, useEffect } from 'react'
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
  InputAdornment,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import axios from 'axios'
import {
  CpfMask,
  CnpjMask,
  TelefoneMask,
  CepMask,
  buscarDadosPorCnpj,
  buscarEnderecoPorCep,
  limparMascaras,
} from '../../utils/form-utils'

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
  const [tipoPessoa, setTipoPessoa] = useState('1')
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
        console.log('Dados da pessoa:', data)
        if (data.dataNascimento) {
          data.dataNascimento = data.dataNascimento.split('T')[0]
        }
        setFormData(data)
        setTipoPessoa(data.tipo.toString())
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleCepBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '')
    if (cep?.length !== 8) return

    setCepLoading(true)
    try {
      const data = await buscarEnderecoPorCep(formData.cep)
      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      }))
    } catch (error) {
      showNotification('Erro ao buscar CEP.', 'warning')
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

    const dados = { ...limparMascaras(formData), tipo: tipoPessoa }
    if (!dados.nome && dados.razaoSocial) dados.nome = dados.razaoSocial

    for (const key in dados) {
      if (dados[key] === '') {
        dados[key] = null
      }
    }

    try {
      await axios.put(`/api/pessoas/${pessoaId}`, dados)
      showNotification('Pessoa alterada com sucesso!', 'success')
      setFormSubmitting(false)
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
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
        Editar Pessoa
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Tipo de Pessoa</FormLabel>
        <RadioGroup row value={tipoPessoa}>
          <FormControlLabel
            value="1"
            control={<Radio />}
            label="Física"
            disabled
          />
          <FormControlLabel
            value="2"
            control={<Radio />}
            label="Jurídica"
            disabled
          />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={3}>
        {tipoPessoa === '1' && (
          <>
            <Grid xs={12} sm={6}>
              <TextField
                name="nome"
                label="Nome Completo"
                value={formData.nome || ''}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.Nome}
                helperText={errors.Nome?.[0]}
              />
            </Grid>
            <Grid xs={12} sm={3}>
              <TextField
                name="cpf"
                label="CPF"
                value={formData.cpf || ''}
                onChange={handleChange}
                fullWidth
                required
                slotProps={{ input: { inputComponent: CpfMask } }}
                error={!!errors.Cpf}
                helperText={errors.Cpf?.[0]}
              />
            </Grid>
            <Grid xs={12} sm={3}>
              <TextField
                name="rg"
                label="RG"
                value={formData.rg || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={3}>
              <TextField
                name="dataNascimento"
                label="Data de Nascimento"
                type="date"
                value={formData.dataNascimento || ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        )}

        {tipoPessoa === '2' && (
          <>
            <Grid xs={12} sm={6}>
              <TextField
                name="razaoSocial"
                label="Razão Social"
                value={formData.razaoSocial || ''}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.razaoSocial}
                helperText={errors.razaoSocial?.[0]}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                name="nomeFantasia"
                label="Nome Fantasia"
                value={formData.nomeFantasia || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                name="cnpj"
                label="CNPJ"
                value={formData.cnpj || ''}
                onChange={handleChange}
                onBlur={handleCnpjBlur}
                fullWidth
                required
                slotProps={{
                  input: {
                    inputComponent: CnpjMask,
                    endAdornment: cnpjLoading && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ),
                  },
                }}
                error={!!errors.Cnpj}
                helperText={errors.Cnpj?.[0]}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                name="inscricaoEstadual"
                label="Inscrição Estadual"
                value={formData.inscricaoEstadual || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </>
        )}

        <Grid xs={12} sm={4}>
          <TextField
            name="telefone"
            label="Telefone"
            value={formData.telefone || ''}
            onChange={handleChange}
            fullWidth
            slotProps={{ input: { inputComponent: TelefoneMask } }}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="email"
            label="E-mail"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.Email}
            helperText={errors.Email?.[0]}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="cep"
            label="CEP"
            value={formData.cep || ''}
            onChange={handleChange}
            onBlur={handleCepBlur}
            fullWidth
            slotProps={{
              input: {
                inputComponent: CepMask,
                endAdornment: cepLoading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={8}>
          <TextField
            name="endereco"
            label="Endereço"
            value={formData.endereco || ''}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="numero"
            label="Número"
            value={formData.numero || ''}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="bairro"
            label="Bairro"
            value={formData.bairro || ''}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="cidade"
            label="Cidade"
            value={formData.cidade || ''}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="estado"
            label="Estado"
            value={formData.estado || ''}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            name="complemento"
            label="Complemento"
            value={formData.complemento || ''}
            onChange={handleChange}
            fullWidth
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
          onClick={() => navigate('/pessoas')}
          startIcon={<ArrowBackIcon />}
        >
          Voltar
        </Button>
      </Box>
    </Box>
  )
}

export default PessoaEditForm
