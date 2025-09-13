import { useState, useEffect } from 'react'
import { BrowserProvider, formatEther } from 'ethers'
import { FaWallet, FaExclamationTriangle, FaExternalLinkAlt } from 'react-icons/fa'

export default function WalletConnector() {
	const [isConnected, setIsConnected] = useState(false)
	const [account, setAccount] = useState('')
	const [balance, setBalance] = useState('')
	const [chainId, setChainId] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [provider, setProvider] = useState(null)

	// Check if MetaMask is installed
	const isMetaMaskInstalled = () => {
		return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask
	}

	// Format address to show first 4 and last 4 characters
	const formatAddress = (address) => {
		if (!address) return ''
		return `${address.slice(0, 6)}...${address.slice(-4)}`
	}

	// Format balance to show 4 decimal places
	const formatBalance = (balance) => {
		if (!balance) return '0.0000'
			return parseFloat(formatEther(balance)).toFixed(4)
	}

	// Get account balance
	const getBalance = async (provider, address) => {
		try {
			const balance = await provider.getBalance(address)
			return formatBalance(balance)
		} catch (err) {
			console.error('Error getting balance:', err)
			return '0.0000'
		}
	}

	// Connect to MetaMask
	const connectWallet = async () => {
		setIsLoading(true)
		setError('')

		try {
			if (!isMetaMaskInstalled()) {
				setError('MetaMask not installed')
				setIsLoading(false)
				return
			}

			// Request account access
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})

			if (accounts.length === 0) {
				setError('No accounts found')
				setIsLoading(false)
				return
			}

			// Create provider
			const newProvider = new BrowserProvider(window.ethereum)
			setProvider(newProvider)

			// Get network info
			const network = await newProvider.getNetwork()
			setChainId(network.chainId.toString())

			// Set account and get balance
			const userAccount = accounts[0]
			setAccount(userAccount)
			setIsConnected(true)

			const accountBalance = await getBalance(newProvider, userAccount)
			setBalance(accountBalance)

		} catch (err) {
			console.error('Error connecting wallet:', err)
			if (err.code === 4001) {
				setError('User rejected the connection request')
			} else {
				setError('Failed to connect wallet')
			}
		} finally {
			setIsLoading(false)
		}
	}

	// Disconnect wallet
	const disconnectWallet = () => {
		setIsConnected(false)
		setAccount('')
		setBalance('')
		setChainId('')
		setProvider(null)
		setError('')
	}

	// Handle account change
	const handleAccountsChanged = (accounts) => {
		if (accounts.length === 0) {
			disconnectWallet()
		} else if (accounts[0] !== account) {
			setAccount(accounts[0])
			if (provider) {
				getBalance(provider, accounts[0]).then(setBalance)
			}
		}
	}

	// Handle chain change
	const handleChainChanged = (chainId) => {
		const newChainId = parseInt(chainId, 16).toString()
		setChainId(newChainId)
		
		// Refresh balance for new chain
		if (provider && account) {
			getBalance(provider, account).then(setBalance)
		}
	}

	// Set up event listeners
	useEffect(() => {
		if (isMetaMaskInstalled()) {
			window.ethereum.on('accountsChanged', handleAccountsChanged)
			window.ethereum.on('chainChanged', handleChainChanged)

			// Cleanup event listeners
			return () => {
				if (window.ethereum.removeListener) {
					window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
					window.ethereum.removeListener('chainChanged', handleChainChanged)
				}
			}
		}
	}, [account, provider])

	// Check if already connected on mount
	useEffect(() => {
		const checkConnection = async () => {
			if (isMetaMaskInstalled()) {
				try {
					const accounts = await window.ethereum.request({
						method: 'eth_accounts',
					})

					if (accounts.length > 0) {
						const newProvider = new BrowserProvider(window.ethereum)
						setProvider(newProvider)
						setAccount(accounts[0])
						setIsConnected(true)

						const network = await newProvider.getNetwork()
						setChainId(network.chainId.toString())

						const accountBalance = await getBalance(newProvider, accounts[0])
						setBalance(accountBalance)
					}
				} catch (err) {
					console.error('Error checking connection:', err)
				}
			}
		}

		checkConnection()
	}, [])

	// Show MetaMask installation warning
	if (!isMetaMaskInstalled()) {
		return (
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-50 border border-yellow-200">
					<FaExclamationTriangle className="text-yellow-600" />
					<span className="text-sm text-yellow-700">MetaMask required</span>
				</div>
				<a
					href="https://metamask.io/download/"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
				>
					<FaExternalLinkAlt className="text-xs" />
					Install
				</a>
			</div>
		)
	}

	// Show error message
	if (error) {
		return (
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 border border-red-200">
					<FaExclamationTriangle className="text-red-600" />
					<span className="text-sm text-red-700">{error}</span>
				</div>
				<button
					onClick={() => setError('')}
					className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
				>
					Retry
				</button>
			</div>
		)
	}

	// Show connected state
	if (isConnected) {
		return (
			<div className="flex items-center gap-3 pl-4 border-l border-slate-200">
				<div className="flex items-center gap-2 text-sm">
					<FaWallet className="text-green-600" />
					<div className="flex flex-col">
						<span className="text-slate-700 font-medium">{formatAddress(account)}</span>
						<span className="text-xs text-slate-500">{balance} ETH</span>
					</div>
				</div>
				<button
					onClick={disconnectWallet}
					className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
				>
					Disconnect
				</button>
			</div>
		)
	}

	// Show connect button
	return (
		<button
			onClick={connectWallet}
			disabled={isLoading}
			className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
		>
			<FaWallet />
			{isLoading ? 'Connecting...' : 'Connect Wallet'}
		</button>
	)
}
