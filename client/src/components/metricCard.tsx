import classNames from 'classnames'
import React from 'react'

interface MetricCardProps {
  header: string
  metric: string | number

  symbol?: string
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'gray'
}

export function MetricCard({
  header,
  metric,
  symbol,
  color = 'blue'
}: MetricCardProps) {
  return (
    <div
      className={classNames(
        `flex-grow border p-[20px] rounded-[5px] mx-[5px]`,
        {
          'border-red-500 bg-red-400': color === 'red',
          'border-green-500 bg-green-400': color === 'green',
          'border-blue-500 bg-blue-400': color === 'blue',
          'border-yellow-500 bg-yellow-400': color === 'yellow',
          'border-gray-500 bg-gray-400': color === 'gray'
        }
      )}
    >
      <h4 className={`mb-[10px]`}>{header}</h4>
      <h5 className={`text-[32px] font-bold`}>{metric}</h5>
      {symbol && <p className="mt-[10px] text-black opacity-30">{symbol}</p>}
    </div>
  )
}
