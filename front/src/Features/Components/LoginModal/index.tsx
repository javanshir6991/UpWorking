import { useState } from 'react'
import { useAuth } from '../../../Context/AuthContext'

const LoginModal = () => {
    const { showLogin, closeLogin, login, register } = useAuth()
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!showLogin) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            if (isRegister) {
                await register(username || email, email, password)
            } else {
                await login(email, password)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{isRegister ? 'Create account' : 'Sign in'}</h3>
                    <button onClick={closeLogin} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full name</label>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" required />
                    </div>

                    <div className="flex items-center justify-between">
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold">
                            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
                        </button>
                        <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-sm text-blue-600">
                            {isRegister ? 'Have an account? Sign in' : "Don't have an account? Register"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginModal
