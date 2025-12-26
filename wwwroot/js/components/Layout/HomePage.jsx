import React from 'react'
import { Box, Typography, alpha, useTheme } from '@mui/material'
import Dashboard from '../Graficos/Dashboard'

const HomePage = () => {
  const theme = useTheme();
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Painel Financeiro
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bem-vindo ao seu centro de controle, Leandro 😎
        </Typography>
      </Box>
      <Dashboard />
    </Box>
  )
}

export default HomePage

