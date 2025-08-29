import React, { useState, useEffect } from 'react'
import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const KpiCard = ({ title, value, color }) => (
  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="subtitle1" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h5" fontWeight="bold" color={color}>
      {formatCurrency(value)}
    </Typography>
  </Paper>
)

export default function IndicadoresKPIs({ filtros }) {
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
            <Skeleton variant="rectangular" height={88} />
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <KpiCard
          title="Total Receitas"
          value={data?.totalReceitas || 0}
          color="success.main"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <KpiCard
          title="Total Despesas"
          value={data?.totalDespesas || 0}
          color="error.main"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <KpiCard
          title="Saldo do Período"
          value={data?.saldo || 0}
          color={data?.saldo >= 0 ? 'text.primary' : 'error.main'}
        />
      </Grid>
    </Grid>
  )
}
