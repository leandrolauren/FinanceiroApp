import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Divider,
  useTheme,
  useMediaQuery,
  Box,
  alpha,
  Avatar
} from '@mui/material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function SaldosContasBancarias() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/dashboard/saldos-bancarios')
        setData(response.data)
      } catch (error) {
        console.error('Erro ao buscar saldos bancários:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Skeleton variant="text" width="60%" height={30} />
      <Skeleton variant="rectangular" height={150} sx={{ mt: 2, borderRadius: 2 }} />
    </Paper>
  )

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box display="flex" alignItems="center" mb={2} gap={1}>
        <AccountBalanceIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Saldos em Conta
        </Typography>
      </Box>

      <List sx={{ pt: 0 }}>
        {data.length > 0 ? (
          data.map((conta, index) => (
            <React.Fragment key={index}>
              <ListItem disableGutters sx={{ py: 1.5 }}>
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  mr: 2
                }}>
                  {conta.nomeConta.charAt(0)}
                </Avatar>
                <ListItemText 
                  primary={conta.nomeConta}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { fontWeight: 600 }
                  }}
                  secondary="Saldo Atual"
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Typography 
                  variant="body1" 
                  fontWeight={700}
                  color={conta.saldoAtual >= 0 ? 'text.primary' : 'error.main'}
                >
                  {formatCurrency(conta.saldoAtual)}
                </Typography>
              </ListItem>
              {index < data.length - 1 && <Divider component="li" sx={{ opacity: 0.6 }} />}
            </React.Fragment>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nenhuma conta encontrada.
          </Typography>
        )}
      </List>
    </Paper>
  )
}

