import axios from 'axios'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null, // Token will be stored here
    user_name: null, // Token will be stored here
    user_email: null, // Token will be stored here
  }),

  actions: {
    async login(email, password, remember = false) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, {
          email,
          password,
          remember
        })
        
        // console.log(response);
        let checkToken = response.data.data.token;
        if(!checkToken)
          throw "Undefined Token";
        
        // Store the token in Pinia state
        this.token = response.data.data.token
        this.user_name = response.data.data.user_name
        this.user_email = response.data.data.user_email

        // Also store the token in local storage for persistence
        localStorage.setItem('auth_token', this.token)
        localStorage.setItem('user_name', this.user_name)
        localStorage.setItem('user_email', this.user_email)
        
        // Set axios default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return true // Indicate success
      } catch (error) {
        console.error('Login failed:', error)
        return false // Indicate failure
      }
    },

    logout() {      
      const response = axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`)
      // Clear the token from the store and local storage
      this.token = null
      localStorage.removeItem('auth_token')
      axios.defaults.headers.common['Authorization'] = ''
      return true // Indicate success
    },

    initializeAuth() {
      // Check if there's a token in local storage when the app starts
      const token = localStorage.getItem('auth_token')
      if (token) {
        this.token = token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        const router = useRouter()
        router.push('/login')
      }
    },
  },
})
