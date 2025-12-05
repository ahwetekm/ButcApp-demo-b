import { ClientAuthService } from './client-auth-service'

// Basit veri senkronizasyon fonksiyonları
export const dataSync = {
  // Mevcut kullanıcı ID'sini al
  async getCurrentUserId() {
    try {
      const token = ClientAuthService.getToken()
      if (!token) return null
      
      const user = await ClientAuthService.verifyToken(token)
      return user?.id || null
    } catch (error) {
      console.error('Error in getCurrentUserId:', error)
      return null
    }
  },

  // Bakiyeleri getir
  async getBalances() {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) return { cash: 0, bank: 0, savings: 0 }

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/balances`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch balances:', response.statusText)
        return { cash: 0, bank: 0, savings: 0 }
      }

      const data = await response.json()
      console.log('Balances retrieved from API:', data)
      return data || { cash: 0, bank: 0, savings: 0 }
    } catch (error) {
      console.error('Error in getBalances:', error)
      return { cash: 0, bank: 0, savings: 0 }
    }
  },

  // Bakiyeleri güncelle
  async updateBalances(balances: any) {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) {
        console.error('No user ID found for updating balances')
        return false
      }

      console.log('Updating balances via API:', balances)

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/balances`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(balances)
      })

      if (!response.ok) {
        console.error('Failed to update balances:', response.statusText)
        return false
      }

      console.log('Balances successfully updated via API')
      return true
    } catch (error) {
      console.error('Error in updateBalances:', error)
      return false
    }
  },

  // İşlemleri getir
  async getTransactions() {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) return []

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch transactions:', response.statusText)
        return []
      }

      const data = await response.json()
      console.log('Transactions retrieved from API:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error in getTransactions:', error)
      return []
    }
  },

  // İşlem ekle
  async addTransaction(transaction: any) {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) {
        console.error('No user ID found for adding transaction')
        return false
      }

      console.log('Adding transaction via API:', transaction)

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
      })

      if (!response.ok) {
        console.error('Failed to add transaction:', response.statusText)
        return false
      }

      console.log('Transaction successfully added via API')
      return true
    } catch (error) {
      console.error('Error in addTransaction:', error)
      return false
    }
  },

  // Tekrarlayan işlemleri getir
  async getRecurringTransactions() {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) return []

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/recurring-transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch recurring transactions:', response.statusText)
        return []
      }

      const data = await response.json()
      console.log('Recurring transactions retrieved from API:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error in getRecurringTransactions:', error)
      return []
    }
  },

  // Tekrarlayan işlem ekle
  async addRecurringTransaction(recurring: any) {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) {
        console.error('No user ID found for adding recurring transaction')
        return false
      }

      console.log('Adding recurring transaction via API:', recurring)

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/recurring-transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recurring)
      })

      if (!response.ok) {
        console.error('Failed to add recurring transaction:', response.statusText)
        return false
      }

      console.log('Recurring transaction successfully added via API')
      return true
    } catch (error) {
      console.error('Error in addRecurringTransaction:', error)
      return false
    }
  },

  // Tekrarlayan işlem güncelle
  async updateRecurringTransaction(updatedRecurring: any) {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) {
        console.error('No user ID found for updating recurring transaction')
        return false
      }

      console.log('Updating recurring transaction via API:', updatedRecurring)

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/recurring-transactions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRecurring)
      })

      if (!response.ok) {
        console.error('Failed to update recurring transaction:', response.statusText)
        return false
      }

      console.log('Recurring transaction successfully updated via API')
      return true
    } catch (error) {
      console.error('Error in updateRecurringTransaction:', error)
      return false
    }
  },

  // Notları getir
  async getNotes() {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) return []

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/notes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch notes:', response.statusText)
        return []
      }

      const data = await response.json()
      console.log('Notes retrieved from API:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error in getNotes:', error)
      return []
    }
  },

  // Not ekle
  async addNote(note: any) {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) {
        console.error('No user ID found for adding note')
        return false
      }

      console.log('Adding note via API:', note)

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(note)
      })

      if (!response.ok) {
        console.error('Failed to add note:', response.statusText)
        return false
      }

      console.log('Note successfully added via API')
      return true
    } catch (error) {
      console.error('Error in addNote:', error)
      return false
    }
  },

  // Not sil
  async deleteNote(noteId: string) {
    try {
      const userId = await this.getCurrentUserId()
      if (!userId) {
        console.error('No user ID found for deleting note')
        return false
      }

      console.log('Deleting note via API:', noteId)

      const response = await fetch(`${ClientAuthService.getBaseUrl()}/api/data/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ClientAuthService.getToken()}`
        }
      })

      if (!response.ok) {
        console.error('Failed to delete note:', response.statusText)
        return false
      }
      
      console.log('Note successfully deleted via API')
      return true
    } catch (error) {
      console.error('Error in deleteNote:', error)
      return false
    }
  }
}