import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Bars } from './bars'
import { CacheView } from '../views/cacheView'
import { StrategyView } from '../views/strategyView'
import { SymbolsList } from '../views/symbolsView'
import { TraderView } from '../views/traderView'
import { HistoryView } from '../views/historyView'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<SymbolsList />} />
      <Route path="/bars/:symbol" element={<Bars />} />
      <Route path="/strategy" element={<StrategyView />} />
      <Route path="/cache" element={<CacheView />} />
      <Route path="/history" element={<HistoryView />} />
      <Route path="/trader" element={<TraderView />} />
    </Routes>
  )
}
