import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { contactId, userId } = body

    if (!contactId || typeof contactId !== 'string') {
      throw new Error('Contact ID is required')
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required')
    }

    const currentUserId = userId

    // Initialiser le client Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier que l'utilisateur contact existe
    const { data: contactUser, error: contactError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', contactId)
      .single()

    if (contactError || !contactUser) {
      return {
        success: false,
        error: 'Contact user not found'
      }
    }

    // Vérifier si la relation existe déjà
    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('contact_id', contactId)
      .single()

    if (existingContact) {
      return {
        success: false,
        error: 'Contact already exists'
      }
    }

    // Ajouter le contact
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: currentUserId,
        contact_id: contactId,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error adding contact:', error)
      throw new Error('Database error while adding contact')
    }

    return {
      success: true,
      contact: {
        id: contactUser.id,
        username: contactUser.username
      }
    }

  } catch (error) {
    console.error('Add contact error:', error)
    
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Failed to add contact'
    })
  }
})