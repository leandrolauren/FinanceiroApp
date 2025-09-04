import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import axios from 'axios'

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

const CreateContaForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    Descricao: '',
    NumeroConta: '',
    DigitoConta: '',
    Agencia: '',
    DigitoAgencia: '',
    Banco: '',
    Tipo: 'Corrente',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
            'Erro ao cadastrar a conta bancária.',
          'error',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Nova Conta Bancária
      </Typography>

      <FormControl
        component="fieldset"
        sx={{ my: 2, width: '100%', alignItems: 'center' }}
      >
        <FormLabel component="legend">Tipo de Conta</FormLabel>
        <RadioGroup
          row
          name="Tipo"
          value={formData.Tipo}
          onChange={handleChange}
        >
          <FormControlLabel
            value="Corrente"
            control={<Radio />}
            label="Corrente"
          />
          <FormControlLabel
            value="Poupanca"
            control={<Radio />}
            label="Poupança"
          />
          <FormControlLabel
            value="Salario"
            control={<Radio />}
            label="Salário"
          />
          <FormControlLabel
            value="Investimento"
            control={<Radio />}
            label="Investimento"
          />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="Descricao"
            label="Descrição da Conta"
            value={formData.Descricao}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.Descricao}
            helperText={errors.Descricao?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="Banco"
            label="Banco"
            value={formData.Banco}
            onChange={handleChange}
            fullWidth
            error={!!errors.Banco}
            helperText={errors.Banco?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            name="Agencia"
            label="Agência"
            value={formData.Agencia}
            onChange={handleChange}
            fullWidth
            error={!!errors.Agencia}
            helperText={errors.Agencia?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            name="DigitoAgencia"
            label="Dígito Agência"
            value={formData.DigitoAgencia}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 2 }}
            error={!!errors.DigitoAgencia}
            helperText={errors.DigitoAgencia?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="NumeroConta"
            label="Número da Conta"
            value={formData.NumeroConta}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.NumeroConta}
            helperText={errors.NumeroConta?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            name="DigitoConta"
            label="Dígito Conta"
            value={formData.DigitoConta}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 2 }}
            error={!!errors.DigitoConta}
            helperText={errors.DigitoConta?.[0]}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/contas')}
          startIcon={<ArrowBackIcon />}
        >
          Voltar
        </Button>
      </Box>
    </Box>
  )
}

export default CreateContaForm
