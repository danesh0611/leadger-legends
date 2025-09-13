import { useState } from 'react'
import { FaTractor, FaTruck, FaStore } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { postJson } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { login } = useAuth()
	const [role, setRole] = useState('farmer')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState(null)
	const [error, setError] = useState(null)

	const roles = [
		{ value: 'farmer', label: t('login.roles.farmer'), icon: FaTractor },
		{ value: 'transporter', label: t('login.roles.transporter'), icon: FaTruck },
		{ value: 'retailer', label: t('login.roles.retailer'), icon: FaStore },
	]

	const Icon = roles.find(r => r.value === role)?.icon || FaTractor

	async function handleSubmit(e) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setMessage(null)
		const payload = { action: 'login', role, email, password }
		const res = await postJson(payload)
		setLoading(false)
		if (res.ok) {
			// Use the login function from context
			login({ username: email.split('@')[0], email, role })
			setMessage(t('login.successMessage'))
			setTimeout(() => navigate('/dashboard'), 600)
		}
		else setError(`${t('login.loginFailed')} (status ${res.status})`)
	}

	return (
		<section className="min-h-[70vh] flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-6">
				<h2 className="text-xl font-semibold text-slate-900">{t('login.title')}</h2>
				<p className="mt-1 text-sm text-slate-600">{t('login.subtitle')}</p>

				{message && <div className="mt-4 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm">{message}</div>}
				{error && <div className="mt-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">{t('login.role')}</label>
						<div className="relative">
							<select value={role} onChange={e => setRole(e.target.value)} className="w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-8 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary">
								{roles.map(r => (
									<option key={r.value} value={r.value}>{r.label}</option>
								))}
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">▾</div>
						</div>
						<div className="mt-2 flex items-center gap-2 text-slate-600">
							<Icon className="text-primary" />
							<span className="text-sm">{t('login.selected')}: {roles.find(r => r.value === role)?.label}</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">{t('login.email')}</label>
						<input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary" placeholder={t('login.emailPlaceholder')} />
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">{t('login.password')}</label>
						<input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary" placeholder={t('login.passwordPlaceholder')} />
					</div>

					<button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2.5 font-medium hover:bg-primary-dark transition transform hover:-translate-y-0.5 disabled:opacity-60">
						{loading ? t('login.loggingIn') : t('login.loginButton')}
					</button>
				</form>

				<p className="mt-4 text-sm text-slate-600">{t('login.newUser')} <Link to="/signup" className="text-secondary hover:underline">{t('login.createAccount')}</Link></p>
			</div>
		</section>
	)
}