import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MuiCard from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import { GoogleIcon } from '../Shared/CustomIcons'
import axios from 'axios'
import AppWrapper from '../Shared/AppWrapper'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}))

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}))

export default function FormRegister(props) {
  const [emailError, setEmailError] = React.useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('')
  const [passwordError, setPasswordError] = React.useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('')
  const [nomeError, setNomeError] = React.useState(false)
  const [nomeErrorMessage, setNomeErrorMessage] = React.useState('')
  const [generalError, setGeneralError] = React.useState('')

  const validateInputs = () => {
    const Email = document.getElementById('Email')
    const Senha = document.getElementById('Senha')
    const Nome = document.getElementById('Nome')

    let isValid = true

    if (!Email.value || !/\S+@\S+\.\S+/.test(Email.value)) {
      setEmailError(true)
      setEmailErrorMessage('Por favor, digite um email válido.')
      isValid = false
    } else {
      setEmailError(false)
      setEmailErrorMessage('')
    }

    if (!Senha.value || Senha.value.length < 6) {
      setPasswordError(true)
      setPasswordErrorMessage('Senha deve conter pelo menos 6 caracteres.')
      isValid = false
    } else {
      setPasswordError(false)
      setPasswordErrorMessage('')
    }

    if (!Nome.value || Nome.value.length < 3) {
      setNomeError(true)
      setNomeErrorMessage('Nome é obrigatório.')
      isValid = false
    } else {
      setNomeError(false)
      setNomeErrorMessage('')
    }

    return isValid
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    console.log('Iniciando submissão do formulário...')

    if (!validateInputs()) {
      console.log('Validação local falhou')
      return
    }

    const Nome = document.getElementById('Nome').value
    const Email = document.getElementById('Email').value
    const Senha = document.getElementById('Senha').value

    console.log('Dados enviados:', { Nome, Email, Senha })

    try {
      const response = await axios.post('/Usuario/Create', {
        Nome,
        Email,
        Senha,
      })
      console.log('Resposta do servidor:', response.status, response.data)

      if (response.status === 200) {
        setGeneralError('')
        console.log('Cadastro bem-sucedido, redirecionando para /Home/Index')
        window.location.href = '/Home/Index'
      } else {
        console.log('Resposta inesperada:', response.status)
        setGeneralError('Resposta inesperada do servidor.')
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      if (error.response) {
        console.error(
          'Resposta do servidor:',
          error.response.status,
          error.response.data,
        )
        setGeneralError(
          error.response.data.message || 'Erro ao cadastrar usuário.',
        )
      } else if (error.request) {
        console.error('Nenhuma resposta recebida:', error.request)
        setGeneralError(
          'Não foi possível conectar ao servidor. Tente novamente.',
        )
      } else {
        console.error('Erro ao configurar a requisição:', error.message)
        setGeneralError('Ocorreu um erro inesperado. Tente novamente.')
      }
    }
  }

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <img
            src="/js/components/sitemark.svg"
            alt="Ícone do site"
            style={{ width: 35, height: 35 }}
          />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Cadastre-se
          </Typography>
          {generalError && (
            <Typography color="error" sx={{ textAlign: 'center', mt: 2 }}>
              {generalError}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <TextField
                autoComplete="name"
                name="Nome"
                required
                fullWidth
                id="Nome"
                placeholder="Nome completo"
                error={nomeError}
                helperText={nomeErrorMessage}
                color={nomeError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <TextField
                required
                fullWidth
                id="Email"
                placeholder="Email"
                name="Email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <TextField
                required
                fullWidth
                name="Senha"
                placeholder="Digite sua senha."
                type="password"
                id="Senha"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="Quero receber atualizações por Email."
            />
            <Button type="submit" fullWidth variant="contained">
              Confirmar cadastro
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>ou</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Login com Google')}
              startIcon={<GoogleIcon />}
            >
              Entrar com Google
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Já tem uma conta?{' '}
              <Link href="/Login" variant="body2" sx={{ alignSelf: 'center' }}>
                Entrar
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </>
  )
}