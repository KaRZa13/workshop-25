import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, username } = body

    if (!userId || !username) {
      throw new Error('User ID and username are required')
    }

    // Valider le format du username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(username)) {
      throw new Error('Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens')
    }

    // Initialiser le client Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Normaliser le username
    const normalizedUsername = username.toLowerCase()

    // Vérifier d'abord que le username n'est pas déjà pris
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', normalizedUsername)
      .neq('id', userId) // Exclure l'utilisateur actuel
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking username availability:', checkError)
      throw new Error('Database error while checking username')
    }

    if (existingUser) {
      throw new Error('Username is already taken')
    }

    // Mettre à jour le username de l'utilisateur
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ username: normalizedUsername })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating username:', updateError)
      throw new Error('Failed to update username: ' + updateError.message)
    }

    if (!updatedUser) {
      throw new Error('User not found or update failed')
    }

    return {
      success: true,
      user: {
        id: updatedUser.id,
        address: updatedUser.address,
        username: updatedUser.username,
        isConnected: true
      }
    }

  } catch (error) {
    console.error('Update username error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Username update failed'
    })
  }
})