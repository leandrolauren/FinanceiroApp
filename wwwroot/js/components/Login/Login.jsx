import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
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
  Avatar
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(null);

  useEffect(() => {
    if (window.GOOGLE_CLIENT_ID) {
      setGoogleClientId(window.GOOGLE_CLIENT_ID);
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/Login', formData);
      if (response.data.success) {
        window.location.href = '/home';
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'E-mail ou senha inválidos.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/login/GoogleSignIn', {
        idToken: credentialResponse.credential,
      });

      if (response.data.success) {
        window.location.href = '/Home';
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao tentar fazer login com o Google.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    showNotification('Falha na autenticação com o Google.', 'error');
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
                Bem-vindo de volta!
              </Typography>              
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                <Stack spacing={2}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Endereço de E-mail"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    variant="outlined"
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="senha"
                    label="Senha"
                    type="password"
                    id="senha"
                    autoComplete="current-password"
                    value={formData.senha}
                    onChange={handleChange}
                    disabled={isLoading}
                    variant="outlined"
                  />
                   <Link href="#" variant="body2" sx={{ alignSelf: 'flex-end', mt: -1 }}>
                    Esqueceu a senha?
                  </Link>
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
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </LoadingButton>
                </Stack>
              </Box>
              
              <Divider sx={{ width: '100%', my: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>OU</Typography>
              </Divider>

              {googleClientId ? (
                <GoogleOAuthProvider clientId={googleClientId}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    shape="rectangular"
                    width="300px"
                  />
                </GoogleOAuthProvider>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Carregando login com Google...
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Não tem uma conta?{' '}
                <Link href="/Usuario/Create" variant="body2" color="primary">
                  Cadastre-se
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;