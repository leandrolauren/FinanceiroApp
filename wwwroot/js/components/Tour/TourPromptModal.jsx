import React from 'react'
import { Modal, Box, Typography, Button, Divider, Stack } from '@mui/material'

const TourPromptModal = ({ open, onConfirm, onDecline }) => {
  return (
    <Modal open={open}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Bem-vindo(a) ao FinanceiroApp!
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ mt: 2 }}>
          Percebemos que é seu primeiro acesso. Gostaria de fazer um tour guiado
          para conhecer as principais funcionalidades?
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button onClick={onDecline} variant="outlined" fullWidth>
            Agora não
          </Button>
          <Button onClick={onConfirm} variant="contained" fullWidth>
            Sim, vamos lá!
          </Button>
        </Stack>
      </Box>
    </Modal>
  )
}

export default TourPromptModal
