import { useState } from 'react'
import { FaTractor, FaTruck, FaStore } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { postJson } from '../lib/api'

export default function Signup() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [role, setRole] = useState('farmer')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState(null)
	const [error, setError] = useState(null)

	const roles = [
		{ value: 'farmer', label: t('signup.roles.farmer'), icon: FaTractor },
		{ value: 'transporter', label: t('signup.roles.transporter'), icon: FaTruck },
		{ value: 'retailer', label: t('signup.roles.retailer'), icon: FaStore },
	]

	async function handleSubmit(e) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setMessage(null)
		if (password !== confirmPassword) {
			setLoading(false)
			setError('Passwords do not match')
			return
		}
	// Send signup data to backend
	const payload = { username: name, email, password, role }
	const res = await postJson(payload, 'signup')
		setLoading(false)
		if (res.ok) {
			setMessage(t('signup.successMessage'))
			setTimeout(() => navigate('/login'), 2000)
		}
		else setError(`${t('signup.signupFailed')} (status ${res.status})`)
	}

	return (
		<section className="min-h-[70vh] flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-6">
				<h2 className="text-xl font-semibold text-slate-900">{t('signup.title')}</h2>
				<p className="mt-1 text-sm text-slate-600">{t('signup.subtitle')}</p>

				{message && <div className="mt-4 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm">{message}</div>}
				{error && <div className="mt-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">{t('signup.role')}</label>
						<select value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary">
							{roles.map(r => (
								<option key={r.value} value={r.value}>{r.label}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">{t('signup.name')}</label>
						<input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary" placeholder={t('signup.namePlaceholder')} />
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">{t('signup.email')}</label>
						<input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary" placeholder={t('signup.emailPlaceholder')} />
					</div>



					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">{t('signup.password')}</label>
							<input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary" placeholder={t('signup.passwordPlaceholder')} />
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">{t('signup.confirmPassword')}</label>
							<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary" placeholder={t('signup.confirmPasswordPlaceholder')} />
						</div>
					</div>

					<button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center rounded-md bg-secondary text-white px-4 py-2.5 font-medium hover:bg-secondary-dark transition transform hover:-translate-y-0.5 disabled:opacity-60">
						{loading ? t('signup.creatingAccount') : t('signup.signupButton')}
					</button>
				</form>
			</div>
		</section>
	)
}