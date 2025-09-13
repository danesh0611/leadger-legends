import { Component } from 'react'

export default class ErrorBoundary extends Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error }
	}

	componentDidCatch(error, info) {
		// eslint-disable-next-line no-console
		console.error('ErrorBoundary caught:', error, info)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: 16 }}>
					<h2 style={{ color: '#b91c1c' }}>Something went wrong.</h2>
					<pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
				</div>
			)
		}
		return this.props.children
	}
}
