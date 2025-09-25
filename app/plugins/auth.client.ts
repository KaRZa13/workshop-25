export default defineNuxtPlugin(async () => {
  if (process.server) return

  const { restoreSession, logout } = useAuth()
  const supabase = useSupabaseClient()

  // 🔄 Restaurer état local (adresse, chainId, etc.)
  restoreSession()

  // 🔑 Vérifier si une session Supabase existe encore
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Si plus de session Supabase → forcer logout seulement si on était connecté
    const { user } = useAuth()
    if (user.value) {
      logout()
    }
    
    // Redirection supprimée - l'utilisateur peut rester sur la page courante
  }

  // 🎧 Gestion des events MetaMask
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        logout()
        // Redirection supprimée - l'utilisateur reste sur la page courante
      } else {
        // Si l'adresse change → forcer logout aussi
        const { user } = useAuth()
        if (user.value && accounts[0]?.toLowerCase() !== user.value.address.toLowerCase()) {
          logout()
          // Redirection supprimée - l'utilisateur reste sur la page courante
        }
      }
    })

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  }
})
