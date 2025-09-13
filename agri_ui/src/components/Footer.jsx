import { useTranslation } from 'react-i18next'

export default function Footer() {
	const { t } = useTranslation()
	
	return (
		<footer className="bg-white border-t border-slate-200">
			<div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
				<p>&copy; {new Date().getFullYear()} AgriTrace. {t('footer.copyright')}</p>
				<nav className="flex gap-4">
					<a href="#" className="hover:text-slate-900">{t('footer.privacy')}</a>
					<a href="#" className="hover:text-slate-900">{t('footer.terms')}</a>
				</nav>
			</div>
		</footer>
	)
}