import React, { useState, useEffect } from 'react'
import { Grid, Paper, Typography, Box, Skeleton, useTheme, useMediaQuery, alpha } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const KpiCard = ({ title, value, color, icon: Icon, isMobile }) => {
  const theme = useTheme()
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 2.5 }, 
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 3, 
        bgcolor: alpha(color, 0.1),
        color: color,
        display: 'flex'
      }}>
        <Icon />
      </Box>
      <Box>
        <Typography 
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {title}
        </Typography>
        <Typography 
          variant={isMobile ? 'h6' : 'h5'}
          fontWeight={800} 
          sx={{ color: 'text.primary', mt: -0.5 }}
        >
          {formatCurrency(value)}
        </Typography>
      </Box>
    </Paper>
  )
}

export default function IndicadoresKPIs({ filtros }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = {
          dataInicio: filtros.dataInicio.toISOString().slice(0, 10),
          dataFim: filtros.dataFim.toISOString().slice(0, 10),
          status: filtros.status,
        }
        const response = await axios.get('/api/dashboard/kpis', { params })
        setData(response.data)
      } catch (error) {
        console.error('Erro ao buscar KPIs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filtros])

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12} sm={4}>
        <KpiCard
          title="Receitas"
          value={data?.totalReceitas || 0}
          color={theme.palette.success.main}
          icon={TrendingUpIcon}
          isMobile={isMobile}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <KpiCard
          title="Despesas"
          value={data?.totalDespesas || 0}
          color={theme.palette.error.main}
          icon={TrendingDownIcon}
          isMobile={isMobile}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <KpiCard
          title="Saldo"
          value={data?.saldo || 0}
          color={theme.palette.primary.main}
          icon={AccountBalanceIcon}
          isMobile={isMobile}
        />
      </Grid>
    </Grid>
  )
}

