import React, { useState } from 'react'
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
  buscarDadosPorCnpj,
  buscarEnderecoPorCep,
  limparMascaras,
  CpfMask,
  CnpjMask,
  TelefoneMask,
  CepMask,
} from '../../utils/form-utils'

const initialState = {
  nome: '',
  cpf: '',
  rg: '',
  dataNascimento: '',
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  inscricaoEstadual: '',
  telefone: '',
  email: '',
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  complemento: '',
}

const PessoaCreateForm = () => {
  const navigate = useNavigate()

  const [tipoPessoa, setTipoPessoa] = useState('2')
  const [formData, setFormData] = useState(initialState)

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cnpjLoading, setCnpjLoading] = useState(false)

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
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }))
      } else {
        const eventoAlerta = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: 'CEP não encontrado.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoAlerta)
      }
    } catch (error) {
      console.log(error.message || 'Erro ao buscar CEP.')
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
      console.log(error.message || 'Erro ao buscar CNPJ.')
    } finally {
      setCnpjLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { email } = formData
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      const eventoAlerta = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Formato do email é inválido.',
          variant: 'error',
        },
      })
      window.dispatchEvent(eventoAlerta)
      setErrors((prev) => ({
        ...prev,
        Email: ['O formato do e-mail é inválido.'],
      }))
      return
    }

    const dados = { ...limparMascaras(formData), tipo: tipoPessoa }
    for (const key in dados) {
      if (dados[key] === '') {
        dados[key] = null
      }
    }

    setLoading(true)

    try {
      await axios.post('/api/pessoas', dados)
      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Pessoa cadastrada com sucesso.',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)
      setFormData(initialState)
      setErrors({})
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data.errors || {})
        const eventoAlerta = new CustomEvent('onNotificacao', {
          detail: {
            mensagem:
              error.response.data.message ||
              'Por favor, corrija os erros no formulário.',
            variant: 'warning',
          },
        })
        window.dispatchEvent(eventoAlerta)
      } else {
        const eventoErro = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: error.response.data.message || 'Erro ao salvar pessoa.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoErro)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Nova Pessoa
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Tipo de Pessoa</FormLabel>
        <RadioGroup
          row
          value={tipoPessoa}
          onChange={(e) => setTipoPessoa(e.target.value)}
        >
          <FormControlLabel value="1" control={<Radio />} label="Física" />
          <FormControlLabel value="2" control={<Radio />} label="Jurídica" />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={3}>
        {tipoPessoa === '1' && (
          <>
            <Grid xs={12} sm={6}>
              <TextField
                name="nome"
                label="Nome Completo"
                value={formData.nome}
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
                value={formData.cpf}
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
                value={formData.rg}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={3}>
              <TextField
                name="dataNascimento"
                label="Data de Nascimento"
                type="date"
                value={formData.dataNascimento}
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
                value={formData.razaoSocial}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.RazaoSocial}
                helperText={errors.RazaoSocial?.[0]}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                name="nomeFantasia"
                label="Nome Fantasia"
                value={formData.nomeFantasia}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                name="cnpj"
                label="CNPJ"
                value={formData.cnpj}
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
                value={formData.inscricaoEstadual}
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
            value={formData.telefone}
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
            value={formData.email}
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
            value={formData.cep}
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
            value={formData.endereco}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="numero"
            label="Número"
            value={formData.numero}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="bairro"
            label="Bairro"
            value={formData.bairro}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="cidade"
            label="Cidade"
            value={formData.cidade}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            name="estado"
            label="Estado"
            value={formData.estado}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            name="complemento"
            label="Complemento"
            value={formData.complemento}
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
          onClick={() => navigate('/pessoas')}
          startIcon={<ArrowBackIcon />}
        >
          Voltar
        </Button>
      </Box>
    </Box>
  )
}

export default PessoaCreateForm
