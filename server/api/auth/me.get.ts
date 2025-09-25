import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { userId } = query

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Initialiser le client Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer l'utilisateur depuis la base de données
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      throw new Error('User not found')
    }

    if (!user) {
      throw new Error('User not found')
    }

    return {
      success: true,
      user: {
        id: user.id,
        address: user.address,
        username: user.username,
        isConnected: true
      }
    }

  } catch (error) {
    console.error('Get user error:', error)
    throw createError({
      statusCode: 404,
      statusMessage: error instanceof Error ? error.message : 'User not found'
    })
  }
})