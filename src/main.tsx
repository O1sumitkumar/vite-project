import { render } from 'preact'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { App } from './app'
import './index.css'




render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app')!
)
