export default defineEventHandler(async (event) => {
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  return {
    nonce
  }
})