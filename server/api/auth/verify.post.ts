import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { address, chainId, message, signature } = body

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (!signature || !address) {
      throw new Error('Invalid signature or address')
    }

    const normalizedAddress = address.toLowerCase()


    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('address', normalizedAddress)
      .single()

    let user
    let isNewUser = false

    if (fetchError && fetchError.code === 'PGRST116') {

      console.log('Creating new user for address:', normalizedAddress)
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          address: normalizedAddress,

        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        throw new Error('Failed to create user: ' + createError.message)
      }

      user = newUser
      isNewUser = true
    } else if (fetchError) {
      console.error('Error fetching user:', fetchError)
      throw new Error('Database error: ' + fetchError.message)
    } else {
      console.log('Existing user found:', existingUser.id)
      user = existingUser
      isNewUser = false
    }

    if (!user) {
      throw new Error('User operation failed - no data returned')
    }

    const sessionData = {
      user_id: user.id,
      address: user.address,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    return {
      session: {
        access_token: `mock_token_${user.id}`,
        user: {
          id: user.id,
          address: user.address,
          username: user.username
        },
        expires_at: sessionData.expires_at
      },
      user: {
        id: user.id,
        address: user.address,
        username: user.username,
        isConnected: true
      },
      isNewUser,
      needsUsername: !user.username
    }

  } catch (error) {
    console.error('Auth verify error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Authentication failed'
    })
  }
})