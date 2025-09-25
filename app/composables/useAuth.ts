import type { User, NonceResponse, AuthVerifyResponse } from '~/types/auth'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useState<User | null>('auth.user', () => null)

  const isAuthenticated = computed(() => {
    return user.value !== null && user.value.isConnected
  })

  const login = async () => {
    try {
      const { connectWallet } = useEthereum()
      const { address, provider, signer } = await connectWallet()

      // 1️⃣ Récupérer un nonce du serveur
      console.log('Fetching nonce...')
      let nonceResponse
      try {
        nonceResponse = await $fetch<NonceResponse>('/api/auth/nonce')
        console.log('Nonce response:', nonceResponse)
      } catch (error) {
        console.error('Error fetching nonce:', error)
        throw new Error(`Failed to fetch nonce: ${error}`)
      }

      if (!nonceResponse || !nonceResponse.nonce) {
        console.error('Invalid nonce response:', nonceResponse)
        throw new Error('Invalid nonce received from server')
      }

      const { nonce } = nonceResponse
      console.log('Nonce received:', nonce)

      // 2️⃣ Construire le message SIWE
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      const message = `Sign in with Ethereum\nAddress: ${address}\nChainId: ${chainId}\nNonce: ${nonce}`
      
      console.log('Message to sign:', message)

      // 3️⃣ Signer avec le wallet
      console.log('Requesting signature...')
      const signature = await signer.signMessage(message)
      console.log('Signature received')

      // 4️⃣ Vérifier côté backend
      console.log('Verifying with backend...')
      let response
      try {
        response = await $fetch<AuthVerifyResponse>('/api/auth/verify', {
          method: 'POST',
          body: { address, chainId, message, signature }
        })
        console.log('Backend response:', response)
      } catch (error) {
        console.error('Error verifying with backend:', error)
        throw new Error(`Backend verification failed: ${error}`)
      }

      const { session, user: dbUser, isNewUser, needsUsername } = response

      if (!session || !session.access_token) {
        throw new Error('Invalid session data received from server')
      }

      // 5️⃣ Stocker les données utilisateur
      user.value = {
        id: dbUser.id,
        address: dbUser.address,
        username: dbUser.username, // Peut être undefined
        isConnected: true
      }

      // 6️⃣ Sauvegarder dans le localStorage
      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }

      console.log('Login successful!')
      
      // 7️⃣ Retourner les informations pour le composant parent
      return {
        user: user.value,
        isNewUser,
        needsUsername
      }
      
    } catch (error) {
      console.error('Login error details:', error)
      user.value = null
      
      // Nettoyer le localStorage en cas d'erreur
      if (process.client) {
        localStorage.removeItem('auth_user')
      }
      
      throw error
    }
  }

  const logout = async () => {
    try {
      user.value = null
      
      if (process.client) {
        localStorage.removeItem('auth_user')
      }
      
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateUsername = async (username: string) => {
    if (!user.value?.id) {
      throw new Error('No user logged in')
    }

    try {
      const response = await $fetch<{
        success: boolean
        user: User
      }>('/api/auth/update-username', {
        method: 'POST',
        body: {
          userId: user.value.id,
          username
        }
      })

      if (response.success) {
        // Mettre à jour l'état local
        user.value = {
          ...user.value,
          username: response.user.username
        }

        // Mettre à jour le localStorage
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(user.value))
        }

        return response.user
      } else {
        throw new Error('Failed to update username')
      }
    } catch (error) {
      console.error('Error updating username:', error)
      throw error
    }
  }

  const restoreSession = async () => {
    if (!process.client) return

    try {
      const savedUser = localStorage.getItem('auth_user')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User
        
        // Vérifier que l'utilisateur a toujours son wallet connecté
        const { isMetaMaskInstalled } = useEthereum()
        if (isMetaMaskInstalled()) {
          user.value = parsedUser
        } else {
          // Si MetaMask n'est plus disponible, nettoyer la session
          localStorage.removeItem('auth_user')
        }
      }
    } catch (error) {
      console.error('Session restore error:', error)
      localStorage.removeItem('auth_user')
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    updateUsername,
    restoreSession
  }
}