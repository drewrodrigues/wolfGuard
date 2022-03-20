import React from 'react'

interface MetricCardProps {
  header: string
  metric: string | number

  symbol?: string
  color?: 'red' | 'green' | 'blue'
}

export function MetricCard({
  header,
  metric,
  symbol,
  color = 'blue'
}: MetricCardProps) {
  return (
    <div
      className={`flex-grow border border-${color}-500 p-[20px] rounded-[5px] mx-[5px] bg-${color}-400`}
    >
      <h4 className={`mb-[10px]`}>{header}</h4>
      <h5 className={`text-[32px] font-bold mb-[10px]`}>{metric}</h5>
      {symbol && <p className={`text-${color}-500`}>{symbol}</p>}
    </div>
  )
}
