import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { username } = query

    if (!username || typeof username !== 'string') {
      throw new Error('Username is required')
    }

    // Valider le format du username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(username)) {
      return {
        success: false,
        error: 'Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens'
      }
    }

    // Initialiser le client Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Rechercher l'utilisateur par username
    const { data, error } = await supabase
      .from('users')
      .select('id, username, address')
      .eq('username', username.toLowerCase())
      .single()

    if (error && error.code === 'PGRST116') {
      // Aucun utilisateur trouvé avec ce username
      return {
        success: false,
        error: 'User not found'
      }
    } else if (error) {
      console.error('Error searching user:', error)
      throw new Error('Database error while searching user')
    } else {
      // Utilisateur trouvé
      return {
        success: true,
        user: {
          id: data.id,
          username: data.username,
          address: data.address
        }
      }
    }

  } catch (error) {
    console.error('User search error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'User search failed'
    })
  }
})