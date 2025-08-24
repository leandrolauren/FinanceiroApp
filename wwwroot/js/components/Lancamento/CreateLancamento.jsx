import React from 'react'
import LancamentoForm from './LancamentoForm'

const CreateLancamento = () => {
  const handleSave = () => {
    window.location.href = '/Lancamentos'
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Novo Lançamento</h6>
      </div>
      <div className="card-body">
        <LancamentoForm onSave={handleSave} />
      </div>
    </div>
  )
}

export default CreateLancamento;