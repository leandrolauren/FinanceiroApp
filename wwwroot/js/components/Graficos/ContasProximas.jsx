import React, { useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Divider,
} from '@mui/material'
import { ArrowDownward, ArrowUpward } from '@mui/icons-material'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('pt-BR')

const ContasList = ({ title, data, icon, color }) => (
  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6">{title}</Typography>
    <List dense>
      {data.length > 0 ? (
        data.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Box component="span" color={color}>
                {icon}
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={item.descricao}
              secondary={`Vence em: ${formatDate(item.dataVencimento)}`}
            />
            <Typography variant="body2" fontWeight="bold" color={color}>
              {formatCurrency(item.valor)}
            </Typography>
          </ListItem>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Nenhuma conta em aberto no período.
        </Typography>
      )}
    </List>
  </Paper>
)

export default function ContasProximas({ filtros }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = {
          dataInicio: filtros.dataInicio.toISOString().slice(0, 10),
          dataFim: filtros.dataFim.toISOString().slice(0, 10),
        }
        const response = await axios.get('/api/dashboard/contas-proximas', {
          params,
        })
        setData(response.data)
      } catch (error) {
        console.error('Erro ao buscar contas próximas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filtros])

  if (loading) return <Skeleton variant="rectangular" height={200} />

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <ContasList
          title="Contas a Pagar"
          data={data?.contasAPagar || []}
          icon={<ArrowUpward />}
          color="error.main"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <ContasList
          title="Contas a Receber"
          data={data?.contasAReceber || []}
          icon={<ArrowDownward />}
          color="success.main"
        />
      </Grid>
    </Grid>
  )
}
