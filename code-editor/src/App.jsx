import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import './App.css'
import yaml from 'js-yaml'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const editorRef = useRef(null)
  const [showLogsPanel, setShowLogsPanel] = useState(false)  
  const [logs, setLogs] = useState([])  

  const exampleYCard = `# Example yCard
people:
  - uid: user-001
    name: Alice
    surname: Smith
    username: Asmith
    title: Engineer
    org: ExampleCorp
    email: alice.smith@example.com
    phone:
      - number: "+1-555-1234"
        type: work
    address:
      street: "123 Main St"
      city: "Metropolis"
      state: "CA"
      postal_code: "90210"
      country: "USA"
  - uid: user-002
    name: Bob
    surname: Johnson
    username: Bjohnson
    title: Manager
    org: ExampleCorp
    email: bob.johnson@example.com
    phone:
      - number: "+1-555-1234"
        type: work
    address:
      street: "123 Main St"
      city: "Metropolis"
      state: "CA"
      postal_code: "90210"
      country: "USA"`

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString()
    const newLog = {
      type: type,        // 'success', 'error', 'warning', 'info'
      message: message,
      timestamp: timestamp
    }
    
    setLogs(prevLogs => {
      const updated = [...prevLogs, newLog]
      // Keep only last 50 logs
      if (updated.length > 50) {
        updated.shift()  // Remove oldest
      }
      return updated
    })
  }

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null)
      addLog('info', 'Undo performed')
    }
  }

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null)
      addLog('info', 'Redo performed')
    }
  }

  const handleValidate = () => {
    if (!editorRef.current) {
      alert('Editor not ready')
      return
    }
    addLog('info', 'Validation started...') 

    const content = editorRef.current.getValue()
    
    try {
      const parsed = yaml.load(content)
      
      if (!parsed || !parsed.people) {
        addLog('error', 'Validation failed: Missing "people" array') 
        alert(' Invalid YAML\n\nMissing "people" array')
        return
      }
      
      if (!Array.isArray(parsed.people)) {
        addLog('error', 'Validation failed: "people" must be an array')
        alert(' Invalid YAML\n\n"people" must be an array')
        return
      }

      // Validate each person
      for (let i = 0; i < parsed.people.length; i++) {
        const person = parsed.people[i]
        
        if (!person.name || person.name.trim() === '') {
          addLog('error', `Validation failed: Person ${i + 1} missing "name"`)
          alert(` Validation Failed\n\nPerson ${i + 1}: "name" is required`)
          return
        }
        
        if (!person.surname || person.surname.trim() === '') {
          addLog('error', `Validation failed: Person ${i + 1} missing "surname"`)
          alert(` Validation Failed\n\nPerson ${i + 1}: "surname" is required`)
          return
        }
        
        if (!person.uid || person.uid.trim() === '') {
          addLog('error', `Validation failed: Person ${i + 1} missing "uid"`)
          alert(` Validation Failed\n\nPerson ${i + 1}: "uid" is required`)
          return
        }
        
        if (!person.email || person.email.trim() === '') {
          addLog('error', `Validation failed: Person ${i + 1} missing "email"`)
          alert(` Validation Failed\n\nPerson ${i + 1}: "email" is required`)
          return
        }

        // Check phone structure
        if (person.phone && !Array.isArray(person.phone)) {
          addLog('error', `Validation failed: Person ${i + 1} "phone" must be an array`)
          alert(` Validation Failed\n\nPerson ${i + 1}: "phone" must be an array`)
          return
        }

        // Check address structure (should be object, not array)
        if (person.address && Array.isArray(person.address)) {
          addLog('error', `Validation failed: Person ${i + 1} "address" should be an object`)
          alert(` Validation Failed\n\nPerson ${i + 1}: "address" should be an object, not an array`)
          return
        }
      }

      const count = parsed.people.length
      addLog('success', `Validation passed! Found ${count} people`)  
      alert(` Valid YAML\n\n${count} people found`)
      
    } catch (error) {
      addLog('error', `YAML parse error: ${error.message}`)
      alert(` Invalid YAML\n\n${error.message}`)
    }
  }

  const handleSave = () => {
    if (!editorRef.current) {
      alert('Editor not ready')
      return
    }

    addLog('info', 'Save initiated...')
    const content = editorRef.current.getValue()
    
    try {
      const parsed = yaml.load(content)
      
      if (!parsed || !parsed.people) {
        addLog('error', 'Save failed: Missing "people" array')
        alert(' Cannot Save\n\nMissing "people" array in YAML')
        return
      }
      
      if (!Array.isArray(parsed.people)) {
        addLog('error', 'Save failed: "people" must be an array')
        alert(' Cannot Save\n\n"people" must be an array')
        return
      }
      
      // Validate mandatory fields before saving
      for (let i = 0; i < parsed.people.length; i++) {
        const person = parsed.people[i]
        
        if (!person.name || person.name.trim() === '') {
          addLog('error', `Save failed: Person ${i + 1} missing "name"`)
          alert(` Cannot Save\n\nPerson ${i + 1}: "name" is required`)
          return
        }
        
        if (!person.surname || person.surname.trim() === '') {
          addLog('error', `Save failed: Person ${i + 1} missing "surname"`)
          alert(` Cannot Save\n\nPerson ${i + 1}: "surname" is required`)
          return
        }
        
        if (!person.uid || person.uid.trim() === '') {
          addLog('error', `Save failed: Person ${i + 1} missing "uid"`)
          alert(` Cannot Save\n\nPerson ${i + 1}: "uid" is required`)
          return
        }
        
        if (!person.email || person.email.trim() === '') {
          addLog('error', `Save failed: Person ${i + 1} missing "email"`)
          alert(` Cannot Save\n\nPerson ${i + 1}: "email" is required`)
          return
        }
      }
      
      const jsonData = JSON.stringify(parsed, null, 2)
      localStorage.setItem('ycard-data', jsonData)
      addLog('success', `Saved ${parsed.people.length} people to localStorage`)
      alert(` Saved Successfully!\n\n${parsed.people.length} people saved to localStorage`)
      
    } catch (error) {
      addLog('error', `Save failed: ${error.message}`)
      alert(` Cannot Save - Invalid YAML\n\n${error.message}`)
    }
  }

  return (
    <div className="app-container">
      <h1>Monaco Editor Demo</h1>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="open-button"
      >
        Open Editor
      </button>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h2>yCard YAML Editor</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="close-button"
              >
                ✕
              </button>
            </div>
          
            {/* Toolbar */}
            <div className="toolbar">
              <button 
                className="toolbar-btn toolbar-btn-theme"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
              >
                {isDarkTheme ? "☀️ Light" : "🌙 Dark"} 
              </button>
              
              <div className="toolbar-divider"></div>
              
              <button className="toolbar-btn toolbar-btn-undo" onClick={handleUndo}>
                ↶ Undo
              </button>
              <button className="toolbar-btn toolbar-btn-redo" onClick={handleRedo}>
                ↷ Redo
              </button>
              
              <div className="toolbar-divider"></div>
              
              <button className="toolbar-btn toolbar-btn-validate" onClick={handleValidate}>
                 Validate
              </button>
              <button className="toolbar-btn toolbar-btn-save" onClick={handleSave}>
                 Save
              </button>
              <button className="toolbar-btn toolbar-btn-diff">
                ⇄ Diff
              </button>
              <button 
                className="toolbar-btn toolbar-btn-logs" 
                onClick={() => {
                  setShowLogsPanel(!showLogsPanel)
                  addLog('info', showLogsPanel ? 'Logs panel closed' : 'Logs panel opened')
                }}
              >
                 Logs
              </button>
              
              <div className="toolbar-divider"></div>
              
              <button className="toolbar-btn toolbar-btn-reset">
                 Reset
              </button>
              <button className="toolbar-btn toolbar-btn-refresh">
                 Refresh
              </button>
            </div>

            {/* Main Content Area with Editor and Logs */}
            <div className="modal-body">
              {/* Monaco Editor Container */}              
              <div className="editor-container">
                <Editor
                  height="500px"
                  defaultLanguage="yaml"
                  defaultValue={exampleYCard}
                  theme={isDarkTheme ? "vs-dark" : "light"}
                  onMount={(editor) => {
                    editorRef.current = editor
                    addLog('success', 'Editor initialized successfully')
                  }}
                />
              </div>

              {/* Logs Panel */}
              {showLogsPanel && (
                <div className="logs-panel">
                  <div className="logs-header">
                    <h3>Activity Logs</h3>
                    <button 
                      onClick={() => {
                        setShowLogsPanel(false)
                        addLog('info', 'Logs panel closed')
                      }}
                      className="close-panel-btn"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="logs-content">
                    {logs.length === 0 ? (
                      <div className="no-logs">No activity yet</div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="log-entry">
                          <span className={`log-icon log-${log.type}`}>
                            {log.type === 'success' && '✓'}
                            {log.type === 'error' && '✗'}
                            {log.type === 'warning' && '⚠'}
                            {log.type === 'info' && 'ℹ'}
                          </span>
                          <span className="log-time">{log.timestamp}</span>
                          <span className="log-message">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* End modal-body */}

          </div>
        </div>
      )}
    </div>
  )
}

export default App