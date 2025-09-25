interface User {
  id: string
  username: string
  address: string
}

interface Contact {
  id: string
  username: string
}

interface SearchUserResponse {
  success: boolean
  user?: User
  error?: string
}

interface AddContactResponse {
  success: boolean
  contact?: Contact
  error?: string
}

export const useContacts = () => {
  const searchLoading = ref(false)
  const addContactLoading = ref(false)

  /**
   * Rechercher un utilisateur par username
   */
  const searchUser = async (username: string): Promise<SearchUserResponse> => {
    if (!username.trim()) {
      return {
        success: false,
        error: 'Username is required'
      }
    }

    searchLoading.value = true

    try {
      const data = await $fetch<SearchUserResponse>(`/api/users/search`, {
        query: { username: username.trim() }
      })

      return data || { success: false, error: 'No data received' }
    } catch (error) {
      console.error('Error searching user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search user'
      }
    } finally {
      searchLoading.value = false
    }
  }

  /**
   * Ajouter un utilisateur à la liste de contacts
   */
  const addContact = async (contactId: string, userId: string): Promise<AddContactResponse> => {
    if (!contactId || !userId) {
      return {
        success: false,
        error: 'Contact ID and User ID are required'
      }
    }

    addContactLoading.value = true

    try {
      const data = await $fetch<AddContactResponse>('/api/contacts/add', {
        method: 'POST',
        body: {
          contactId,
          userId
        }
      })

      return data || { success: false, error: 'No data received' }
    } catch (error) {
      console.error('Error adding contact:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add contact'
      }
    } finally {
      addContactLoading.value = false
    }
  }

  return {
    searchUser,
    addContact,
    searchLoading: readonly(searchLoading),
    addContactLoading: readonly(addContactLoading)
  }
}