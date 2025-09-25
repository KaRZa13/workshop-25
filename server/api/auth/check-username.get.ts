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
        available: false,
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

    // Vérifier si le username existe déjà
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (error && error.code === 'PGRST116') {
      // Aucun utilisateur trouvé avec ce username - disponible
      return {
        available: true,
        username: username.toLowerCase()
      }
    } else if (error) {
      console.error('Error checking username:', error)
      throw new Error('Database error while checking username')
    } else {
      // Un utilisateur existe avec ce username
      return {
        available: false,
        error: 'Username is already taken'
      }
    }

  } catch (error) {
    console.error('Username check error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Username validation failed'
    })
  }
})