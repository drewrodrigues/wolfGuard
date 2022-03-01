import React from 'react'
import { BrowserRouter, Link, NavLink } from 'react-router-dom'
import { Router } from './components/router'

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-screen-md m-auto">
        <nav className="flex justify-between items-center">
          <main className="mb-[20px]">
            <Link to="/" className="font-bold">
              SmartTrader
            </Link>
          </main>

          <aside className="text-[14px]">
            <NavLink
              to="/"
              className={(props) => (props.isActive ? 'underline' : '')}
            >
              Symbols
            </NavLink>
            <NavLink
              to="/strategy"
              className={(props) =>
                props.isActive ? 'underline ml-[10px]' : 'ml-[10px]'
              }
            >
              Strategy
            </NavLink>
            <NavLink
              to="/cache"
              className={(props) =>
                props.isActive ? 'underline ml-[10px]' : 'ml-[10px]'
              }
            >
              Cache
            </NavLink>
          </aside>
        </nav>
        <Router />
      </div>
    </BrowserRouter>
  )
}

export default App
