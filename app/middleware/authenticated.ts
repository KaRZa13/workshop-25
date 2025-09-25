export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return

  const { isAuthenticated } = useAuth()

})
