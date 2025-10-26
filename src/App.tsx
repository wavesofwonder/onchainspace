import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransactionProvider, SignInWithEthereum } from 'ethereum-identity-kit'
import { createAppKit, useDisconnect } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, base } from '@reown/appkit/networks'
import { projectId } from './config/reown'
import './App.css'

const queryClient = new QueryClient()

// Reown AppKit Configuration
const metadata = {
  name: 'OnchainSpace',
  description: 'OnchainSpace - Your launchpad for everything onchain.'
}

const networks = [mainnet, arbitrum, base]

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

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

// Authentication Flow Component
function AuthFlow() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount and when wallet connects
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticatedAddress = localStorage.getItem('authenticatedAddress')
      
      // If we have a stored authenticated address, we're authenticated
      // regardless of current wallet connection status
      if (authenticatedAddress) {
        setIsAuthenticated(true)
        return
      }
      
      // If no stored address, we're not authenticated
      setIsAuthenticated(false)
    }

    checkAuthStatus()
  }, []) // Only run on mount, not on every address/connection change

  const handleVerifySignature = async (message: string, nonce: string, signature: string) => {
    try {
      // Debug: Log the message format
      console.log('SIWE Message:', message)
      console.log('Message lines:', message.split('\n'))
      
      // Client-side signature verification using Viem
      const { verifyMessage } = await import('viem')
      
      // Parse the SIWE message to extract the address
      const lines = message.split('\n')
      
      // The address is on line 2 (index 1) in the SIWE message format
      const messageAddress = lines[1]?.trim()
      
      if (!messageAddress || !messageAddress.startsWith('0x')) {
        console.error('No valid address found in SIWE message')
        console.error('Available lines:', lines)
        return false
      }
      
      console.log('Extracted address:', messageAddress)
      
      // Verify the signature
      const isValid = await verifyMessage({
        address: messageAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      })
      
      if (isValid) {
        // Store authentication state
        localStorage.setItem('authenticatedAddress', messageAddress)
        localStorage.setItem('authenticatedMessage', message)
        console.log('Signature verified successfully!')
        setIsAuthenticated(true)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }

  const handleGetNonce = async () => {
    // Generate a secure random nonce
    return crypto.randomUUID()
  }

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...')
      
      // Clear authentication state
      localStorage.removeItem('authenticatedAddress')
      localStorage.removeItem('authenticatedMessage')
      setIsAuthenticated(false)
      
      // Disconnect the wallet
      console.log('Disconnecting wallet...')
      await disconnect()
      console.log('Wallet disconnected successfully')
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  // Step 3: Authenticated Dashboard
  if (isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Welcome to OnchainSpace!</h2>
        <p>You're successfully authenticated as: {address}</p>
        <button 
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Sign Out
        </button>
      </div>
    )
  }

  // Step 2: Show SIWE after wallet connection
  if (isConnected) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <appkit-button />
        <p>Wallet connected! Sign in to activate your onchain space.</p>
        <SignInWithEthereum
          message="Sign in to access your account"
          verifySignature={handleVerifySignature}
          getNonce={handleGetNonce}
          onSignInSuccess={() => {
            console.log('Sign in successful!')
            setIsAuthenticated(true)
          }}
          onSignInError={(error) => {
            console.error('Sign in failed:', error)
          }}
        />
      </div>
    )
  }

  // Step 1: Show wallet connection
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <p>Connect your wallet to get started:</p>
      <appkit-button />
    </div>
  )
}

function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TransactionProvider>
          <div>
            <DigitalClock />
            <AuthFlow />
          </div>
        </TransactionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App