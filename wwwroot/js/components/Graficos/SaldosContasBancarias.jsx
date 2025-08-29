import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Divider,
} from '@mui/material'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function SaldosContasBancarias() {
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

  if (loading) return <Skeleton variant="rectangular" height={200} />

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6">Saldos em Contas</Typography>
      <List>
        {data.length > 0 ? (
          data.map((conta, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemText primary={conta.nomeConta} />
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(conta.saldoAtual)}
                </Typography>
              </ListItem>
              {index < data.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nenhuma conta bancária encontrada.
          </Typography>
        )}
      </List>
    </Paper>
  )
}
