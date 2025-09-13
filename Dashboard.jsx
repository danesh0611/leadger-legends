import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { isLoggedIn, user, logout, isLoading } = useAuth()

	const STORAGE_KEY = 'agri_submissions'
	const [entries, setEntries] = useState([])
	const [saving, setSaving] = useState(false)

	// Form states by role
	const [farmerForm, setFarmerForm] = useState({
		farmerName: '',
		cropType: '',
		quantityKg: '',
		pricePerKg: '',
		location: ''
	})

	const [transporterForm, setTransporterForm] = useState({
		batchId: '',
		distributorName: '',
		cropName: '',
		quantityReceived: '',
		purchasePrice: '',
		transportDetails: '',
		warehouseLocation: '',
		handoverDate: ''
	})

	const [retailerForm, setRetailerForm] = useState({
		batchId: '',
		retailerName: '',
		distributorName: '',
		cropName: '',
		shopLocation: '',
		retailQuantity: '',
		retailPurchasePrice: '',
		consumerPrice: '',
		expiryDate: ''
	})

	useEffect(() => {
		if (!isLoading && !isLoggedIn) {
			navigate('/login')
			return
		}
	}, [isLoggedIn, isLoading, navigate])

	// Load entries from storage
	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			setEntries(raw ? JSON.parse(raw) : [])
		} catch {
			setEntries([])
		}
	}, [])

	const saveEntries = (next) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
		setEntries(next)
	}

	const handleLogout = () => {
		logout()
		navigate('/login')
	}

	const role = user?.role || 'farmer'

	const filteredEntries = useMemo(() => {
		return entries.filter(e => e.role === role)
	}, [entries, role])

	function handleSubmit(e) {
		e.preventDefault()
		setSaving(true)
		const timestamp = new Date().toISOString()
		let record = { id: `${role}-${Date.now()}`, role, createdAt: timestamp }
		if (role === 'farmer') {
			record = {
				...record,
				farmerName: farmerForm.farmerName,
				cropType: farmerForm.cropType,
				quantityKg: Number(farmerForm.quantityKg || 0),
				pricePerKg: Number(farmerForm.pricePerKg || 0),
				location: farmerForm.location
			}
			setFarmerForm({ farmerName: '', cropType: '', quantityKg: '', pricePerKg: '', location: '' })
		}
		if (role === 'transporter') {
			record = {
				...record,
				batchId: transporterForm.batchId,
				distributorName: transporterForm.distributorName,
				cropName: transporterForm.cropName,
				quantityReceived: Number(transporterForm.quantityReceived || 0),
				purchasePrice: Number(transporterForm.purchasePrice || 0),
				transportDetails: transporterForm.transportDetails,
				warehouseLocation: transporterForm.warehouseLocation,
				handoverDate: transporterForm.handoverDate
			}
			setTransporterForm({ batchId: '', distributorName: '', cropName: '', quantityReceived: '', purchasePrice: '', transportDetails: '', warehouseLocation: '', handoverDate: '' })
		}
		if (role === 'retailer') {
			record = {
				...record,
				batchId: retailerForm.batchId,
				retailerName: retailerForm.retailerName,
				distributorName: retailerForm.distributorName,
				cropName: retailerForm.cropName,
				shopLocation: retailerForm.shopLocation,
				retailQuantity: Number(retailerForm.retailQuantity || 0),
				retailPurchasePrice: Number(retailerForm.retailPurchasePrice || 0),
				consumerPrice: Number(retailerForm.consumerPrice || 0),
				expiryDate: retailerForm.expiryDate
			}
			setRetailerForm({ batchId: '', retailerName: '', distributorName: '', cropName: '', shopLocation: '', retailQuantity: '', retailPurchasePrice: '', consumerPrice: '', expiryDate: '' })
		}

		const next = [record, ...entries]
		saveEntries(next)
		setSaving(false)
	}

	// Delete action removed; entries cannot be deleted from the receipt UI.

	if (isLoading) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-slate-600">{t('dashboard.loading')}</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return null
	}

	return (
		<section className="min-h-[70vh] flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-slate-200 p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						{t('dashboard.welcome')}, {user.username}!
					</h1>
					<p className="text-slate-600">{t('dashboard.subtitle')}</p>
				</div>

				<div className="bg-slate-50 rounded-lg p-6 mb-6">
					<h2 className="text-lg font-semibold text-slate-900 mb-4">{t('dashboard.userInfo')}</h2>
					<div className="space-y-3">
						<div className="flex justify-between items-center py-2 border-b border-slate-200">
							<span className="font-medium text-slate-700">{t('dashboard.username')}:</span>
							<span className="text-slate-900">{user.username}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-medium text-slate-700">{t('dashboard.email')}:</span>
							<span className="text-slate-900">{user.email}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-medium text-slate-700">Role:</span>
							<span className="text-slate-900 capitalize">{role}</span>
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
					<button
						onClick={handleLogout}
						className="inline-flex items-center justify-center rounded-md bg-red-600 text-white px-6 py-3 font-medium hover:bg-red-700 transition transform hover:-translate-y-0.5"
					>
						{t('dashboard.logout')}
					</button>
					<button
						onClick={() => navigate('/qr')}
						className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 font-medium hover:bg-primary-dark transition transform hover:-translate-y-0.5"
					>
						{t('dashboard.generateQR')}
					</button>
				</div>

				{/* Role-specific submission form */}
				<div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
					<h3 className="text-xl font-semibold text-slate-900 mb-4">{role === 'farmer' ? 'Farmer Entry' : role === 'transporter' ? 'Transporter Entry' : 'Retailer Entry'}</h3>
					<form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
						{role === 'farmer' && (
							<>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Farmer Name</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={farmerForm.farmerName} onChange={e=>setFarmerForm(v=>({...v, farmerName:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Crop Type</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={farmerForm.cropType} onChange={e=>setFarmerForm(v=>({...v, cropType:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Quantity (kg)</span>
									<input type="number" min="0" step="0.01" className="rounded-md border border-slate-300 px-3 py-2" value={farmerForm.quantityKg} onChange={e=>setFarmerForm(v=>({...v, quantityKg:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Price per kg</span>
									<input type="number" min="0" step="0.01" className="rounded-md border border-slate-300 px-3 py-2" value={farmerForm.pricePerKg} onChange={e=>setFarmerForm(v=>({...v, pricePerKg:e.target.value}))} required />
								</label>
								<label className="sm:col-span-2 flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Location</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={farmerForm.location} onChange={e=>setFarmerForm(v=>({...v, location:e.target.value}))} required />
								</label>
							</>
						)}

						{role === 'transporter' && (
							<>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Batch ID</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.batchId} onChange={e=>setTransporterForm(v=>({...v, batchId:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Distributor Name</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.distributorName} onChange={e=>setTransporterForm(v=>({...v, distributorName:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Crop Name</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.cropName} onChange={e=>setTransporterForm(v=>({...v, cropName:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Quantity Received</span>
									<input type="number" min="0" step="0.01" className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.quantityReceived} onChange={e=>setTransporterForm(v=>({...v, quantityReceived:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Purchase Price</span>
									<input type="number" min="0" step="0.01" className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.purchasePrice} onChange={e=>setTransporterForm(v=>({...v, purchasePrice:e.target.value}))} required />
								</label>
								<label className="sm:col-span-2 flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Transport Details</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.transportDetails} onChange={e=>setTransporterForm(v=>({...v, transportDetails:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Warehouse Location</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.warehouseLocation} onChange={e=>setTransporterForm(v=>({...v, warehouseLocation:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Hand over date</span>
									<input type="date" className="rounded-md border border-slate-300 px-3 py-2" value={transporterForm.handoverDate} onChange={e=>setTransporterForm(v=>({...v, handoverDate:e.target.value}))} required />
								</label>
							</>
						)}

						{role === 'retailer' && (
							<>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Batch ID</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.batchId} onChange={e=>setRetailerForm(v=>({...v, batchId:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Retailer Name</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.retailerName} onChange={e=>setRetailerForm(v=>({...v, retailerName:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Distributor Name</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.distributorName} onChange={e=>setRetailerForm(v=>({...v, distributorName:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Crop Name</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.cropName} onChange={e=>setRetailerForm(v=>({...v, cropName:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Shop Location</span>
									<input className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.shopLocation} onChange={e=>setRetailerForm(v=>({...v, shopLocation:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Retail Quantity</span>
									<input type="number" min="0" step="0.01" className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.retailQuantity} onChange={e=>setRetailerForm(v=>({...v, retailQuantity:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Retail Purchase Price</span>
									<input type="number" min="0" step="0.01" className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.retailPurchasePrice} onChange={e=>setRetailerForm(v=>({...v, retailPurchasePrice:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Consumer Price</span>
									<input type="number" min="0" step="0.01" className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.consumerPrice} onChange={e=>setRetailerForm(v=>({...v, consumerPrice:e.target.value}))} required />
								</label>
								<label className="flex flex-col text-sm">
									<span className="mb-1 text-slate-700">Expiry Date</span>
									<input type="date" className="rounded-md border border-slate-300 px-3 py-2" value={retailerForm.expiryDate} onChange={e=>setRetailerForm(v=>({...v, expiryDate:e.target.value}))} required />
								</label>
							</>
						)}

						<div className="sm:col-span-2 mt-2">
							<button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center rounded-md bg-secondary text-white px-4 py-2.5 font-medium hover:bg-secondary-dark disabled:opacity-60">
								{saving ? 'Saving...' : 'Submit'}
							</button>
						</div>
					</form>
				</div>

				{/* Display entries */}
				<div className="bg-slate-50 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Entries</h3>
					{filteredEntries.length === 0 ? (
						<p className="text-slate-600">No entries yet.</p>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm text-center">
								<thead>
									<tr className="text-slate-600">
										{role === 'farmer' && (<>
											<th className="px-3 py-2">Farmer</th>
											<th className="px-3 py-2">Crop</th>
											<th className="px-3 py-2">Qty (kg)</th>
											<th className="px-3 py-2">Price/kg</th>
											<th className="px-3 py-2">Location</th>
										</>)}
										{role === 'transporter' && (<>
											<th className="px-3 py-2">Batch</th>
											<th className="px-3 py-2">Distributor</th>
											<th className="px-3 py-2">Crop Name</th>
											<th className="px-3 py-2">Qty Received</th>
											<th className="px-3 py-2">Purchase Price</th>
											<th className="px-3 py-2">Warehouse</th>
											<th className="px-3 py-2">Handover</th>
										</>)}
										{role === 'retailer' && (<>
											<th className="px-3 py-2">Batch</th>
											<th className="px-3 py-2">Retailer</th>
											<th className="px-3 py-2">Distributor</th>
											<th className="px-3 py-2">Crop Name</th>
											<th className="px-3 py-2">Shop</th>
											<th className="px-3 py-2">Qty</th>
											<th className="px-3 py-2">Retail Buy</th>
											<th className="px-3 py-2">Consumer Price</th>
											<th className="px-3 py-2">Expiry</th>
										</>)}
									</tr>
								</thead>
								<tbody>
									{filteredEntries.map(row => (
										<tr key={row.id} className="border-t border-slate-200">
											{role === 'farmer' && (<>
												<td className="px-3 py-2">{row.farmerName}</td>
												<td className="px-3 py-2">{row.cropType}</td>
												<td className="px-3 py-2">{row.quantityKg}</td>
												<td className="px-3 py-2">{row.pricePerKg}</td>
												<td className="px-3 py-2">{row.location}</td>
											</>)}
											{role === 'transporter' && (<>
												<td className="px-3 py-2">{row.batchId}</td>
												<td className="px-3 py-2">{row.distributorName}</td>
												<td className="px-3 py-2">{row.cropName}</td>
												<td className="px-3 py-2">{row.quantityReceived}</td>
												<td className="px-3 py-2">{row.purchasePrice}</td>
												<td className="px-3 py-2">{row.warehouseLocation}</td>
												<td className="px-3 py-2">{row.handoverDate}</td>
											</>)}
											{role === 'retailer' && (<>
												<td className="px-3 py-2">{row.batchId}</td>
												<td className="px-3 py-2">{row.retailerName}</td>
												<td className="px-3 py-2">{row.distributorName}</td>
												<td className="px-3 py-2">{row.cropName}</td>
												<td className="px-3 py-2">{row.shopLocation}</td>
												<td className="px-3 py-2">{row.retailQuantity}</td>
												<td className="px-3 py-2">{row.retailPurchasePrice}</td>
												<td className="px-3 py-2">{row.consumerPrice}</td>
												<td className="px-3 py-2">{row.expiryDate}</td>
											</>)}
										</tr>) )}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
