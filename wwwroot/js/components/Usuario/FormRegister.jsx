import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Link,
  Stack,
  Divider,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';

const FormRegister = () => {
  const [formData, setFormData] = useState({
    Nome: '',
    Email: '',
    Senha: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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

  const validateInputs = () => {
    const newErrors = {};
    if (!formData.Nome || formData.Nome.length < 3) {
      newErrors.Nome = 'Nome é obrigatório e deve ter no mínimo 3 caracteres.';
    }
    if (!formData.Email || !/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = 'Por favor, digite um email válido.';
    }
    if (!formData.Senha || formData.Senha.length < 6) {
      newErrors.Senha = 'Senha deve conter pelo menos 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
    setIsLoading(true);

    try {
      const response = await axios.post('/Usuario/Create', formData);
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        setFormData({
          Nome: '',
          Email: '',
          Senha: '',
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar usuário.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Card
          elevation={8}
          sx={{
            borderRadius: 2,
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)'
          }}
        >
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{ m: 1, bgcolor: 'transparent', width: 60, height: 60 }}>
                <img src="/js/components/sitemark.svg" alt="Logo" style={{ width: 40, height: 40 }} />
              </Avatar>
              <Typography component="h1" variant="h5" fontWeight="bold">
                Crie sua conta
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                <Stack spacing={2}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Nome"
                    label="Nome Completo"
                    name="Nome"
                    autoComplete="name"
                    autoFocus
                    value={formData.Nome}
                    onChange={handleChange}
                    disabled={isLoading}
                    variant="outlined"
                    error={!!errors.Nome}
                    helperText={errors.Nome}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Email"
                    label="Endereço de E-mail"
                    name="Email"
                    autoComplete="email"
                    value={formData.Email}
                    onChange={handleChange}
                    disabled={isLoading}
                    variant="outlined"
                    error={!!errors.Email}
                    helperText={errors.Email}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="Senha"
                    label="Senha"
                    type="password"
                    id="Senha"
                    autoComplete="new-password"
                    value={formData.Senha}
                    onChange={handleChange}
                    disabled={isLoading}
                    variant="outlined"
                    error={!!errors.Senha}
                    helperText={errors.Senha}
                  />
                  <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={isLoading}
                    loadingPosition="start"
                    startIcon={<LoginIcon />}
                    sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
                  >
                    {isLoading ? 'Cadastrando...' : 'Confirmar Cadastro'}
                  </LoadingButton>
                </Stack>
              </Box>

              <Divider sx={{ width: '100%', my: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>OU</Typography>
              </Divider>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Já tem uma conta?{' '}
                <Link href="/Login" variant="body2" color="primary">
                  Entrar
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default FormRegister;