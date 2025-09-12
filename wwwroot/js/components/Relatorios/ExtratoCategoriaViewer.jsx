import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
} from '@mui/material'
import { Button } from '@heroui/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const LancamentosTable = ({ lancamentos }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Data Venc.</TableCell>
          <TableCell>Descrição</TableCell>
          <TableCell>Pessoa</TableCell>
          <TableCell align="right">Valor</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lancamentos.map((l) => (
          <TableRow key={l.Id}>
            <TableCell>
              {new Date(l.DataVencimento).toLocaleDateString()}
            </TableCell>
            <TableCell>{l.Descricao}</TableCell>
            <TableCell>{l.Pessoa?.Nome}</TableCell>
            <TableCell
              align="right"
              sx={{
                color: l.Tipo === 'Receita' ? 'success.main' : 'error.main',
              }}
            >
              {formatCurrency(l.Valor)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const ExtratoCategoriaViewer = ({ reportData, onBack }) => {
  const {
    NomeCategoria,
    DataInicio,
    DataFim,
    StatusFiltro,
    TotalCategoria,
    Lancamentos,
  } = reportData

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="light"
        onPress={onBack}
        startContent={<ArrowBackIcon />}
        className="mb-4"
      >
        Voltar para Relatórios
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Extrato da Categoria: {NomeCategoria}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Período: {new Date(DataInicio).toLocaleDateString()} a{' '}
          {new Date(DataFim).toLocaleDateString()} | Status: {StatusFiltro}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Total Movimentado na Categoria:</Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            color={TotalCategoria >= 0 ? 'success.main' : 'error.main'}
          >
            {formatCurrency(TotalCategoria)}
          </Typography>
        </Box>
      </Paper>

      {Lancamentos && Lancamentos.length > 0 ? (
        <LancamentosTable lancamentos={Lancamentos} />
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            Nenhum lançamento encontrado para esta categoria no período
            selecionado.
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default ExtratoCategoriaViewer
