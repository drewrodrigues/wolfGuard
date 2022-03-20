import React from 'react'
import { BrowserRouter, Link, NavLink } from 'react-router-dom'
import { Router } from './components/router'

const ROUTES = [
  {
    title: 'Symbols',
    path: '/'
  },
  {
    title: 'Predictions',
    path: '/predictions'
  },
  {
    title: 'Strategy',
    path: '/strategy'
  },
  { title: 'Cache', path: '/cache' },
  { title: 'History', path: '/history' },
  { title: 'Trader', path: '/trader' }
]

function App() {
  return (
    <BrowserRouter>
      <div className="mx-[20px]">
        <nav className="flex justify-between items-center py-[20px] text-white">
          <Link to="/" className="font-bold">
            Wolf Guard
          </Link>

          <aside className="text-[14px]">
            {ROUTES.map((route) => (
              <NavLink
                to={route.path}
                className={(props) =>
                  props.isActive ? 'ml-[10px] underline' : 'ml-[10px]'
                }
              >
                {route.title}
              </NavLink>
            ))}
          </aside>
        </nav>

        <Router />
      </div>
    </BrowserRouter>
  )
}

export default App
