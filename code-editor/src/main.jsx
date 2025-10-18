import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import YCardEditor from './YCardEditor.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <YCardEditor /> 
    
  </StrictMode>,
)
