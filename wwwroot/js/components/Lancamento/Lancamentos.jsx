import { useState } from 'react'
import LancamentosDataGrid from './LancamentosDataGrid'
import LancamentoForm from './LancamentoForm'

const Lancamentos = () => {
  const [view, setView] = useState('list')
  const [editId, setEditId] = useState(null)

  const handleNewClick = () => setView('create')
  const handleBackClick = () => {
    setView('list')
    setEditId(null)
  }

  const handleEditClick = (id) => {
    setEditId(id)
    setView('edit')
  }

  if (view === 'create') {
    return (
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Novo Lançamento</h6>
        </div>
        <div className="card-body">
          <LancamentoForm onSave={handleBackClick} />
        </div>
      </div>
    )
  }

  if (view === 'edit') {
    return (
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            Editar Lançamento
          </h6>
        </div>
        <div className="card-body">
          <LancamentoForm lancamentoId={editId} onSave={handleBackClick} />
        </div>
      </div>
    )
  }

  return (
    <LancamentosDataGrid
      onNewClick={handleNewClick}
      onEditClick={handleEditClick}
    />
  )
}

export default Lancamentos;