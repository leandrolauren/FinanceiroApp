import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react'
import { Alert } from '@mui/material'
import axios from 'axios'

const buildTree = (list) => {
  const map = {}
  const roots = []
  list.forEach((item) => {
    map[item.id] = { ...item, filhos: [] }
  })
  list.forEach((item) => {
    if (item.planoContasPaiId && map[item.planoContasPaiId]) {
      map[item.planoContasPaiId].filhos.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })
  return roots
}
const renderTreeItems = (nodes, level = 0) => {
  return nodes.flatMap((node) => [
    <SelectItem
      key={node.id}
      value={String(node.id)}
      textValue={node.descricao}
    >
      <span style={{ paddingLeft: `${1 + level * 2}rem` }}>
        {node.descricao}
      </span>
    </SelectItem>,
    ...(node.filhos.length > 0 ? renderTreeItems(node.filhos, level + 1) : []),
  ])
}

function PlanoContaMigrateModal({ open, onClose, planoOrigem }) {
  const [destinationId, setDestinationId] = useState('')
  const [potentialDestinations, setPotentialDestinations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setDestinationId('')
      setError(null)
      setLoading(true)

      axios
        .get('/api/planoContas/pais')
        .then((response) => {
          const allAccounts = response.data
          const parentIds = new Set(
            allAccounts.map((p) => p.planoContasPaiId).filter(Boolean),
          )

          const filtered = allAccounts.filter(
            (p) =>
              p.id !== planoOrigem.id &&
              p.tipo === planoOrigem.tipo &&
              !parentIds.has(p.id),
          )
          setPotentialDestinations(filtered)
        })
        .catch((err) => {
          setError(err.response)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, planoOrigem])

  const handleMigrate = async () => {
    setLoading(true)
    setError(null)
    try {
      await axios.post(`/api/planoContas/${planoOrigem.id}/migrar`, {
        planoContaDestinoId: destinationId,
      })

      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Lançamentos migrados com sucesso!',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)

      onClose(true)
    } catch (err) {
      setError(
        err.response?.message || 'Ocorreu um erro ao migrar os lançamentos.',
      )
    } finally {
      setLoading(false)
    }
  }

  const destinationTree = buildTree(potentialDestinations)

  return (
    <Modal isOpen={open} onOpenChange={() => onClose(false)} size="xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Migrar Lançamentos
            </ModalHeader>
            <ModalBody>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Input
                label="Plano de Contas de Origem"
                value={planoOrigem?.descricao || ''}
                isReadOnly
                className="mb-4"
              />

              {loading ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : (
                <Select
                  label="Migrar Para o Plano de Contas"
                  selectedKeys={destinationId ? [destinationId] : []}
                  onSelectionChange={(keys) =>
                    setDestinationId(Array.from(keys)[0] || '')
                  }
                  isRequired
                  description="Apenas contas do mesmo tipo e que não sejam 'pai' são exibidas."
                >
                  {destinationTree.length > 0 ? (
                    renderTreeItems(destinationTree)
                  ) : (
                    <SelectItem key="no-dest" value="" isDisabled>
                      Nenhum destino válido encontrado.
                    </SelectItem>
                  )}
                </Select>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleMigrate}
                isLoading={loading}
                isDisabled={!destinationId || loading}
              >
                {loading ? 'Migrando...' : 'Confirmar Migração'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PlanoContaMigrateModal
