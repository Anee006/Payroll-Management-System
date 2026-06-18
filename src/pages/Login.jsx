import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { supabase } from '../services/supabaseClient'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    // Safety Check: If environmental variables are missing, don't stall the app
    if (!supabase) {
      setError("Supabase client is not configured. Please check your .env file.")
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Smooth routing transition upon successful session creation
      navigate('/dashboard')
    } catch (err) {
      console.error("Login compilation/network error:", err)
      setError("An unexpected error occurred during login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">PayrollPro</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            label={loading ? 'Logging in...' : 'Login'}
            loading={loading}
            className="w-full"
          />

          {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default Login