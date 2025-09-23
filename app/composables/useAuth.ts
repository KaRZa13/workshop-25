interface User {
  address: string
  chainId?: number
  isConnected: boolean
}

export const useAuth = () => {
  // État global de l'utilisateur (persisté côté client)
  const user = useState<User | null>('auth.user', () => null)
  
  // État dérivé pour vérifier l'authentification
  const isAuthenticated = computed(() => {
    return user.value !== null && user.value.isConnected
  })
  
  // Connexion avec wallet Ethereum
  const login = async () => {
    const { connectWallet, isMetaMaskInstalled } = useEthereum()
    
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed')
    }
    
    try {
      const { address, provider } = await connectWallet()
      
      // Récupérer le chainId
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      
      // Mettre à jour l'état utilisateur
      user.value = {
        address,
        chainId,
        isConnected: true
      }
      
      // Optionnel : sauvegarder dans localStorage pour persistence
      if (process.client) {
        localStorage.setItem('auth.user', JSON.stringify(user.value))
      }
      
      return user.value
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }
  
  // Déconnexion
  const logout = () => {
    user.value = null
    
    // Nettoyer localStorage
    if (process.client) {
      localStorage.removeItem('auth.user')
    }
  }
  
  // Restaurer la session depuis localStorage (côté client uniquement)
  const restoreSession = () => {
    if (!process.client) return
    
    try {
      const savedUser = localStorage.getItem('auth.user')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User
        
        // Vérifier si la session est encore valide
        // Vous pouvez ajouter une logique de validation ici
        if (parsedUser.address && parsedUser.isConnected) {
          user.value = parsedUser
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
      // Nettoyer les données corrompues
      localStorage.removeItem('auth.user')
    }
  }
  
  // Vérifier si le wallet est toujours connecté
  const checkWalletConnection = async () => {
    if (!process.client || !user.value) return false
    
    const { isMetaMaskInstalled } = useEthereum()
    
    if (!isMetaMaskInstalled()) {
      logout()
      return false
    }
    
    try {
      // Vérifier si MetaMask est toujours connecté à notre app
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      
      if (accounts.length === 0 || accounts[0].toLowerCase() !== user.value.address.toLowerCase()) {
        logout()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Failed to check wallet connection:', error)
      logout()
      return false
    }
  }
  
  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    restoreSession,
    checkWalletConnection
  }
}