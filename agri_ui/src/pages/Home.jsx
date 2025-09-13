import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
	const { t } = useTranslation()
	const { isLoggedIn, user } = useAuth()
	
	return (
		<section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
			<div className="max-w-3xl mx-auto px-4 py-12 text-center">
				<div className="flex flex-col items-center">
				<div className="flex items-center gap-3">
						<img 
							src="https://res.cloudinary.com/dirajxhlf/image/upload/v1756978381/ChatGPT_Image_Sep_4_2025_03_00_56_PM_j6gv2h.png" 
							alt="Agritracer logo" 
							className="h-20 w-auto" 
						/>
					</div>
					<div className="flex items-center gap-3">
						<h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">
							{t('content.title')}
						</h1>
					</div>
					<p className="mt-2 text-secondary font-medium text-center">
						{t('welcome')}
					</p>
					{isLoggedIn && user && (
						<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-green-800 font-medium">
								{t('dashboard.welcome')}, <strong>{user.username}</strong>! ({user.email})
							</p>
						</div>
					)}
					<p className="mt-4 text-slate-600 text-center">
						{t('content.description')}
					</p>
					<div className="mt-8">
						<h2 className="text-2xl font-semibold text-slate-800 mb-6">
							{t('content.features.title')}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
								<h3 className="font-medium text-slate-800 mb-2">
									{t('content.features.feature1')}
								</h3>
								<p className="text-sm text-slate-600">
									Track products from farm to consumer
								</p>
							</div>
							<div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
								<h3 className="font-medium text-slate-800 mb-2">
									{t('content.features.feature2')}
								</h3>
								<p className="text-sm text-slate-600">
									Ensure quality standards throughout
								</p>
							</div>
							<div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
								<h3 className="font-medium text-slate-800 mb-2">
									{t('content.features.feature3')}
								</h3>
								<p className="text-sm text-slate-600">
									Complete visibility in supply chain
								</p>
							</div>
							<div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
								<h3 className="font-medium text-slate-800 mb-2">
									{t('content.features.feature4')}
								</h3>
								<p className="text-sm text-slate-600">
									Generate QR codes for products
								</p>
							</div>
						</div>
					</div>
					<div className="mt-8 flex gap-3 justify-center flex-wrap">
						<a 
							href="/signup" 
							className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-white hover:bg-primary-dark transition shadow-sm"
						>
							{t('signup.signupButton')}
						</a>
						<a 
							href="/qr" 
							className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
						>
							{t('qrGenerator.title')}
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}
