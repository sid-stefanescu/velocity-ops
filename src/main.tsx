import { render } from 'preact'
import 'virtual:uno.css'
import './index.css'
import { App } from './app.tsx'

render(<App />, document.getElementById('app')!)
