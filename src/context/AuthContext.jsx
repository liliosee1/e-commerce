import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'ecomus-auth'
const COMMERCE_TOKEN_STORAGE_KEY = 'ecomus-commerce-token'

const authApi = axios.create({
  baseURL: 'https://sms-express-app-1-production-a843.up.railway.app/api'
})

const commerceApi = axios.create({
  baseURL: 'https://e-commas-apis-production-e0f8.up.railway.app/api'
})

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function extractToken(payload) {
  const direct = payload?.token || payload?.accessToken || payload?.access_token || payload?.jwt || null
  if (direct) return direct

  if (payload?.data && typeof payload.data === 'object') {
    return extractToken(payload.data)
  }

  return null
}

async function authenticateCommerce({ email, password }) {
  try {
    const response = await commerceApi.post('/auth/users/login', { email, password })
    const token = extractToken(response?.data)
    if (token) {
      localStorage.setItem(COMMERCE_TOKEN_STORAGE_KEY, token)
    }
    return token
  } catch {
    localStorage.removeItem(COMMERCE_TOKEN_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [auth])

  const register = async ({ email, password }) => {
    setLoading(true)
    try {
      await authApi.post('/auth/register', { email, password })
      try {
        await commerceApi.post('/auth/users/register', { name: email.split('@')[0], email, password })
      } catch {
        // Ignore failures from the commerce registration endpoint; the main auth flow still works.
      }
      return { success: true, message: 'Account created. Please verify your email with the OTP sent to your inbox.' }
    } catch (error) {
      throw error?.message || 'Registration failed. Please try again.'
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async ({ email, otp }) => {
    setLoading(true)
    try {
      await authApi.post('/auth/verify-email', { email, otp })
      return { success: true, message: 'Email verified successfully. You can now sign in.' }
    } catch (error) {
      throw error?.message || 'OTP verification failed.'
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const response = await authApi.post('/auth/login', { email, password })
      const payload = response?.data?.data || response?.data || {}
      const tokens = payload?.tokens || payload?.token || {}
      const user = payload?.user || payload?.profile || null
      const nextAuth = {
        accessToken: tokens.access_token || tokens.accessToken || payload.accessToken || payload.access_token || null,
        refreshToken: tokens.refresh_token || tokens.refreshToken || payload.refreshToken || payload.refresh_token || null,
        user
      }

      setAuth(nextAuth)
      await authenticateCommerce({ email, password })
      return { success: true, message: 'Signed in successfully.' }
    } catch (error) {
      throw error?.message || 'Unable to sign in. Please check your credentials.'
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async ({ email }) => {
    setLoading(true)
    try {
      await authApi.post('/auth/forgot-password', { email })
      return { success: true, message: 'If the email exists, a password reset OTP has been sent.' }
    } catch (error) {
      throw error?.message || 'We could not request a reset OTP right now.'
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAuth(null)
    localStorage.removeItem(COMMERCE_TOKEN_STORAGE_KEY)
  }

  const value = useMemo(() => ({
    auth,
    loading,
    isAuthenticated: Boolean(auth?.accessToken),
    register,
    verifyEmail,
    login,
    forgotPassword,
    logout
  }), [auth, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
