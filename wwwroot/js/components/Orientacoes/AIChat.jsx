import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  CircularProgress,
  Typography,
  Avatar,
  IconButton,
  Alert,
  Fab,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CloseIcon from '@mui/icons-material/Close'
import ChatIcon from '@mui/icons-material/Chat'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'

const ChatMessage = ({ message, avatarSrc }) => {
  const isModel = message.role === 'model'
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isModel ? 'flex-start' : 'flex-end',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          maxWidth: '80%',
        }}
      >
        {isModel && <Avatar src={avatarSrc} sx={{ bgcolor: 'transparent' }} />}
        <Paper
          elevation={2}
          sx={{
            p: 1.5,
            bgcolor: isModel ? 'action.hover' : 'primary.main',
            color: isModel ? 'text.primary' : 'primary.contrastText',
            borderRadius: isModel ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
          }}
        >
          <Typography
            component="div"
            sx={{ '& p': { m: 0 }, '& pre': { whiteSpace: 'pre-wrap' } }}
          >
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </Typography>
        </Paper>
        {!isModel && (
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
        )}
      </Box>
    </Box>
  )
}

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Olá! Eu sou o Galo Jhon, seu assistente de IA. Como posso te ajudar?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const avatarSrc =
    theme.palette.mode === 'dark'
      ? '/img/galo-avatar.jpg'
      : '/img/galo-avatar.jpg'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return

    const userMessage = { role: 'user', text: input }
    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setInput('')
    setIsLoading(true)
    setError('')

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }))

      const response = await axios.post('/api/ai/chat', {
        message: input,
        history: history,
      })

      const modelMessage = { role: 'model', text: response.data.response }
      setMessages([...currentMessages, modelMessage])
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Não foi possível obter uma resposta. Tente novamente.'
      setError(errorMessage)
      const modelMessage = {
        role: 'model',
        text: `Desculpe, ocorreu um erro. ${errorMessage}`,
      }
      setMessages([...currentMessages, modelMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            width: isMobile ? 'calc(100vw - 48px)' : 380,
            height: isMobile ? '70vh' : 550,
            maxHeight: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Box>
              <Typography
                variant="h6"
                component="h1"
                sx={{ fontWeight: 'bold' }}
              >
                Galo Jhon
              </Typography>
            </Box>
            <IconButton onClick={() => setIsOpen(false)} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'background.default',
            }}
          >
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} avatarSrc={avatarSrc} />
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Digite sua pergunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                multiline
                maxRows={4}
                size="small"
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                sx={{ ml: 1 }}
              >
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>
      <Fab
        color="primary"
        aria-label="Abrir assistente"
        onClick={() => setIsOpen(true)}
        sx={{
          // Animação para esconder/mostrar o botão
          transition: (theme) =>
            theme.transitions.create(['transform', 'opacity'], {
              duration: theme.transitions.duration.short,
            }),
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto',
        }}
      >
        <ChatIcon />
      </Fab>
    </Box>
  )
}

export default AIChat
