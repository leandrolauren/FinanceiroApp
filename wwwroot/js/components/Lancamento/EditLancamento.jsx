import React from 'react'
import { createRoot } from 'react-dom/client'
import LancamentoForm from './LancamentoForm'

const EditLancamento = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const lancamentoId = parseInt(urlParams.get('id'), 10)

  const handleSave = () => {
    window.location.href = '/Lancamentos'
  }

  if (!lancamentoId) {
    return <div>Lançamento não especificado.</div>
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Editar Lançamento</h6>
      </div>
      <div className="card-body">
        <LancamentoForm lancamentoId={lancamentoId} onSave={handleSave} />
      </div>
    </div>
  )
}

export default EditLancamento

if (document.getElementById('edit-lancamento-root')) {
  const container = document.getElementById('edit-lancamento-root')
  const root = createRoot(container)
  root.render(<EditLancamento />)
}
