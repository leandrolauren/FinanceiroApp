import React from 'react'
import { createRoot } from 'react-dom/client'
import FormRegister from './FormRegister'

const container = document.getElementById('formRegister-root')
if (container) {
  const root = createRoot(container)
  root.render(<FormRegister />)
}
