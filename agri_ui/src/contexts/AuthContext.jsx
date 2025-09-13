import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const AUTH_KEY = 'agri_auth'
const USER_DATA_KEY = 'agri_user_data'

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	// Check if user is logged in
	const isLoggedIn = !!user

	// Load user data from localStorage on app start
	useEffect(() => {
		const loadUserFromStorage = () => {
			try {
				const authStatus = localStorage.getItem(AUTH_KEY)
				const userData = localStorage.getItem(USER_DATA_KEY)
				
				if (authStatus === '1' && userData) {
					const parsedUser = JSON.parse(userData)
					setUser(parsedUser)
				}
			} catch (error) {
				console.error('Error loading user from localStorage:', error)
				// Clear corrupted data
				localStorage.removeItem(AUTH_KEY)
				localStorage.removeItem(USER_DATA_KEY)
			} finally {
				setIsLoading(false)
			}
		}

		loadUserFromStorage()
	}, [])

	// Listen for storage changes (e.g., logout in another tab)
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key === AUTH_KEY || e.key === USER_DATA_KEY) {
				const authStatus = localStorage.getItem(AUTH_KEY)
				const userData = localStorage.getItem(USER_DATA_KEY)
				
				if (authStatus === '1' && userData) {
					try {
						const parsedUser = JSON.parse(userData)
						setUser(parsedUser)
					} catch (error) {
						console.error('Error parsing user data:', error)
						setUser(null)
					}
				} else {
					setUser(null)
				}
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	const login = (userData) => {
		try {
			// Store in localStorage
			localStorage.setItem(AUTH_KEY, '1')
			localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
			
			// Update state
			setUser(userData)
		} catch (error) {
			console.error('Error saving user to localStorage:', error)
			throw new Error('Failed to save login data')
		}
	}

	const logout = () => {
		try {
			// Clear localStorage
			localStorage.removeItem(AUTH_KEY)
			localStorage.removeItem(USER_DATA_KEY)
			
			// Clear state
			setUser(null)
		} catch (error) {
			console.error('Error clearing user data:', error)
		}
	}

	const value = {
		user,
		isLoggedIn,
		isLoading,
		login,
		logout
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}
