// Types pour l'authentification
export interface NonceResponse {
  nonce: string
}

export interface AuthVerifyResponse {
  session: any // À remplacer par le type Session de Supabase si vous l'utilisez
  user: DbUser
  isNewUser: boolean
  needsUsername: boolean
}

export interface User {
  id: string
  address: string
  username?: string
  isConnected: boolean
}

export interface DbUser {
  id: string
  address: string
  username?: string
  created_at: string
  updated_at?: string
  // Ajoutez d'autres propriétés selon votre schéma de base de données
}

// Types pour Ethereum
export interface WalletConnection {
  provider: any // ethers.BrowserProvider
  signer: any   // ethers.Signer
  address: string
}