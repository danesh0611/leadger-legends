// Use local backend for API calls
export const BASE_URL = 'http://localhost:5000/api/'

export async function getJson(path = '') {
	const res = await fetch(BASE_URL + path, {
		method: 'GET',
		headers: { 'Accept': 'application/json' },
	})
	const text = await res.text()
	try {
		return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null }
	} catch (e) {
		return { ok: res.ok, status: res.status, data: text }
	}
}

export async function postJson(body, path = '') {
	const res = await fetch(BASE_URL + path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify(body),
	})
	const text = await res.text()
	try {
		return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null }
	} catch (e) {
		return { ok: res.ok, status: res.status, data: text }
	}
}