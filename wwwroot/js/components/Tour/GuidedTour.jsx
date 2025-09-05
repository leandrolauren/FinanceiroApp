import React from 'react'
import Joyride, { STATUS } from 'react-joyride'
import { useTheme } from '@mui/material/styles'
const GuidedTour = ({ run, steps, stepIndex, callback }) => {
  const theme = useTheme()

  const handleJoyrideCallback = (data) => {
    callback(data)
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular Tour',
      }}
      styles={{
        options: {
          arrowColor: theme.palette.background.paper,
          backgroundColor: theme.palette.background.paper,
          primaryColor: theme.palette.primary.main,
          textColor: theme.palette.text.primary,
          zIndex: 1400,
        },
        buttonClose: {
          color: theme.palette.text.secondary,
        },
      }}
    />
  )
}

export default GuidedTour
