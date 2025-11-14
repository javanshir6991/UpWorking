import React, { createContext, useContext, useEffect, useState } from 'react'
import LoginModal from '../Features/Components/LoginModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

interface User {
    id: number
    username?: string
    email?: string
}

interface AuthContextValue {
    token: string | null
    user: User | null
    isAuthenticated: boolean
    login: (identifier: string, password: string) => Promise<void>
    register: (username: string, email: string, password: string) => Promise<void>
    logout: () => void
    openLogin: () => void
    closeLogin: () => void
    showLogin: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt'))
    const [user, setUser] = useState<User | null>(() => {
        const raw = localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    })
    const [showLogin, setShowLogin] = useState(false)

    useEffect(() => {
        if (token) {
            localStorage.setItem('jwt', token)
        } else {
            localStorage.removeItem('jwt')
        }
    }, [token])

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user))
        else localStorage.removeItem('user')
    }, [user])

    const login = async (identifier: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        })
        const json = await res.json()
        if (!res.ok) {
            throw new Error(json?.message || json?.error?.message || 'Login failed')
        }
        setToken(json.jwt)
        setUser(json.user)
        setShowLogin(false)
    }

    const register = async (username: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/local/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        })
        const json = await res.json()
        if (!res.ok) {
            throw new Error(json?.message || json?.error?.message || 'Registration failed')
        }
        // some Strapi setups return jwt/user here
        if (json.jwt) {
            setToken(json.jwt)
            setUser(json.user)
            setShowLogin(false)
        } else {
            // If registration succeeded but no jwt returned, try logging in
            await login(email, password)
        }
    }

    const logout = () => {
        setToken(null)
        setUser(null)
    }

    const openLogin = () => setShowLogin(true)
    const closeLogin = () => setShowLogin(false)

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, register, logout, openLogin, closeLogin, showLogin }}>
            {children}
            <LoginModal />
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export default AuthContext
