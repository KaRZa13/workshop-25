export default defineNuxtPlugin(() => {
  if (process.server) return

  const { restoreSession, checkWalletConnection } = useAuth()
  
  restoreSession()
  
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        const { logout } = useAuth()
        logout()
        navigateTo('/login')
      }
    })

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  }
})