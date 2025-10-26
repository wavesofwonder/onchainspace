import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function DigitalClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'monospace',
      fontSize: '4rem',
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        {formatTime(time)}
      </div>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'normal',
        color: '#666'
      }}>
        gm vitalik.eth
      </div>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DigitalClock />
    </>
  )
}

export default App
