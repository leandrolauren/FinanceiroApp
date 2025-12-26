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
  useTheme,
  useMediaQuery,
  alpha,
  Avatar
} from '@mui/material'
import { ArrowDownward, ArrowUpward } from '@mui/icons-material'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('pt-BR')

const ContasList = ({ title, data, icon: Icon, color, isMobile, type }) => {
  const theme = useTheme()
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
      }}
    >
      <Box display="flex" alignItems="center" mb={2} gap={1.5}>
        <Avatar sx={{ 
          bgcolor: alpha(color, 0.1), 
          color: color,
          width: 32,
          height: 32
        }}>
          <Icon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>

      <List dense disablePadding>
        {data.length > 0 ? (
          data.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemText
                  primary={item.descricao}
                  secondary={`Vence em ${formatDate(item.dataVencimento)}`}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                  }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Typography variant="body2" fontWeight={700} color={color} sx={{ ml: 1 }}>
                  {formatCurrency(item.valor)}
                </Typography>
              </ListItem>
              {index < data.length - 1 && <Divider component="li" sx={{ opacity: 0.5 }} />}
            </React.Fragment>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tudo em dia! Nenhuma conta para exibir.
          </Typography>
        )}
      </List>
    </Paper>
  )
}

export default function ContasProximas({ filtros }) {
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

  if (loading) return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
      </Grid>
    </Grid>
  )

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12} md={6}>
        <ContasList
          title="Próximos Pagamentos"
          data={data?.contasAPagar || []}
          icon={ArrowUpward}
          color={theme.palette.error.main}
          isMobile={isMobile}
          type="pagar"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <ContasList
          title="Próximos Recebimentos"
          data={data?.contasAReceber || []}
          icon={ArrowDownward}
          color={theme.palette.success.main}
          isMobile={isMobile}
          type="receber"
        />
      </Grid>
    </Grid>
  )
}

