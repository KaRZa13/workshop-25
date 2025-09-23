import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

export const useEthereum = () => {
  const toast = useToast()
  
  const isMetaMaskInstalled = () => {
    return process.client && typeof window !== 'undefined' && window.ethereum
  }
  
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.add({ 
        title: 'Error', 
        description: 'Please install MetaMask!',
        color: 'error'
      })
      throw new Error('MetaMask not installed')
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      toast.add({ 
        title: 'Success', 
        description: `Connected to wallet: ${address.slice(0, 6)}...${address.slice(-4)}`,
        color: 'success'
      })

      return { provider, signer, address }
    } catch (error: any) {
      console.error('Error connecting to wallet:', error)
      
      let errorMessage = 'Failed to connect wallet'
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user'
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending'
      }
      
      toast.add({ 
        title: 'Error', 
        description: errorMessage,
        color: 'error'
      })
      
      throw error
    }
  }
  
  const getProvider = () => {
    if (!isMetaMaskInstalled()) {
      return ethers.getDefaultProvider()
    }
    return new ethers.BrowserProvider(window.ethereum)
  }
  
  const getSigner = async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed')
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    return await provider.getSigner()
  }
  
  return {
    isMetaMaskInstalled,
    connectWallet,
    getProvider,
    getSigner
  }
}