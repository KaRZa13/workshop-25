// Version simplifiée sans Supabase pour tester
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { address, chainId, message, signature } = body

    console.log('Verify API called with:', { address, chainId, messageLength: message?.length, hasSignature: !!signature })


    if (!signature || !address) {
      throw new Error('Invalid signature or address')
    }

    const mockUser = {
      id: `user_${address.slice(-8)}`,
      address: address.toLowerCase(),
      username: null,
      created_at: new Date().toISOString()
    }

    console.log('Mock user created:', mockUser)

    const response = {
      session: {
        access_token: `mock_token_${mockUser.id}`,
        user: {
          id: mockUser.id,
          address: mockUser.address,
          username: mockUser.username
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      user: {
        id: mockUser.id,
        address: mockUser.address,
        username: mockUser.username,
        isConnected: true
      }
    }

    console.log('Returning response:', response)
    return response

  } catch (error) {
    console.error('Auth verify error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Authentication failed'
    })
  }
})