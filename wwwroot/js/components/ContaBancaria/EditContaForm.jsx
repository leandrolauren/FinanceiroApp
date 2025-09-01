import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import '../../../css/leandro.css';

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  });
  window.dispatchEvent(event);
};

const tipoEnumToString = {
  1: 'Corrente',
  2: 'Poupanca',
  3: 'Salario',
  4: 'Investimento',
};
const tipoStringToEnum = {
  Corrente: 1,
  Poupanca: 2,
  Salario: 3,
  Investimento: 4,
};


const EditContaForm = ({ contaId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchConta = async () => {
      try {
        const response = await axios.get(`/api/contas/${contaId}`);
        const contaData = response.data.data;
        setFormData({
          ...contaData,
          tipo: tipoEnumToString[contaData.tipo],
        });
      } catch (error) {
        showNotification(error.response?.data?.message || 'Erro ao carregar dados da conta.', 'error');
        navigate('/contas');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConta();
  }, [contaId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const dataToSubmit = {
      ...formData,
      tipo: tipoStringToEnum[formData.tipo],
    };

    try {
      await axios.put(`/api/contas/${contaId}`, dataToSubmit);
      showNotification('Conta bancária atualizada com sucesso!', 'success');
      navigate('/contas');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data.errors || {});
        showNotification(
          error.response.data.message || 'Por favor, corrija os erros no formulário.',
          'warning',
        );
      } else {
        showNotification(
          error.response?.data?.message || 'Erro ao atualizar a conta bancária.',
          'error',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

   return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Editar Conta Bancária
      </Typography>
      
      <Box className="container" sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <div className="tabs">
          <input className="form-check-input radio-1" type="radio" id="tipoCorrente" name="tipo" value="Corrente" checked={formData.tipo === 'Corrente'} onChange={handleChange} />
          <label className="tab" htmlFor="tipoCorrente">Corrente</label>

          <input className="form-check-input radio-2" type="radio" id="tipoPoupanca" name="tipo" value="Poupanca" checked={formData.tipo === 'Poupanca'} onChange={handleChange} />
          <label className="tab" htmlFor="tipoPoupanca">Poupança</label>

          <input className="form-check-input radio-3" type="radio" id="tipoSalario" name="tipo" value="Salario" checked={formData.tipo === 'Salario'} onChange={handleChange} />
          <label className="tab" htmlFor="tipoSalario">Salário</label>
          
          <input className="form-check-input radio-4" type="radio" id="tipoInvestimento" name="tipo" value="Investimento" checked={formData.tipo === 'Investimento'} onChange={handleChange} />
          <label className="tab" htmlFor="tipoInvestimento">Investimento</label>
          <span className="glider"></span>
        </div>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField name="descricao" label="Descrição da Conta" value={formData.descricao || ''}
            onChange={handleChange} fullWidth required
            error={!!errors.Descricao} helperText={errors.Descricao?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField name="banco" label="Banco" value={formData.banco || ''}
            onChange={handleChange} fullWidth
            error={!!errors.Banco} helperText={errors.Banco?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField name="agencia" label="Agência" value={formData.agencia || ''}
            onChange={handleChange} fullWidth
            error={!!errors.Agencia} helperText={errors.Agencia?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField name="digitoAgencia" label="Dígito Agência" value={formData.digitoAgencia || ''}
            onChange={handleChange} fullWidth
            inputProps={{ maxLength: 2 }}
            error={!!errors.DigitoAgencia} helperText={errors.DigitoAgencia?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField name="numeroConta" label="Número da Conta" value={formData.numeroConta || ''}
            onChange={handleChange} fullWidth required
            error={!!errors.NumeroConta} helperText={errors.NumeroConta?.[0]}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField name="digitoConta" label="Dígito Conta" value={formData.digitoConta || ''}
            onChange={handleChange} fullWidth
            inputProps={{ maxLength: 2 }}
            error={!!errors.DigitoConta} helperText={errors.DigitoConta?.[0]}
          />
        </Grid>
         <Grid item xs={12} sm={2}>
            <FormControlLabel
                control={<Checkbox name="ativa" checked={formData.ativa || false} onChange={handleChange} />}
                label="Conta Ativa?"
            />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}
          startIcon={ isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon /> }
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/contas')} startIcon={<ArrowBackIcon />}>
          Voltar
        </Button>
      </Box>
    </Box>
  );
};

export default EditContaForm;