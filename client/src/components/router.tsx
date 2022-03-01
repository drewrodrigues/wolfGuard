import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Bars } from './bars'
import { BarsCache } from './barsCache'
import { Strategy } from './strategy'
import { SymbolsList } from './symbolsList'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<SymbolsList />} />
      <Route path="/bars/:symbol" element={<Bars />} />
      <Route path="/strategy" element={<Strategy />} />
      <Route path="/cache" element={<BarsCache />} />
    </Routes>
  )
}
