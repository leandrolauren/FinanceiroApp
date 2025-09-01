import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { NumericFormat } from 'react-number-format';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const API_PESSOAS = '/api/pessoas';
const API_PLANOS_CONTAS = '/api/planoContas/hierarquia';
const API_CONTAS_BANCARIAS = '/api/contas';

const getLeafNodes = (nodes) => {
  let leafNodes = [];
  if (!Array.isArray(nodes)) return leafNodes;
  nodes.forEach((node) => {
    if (!node.filhos || node.filhos.length === 0) {
      leafNodes.push(node);
    } else {
      leafNodes = leafNodes.concat(getLeafNodes(node.filhos));
    }
  });
  return leafNodes;
};

const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  });
  window.dispatchEvent(event);
};

const initialFormState = {
  descricao: '',
  tipo: '2',
  valor: '',
  dataCompetencia: new Date(),
  dataVencimento: new Date(),
  dataPagamento: null,
  pago: false,
  contaBancariaId: '',
  planoContasId: '',
  pessoaId: '',
};

const LancamentoCreateForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [pessoas, setPessoas] = useState([]);
  const [planosContas, setPlanosContas] = useState([]);
  const [contasBancarias, setContasBancarias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDependencies = async () => {
      setPageLoading(true);
      try {
        const [pessoasRes, planosRes, contasRes] = await axios.all([
          axios.get(API_PESSOAS),
          axios.get(API_PLANOS_CONTAS),
          axios.get(API_CONTAS_BANCARIAS),
        ]);
        setPessoas(pessoasRes.data || []);
        setPlanosContas(planosRes.data || []);
        setContasBancarias(contasRes.data.data || []);
      } catch (error) {
        console.error('Erro ao buscar dependências:', error);
        showNotification('Erro ao carregar dados de apoio.', 'error');
      } finally {
        setPageLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
     if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const dados = {
      ...formData,
      tipo: formData.tipo === '1' ? 'R' : 'D',
      planoContasId: formData.planoContasId || null,
      contaBancariaId: formData.contaBancariaId || null,
      pessoaId: formData.pessoaId || null,
      dataPagamento: formatDate(formData.dataPagamento),
      dataCompetencia: formatDate(formData.dataCompetencia),
      dataVencimento: formatDate(formData.dataVencimento),
    };

    try {
      await axios.post('/api/lancamentos', dados);
      showNotification('Lançamento cadastrado com sucesso!', 'success');
      setFormData(initialFormState);
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data.errors || {});
        showNotification(error.response.data.message || 'Por favor, corrija os erros no formulário.', 'warning');
      } else {
        showNotification(error.response?.data?.message || 'Erro ao salvar o lançamento.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const planosDeContaFilhos = getLeafNodes(
    planosContas.filter((p) => p.tipo.toString() === formData.tipo),
  );

  if (pageLoading) {
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
        Novo Lançamento
      </Typography>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Tipo de Lançamento</FormLabel>
        <RadioGroup row name="tipo" value={formData.tipo} onChange={handleChange}>
          <FormControlLabel value="1" control={<Radio />} label="Receita" />
          <FormControlLabel value="2" control={<Radio />} label="Despesa" />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={8}>
          <TextField name="descricao" label="Descrição" value={formData.descricao} onChange={handleChange} fullWidth required autoFocus error={!!errors.Descricao} helperText={errors.Descricao?.[0]} />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <NumericFormat
            name="valor"
            label="Valor (R$)"
            value={formData.valor}
            customInput={TextField}
            onValueChange={(values) => {
              setFormData(prev => ({ ...prev, valor: values.floatValue || '' }));
              if (errors.Valor) {
                setErrors(prev => ({...prev, Valor: undefined}));
              }
            }}
            prefix={'R$ '}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            fullWidth
            required
            error={!!errors.Valor}
            helperText={errors.Valor?.[0]}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <Autocomplete options={pessoas} getOptionLabel={(option) => option.nome || ''} value={pessoas.find((p) => p.id === formData.pessoaId) || null}
            onChange={(event, newValue) => { setFormData(prev => ({ ...prev, pessoaId: newValue ? newValue.id : '' })); }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (<TextField {...params} label="Pessoa (Cliente/Fornecedor)" error={!!errors.PessoaId} helperText={errors.PessoaId?.[0]} />)}
            sx={{ minWidth: 300 }} />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Autocomplete options={planosDeContaFilhos} getOptionLabel={(option) => option.descricao || ''} value={planosDeContaFilhos.find((p) => p.id === formData.planoContasId) || null}
            onChange={(event, newValue) => { setFormData(prev => ({ ...prev, planoContasId: newValue ? newValue.id : '' })); }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (<TextField {...params} label="Plano de Contas" required error={!!errors.PlanoContasId} helperText={errors.PlanoContasId?.[0]} />)}
            sx={{ minWidth: 300 }} />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Autocomplete options={contasBancarias} getOptionLabel={(option) => option.descricao || ''} value={contasBancarias.find((c) => c.id === formData.contaBancariaId) || null}
            onChange={(event, newValue) => { setFormData(prev => ({ ...prev, contaBancariaId: newValue ? newValue.id : '' })); }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (<TextField {...params} label="Conta Bancária" error={!!errors.ContaBancariaId} helperText={errors.ContaBancariaId?.[0]} />)}
            sx={{ minWidth: 300 }} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
            <DatePicker
                label="Data de Competência"
                value={formData.dataCompetencia}
                onChange={(date) => handleDateChange('dataCompetencia', date)}
                renderInput={(params) => 
                  <TextField {...params} fullWidth required error={!!errors.DataCompetencia} helperText={errors.DataCompetencia?.[0] || ''} />
                }
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <DatePicker
                label="Data de Vencimento"
                value={formData.dataVencimento}
                onChange={(date) => handleDateChange('dataVencimento', date)}
                renderInput={(params) => 
                  <TextField {...params} fullWidth required error={!!errors.DataVencimento} helperText={errors.DataVencimento?.[0] || ''} />
                }
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField select label="Situação" name="pago" value={formData.pago} onChange={handleChange} fullWidth >
            <MenuItem value={false}>Em Aberto</MenuItem>
            <MenuItem value={true}>Pago</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <DatePicker
                label="Data de Pagamento"
                value={formData.dataPagamento}
                onChange={(date) => handleDateChange('dataPagamento', date)}
                disabled={!formData.pago}
                renderInput={(params) => 
                  <TextField {...params} fullWidth error={!!errors.DataPagamento} helperText={errors.DataPagamento?.[0] || ''} />
                }
            />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={loading ? (<CircularProgress size={20} color="inherit" />) : (<SaveIcon />)} >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/lancamentos')} startIcon={<ArrowBackIcon />}>
          Voltar
        </Button>
      </Box>
    </Box>
  );
};

export default LancamentoCreateForm;

