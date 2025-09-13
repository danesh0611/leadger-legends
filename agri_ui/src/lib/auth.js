import { useEffect, useState } from 'react'

const AUTH_KEY = 'agri_auth'
const USER_DATA_KEY = 'agri_user_data'

export function isLoggedIn() {
	return typeof window !== 'undefined' && window.localStorage.getItem(AUTH_KEY) === '1'
}

export function getUserData() {
	if (typeof window !== 'undefined') {
		const userData = window.localStorage.getItem(USER_DATA_KEY)
		return userData ? JSON.parse(userData) : null
	}
	return null
}

export function login(username, email) {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(AUTH_KEY, '1')
		window.localStorage.setItem(USER_DATA_KEY, JSON.stringify({ username, email }))
	}
}

export function logout() {
	if (typeof window !== 'undefined') {
		window.localStorage.removeItem(AUTH_KEY)
		window.localStorage.removeItem(USER_DATA_KEY)
	}
}

export function useAuth() {
	const [loggedIn, setLoggedIn] = useState(isLoggedIn())
	const [userData, setUserData] = useState(getUserData())
	
	useEffect(() => {
		const onStorage = (e) => {
			if (e.key === AUTH_KEY) {
				setLoggedIn(isLoggedIn())
			}
			if (e.key === USER_DATA_KEY) {
				setUserData(getUserData())
			}
		}
		window.addEventListener('storage', onStorage)
		return () => window.removeEventListener('storage', onStorage)
	}, [])

	// Update user data when component mounts or when logged in state changes
	useEffect(() => {
		if (loggedIn) {
			const user = getUserData()
			setUserData(user)
		} else {
			setUserData(null)
		}
	}, [loggedIn])

	return { loggedIn, setLoggedIn, userData, setUserData }
}