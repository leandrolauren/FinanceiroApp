import React from 'react'
import { Box, Typography } from '@mui/material'
import Dashboard from '../Graficos/Dashboard'

const HomePage = () => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body1">
        Sistema Financeiro projetado por Leandro 😎
      </Typography>
      <Dashboard />
    </Box>
  )
}

export default HomePage
