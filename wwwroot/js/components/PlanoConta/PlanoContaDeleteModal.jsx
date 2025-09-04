import React, { useEffect, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from '@heroui/react'
import { Alert } from '@mui/material'
import axios from 'axios'

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

function PlanoContaDeleteModal({ open, onClose, planoId }) {
  const [plano, setPlano] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && planoId) {
      setLoading(true)
      setError(null)
      axios
        .get(`/api/PlanoContas/${planoId}`)
        .then((response) => {
          setPlano(response.data)
        })
        .catch(() => {
          setError('Erro ao carregar os dados do Plano de Contas.')
          showNotification(
            'Erro ao carregar os dados do Plano de Contas.',
            'error',
          )
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [planoId, open])

  const handleDelete = async () => {
    try {
      setError(null)

      await axios.delete(`/api/PlanoContas/${planoId}`)
      showNotification('Plano de Contas excluído com sucesso.', 'success')

      onClose(true)
    } catch (error) {
      showNotification(
        error.response.data.message || 'Erro ao excluir Plano de Contas.',
        'error',
      )
      setError(
        error.response?.data?.message || 'Erro ao excluir Plano de Contas.',
      )
      onClose(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose(false)
    }
  }

  return (
    <Modal isOpen={open} onOpenChange={handleClose} isDismissable={!loading}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Confirmar Exclusão
            </ModalHeader>
            <ModalBody>
              {loading && !error ? (
                <div className="flex justify-center items-center h-24">
                  <Spinner />
                </div>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <p>
                  Tem certeza que deseja excluir o plano de contas:{' '}
                  <strong>{plano?.descricao || ''}</strong>?
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button color="danger" onPress={handleDelete} isLoading={loading}>
                Excluir
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PlanoContaDeleteModal
