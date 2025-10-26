import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransactionProvider, SignInWithEthereum } from 'ethereum-identity-kit'
import { createAppKit } from '@reown/appkit/react'
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

function App() {
  const handleVerifySignature = async (message: string, nonce: string, signature: string) => {
    try {
      // Client-side signature verification using Viem
      const { verifyMessage } = await import('viem')
      
      // Parse the SIWE message to extract the address
      const lines = message.split('\n')
      const addressLine = lines.find(line => line.startsWith('Address:'))
      if (!addressLine) {
        console.error('No address found in SIWE message')
        return false
      }
      
      const address = addressLine.split(':')[1].trim()
      
      // Verify the signature
      const isValid = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      })
      
      if (isValid) {
        // Store authentication state
        localStorage.setItem('authenticatedAddress', address)
        localStorage.setItem('authenticatedMessage', message)
        console.log('Signature verified successfully!')
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

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TransactionProvider>
          <div>
            <DigitalClock />
            
            {/* Reown AppKit Connect Button */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <appkit-button />
            </div>
            
            {/* Sign in with Ethereum */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <SignInWithEthereum
                message="Sign in to access your account"
                verifySignature={handleVerifySignature}
                getNonce={handleGetNonce}
                onSignInSuccess={() => {
                  console.log('Sign in successful!')
                  // Additional signed in logic
                }}
                onSignInError={(error) => {
                  console.error('Sign in failed:', error)
                  // Additional error handling
                }}
              />
            </div>
          </div>
        </TransactionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App