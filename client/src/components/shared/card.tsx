import React from 'react'

interface ICardParams {
  children: React.ReactNode
}

export function Card(params: ICardParams) {
  return (
    <section className="mb-[20px] bg-[#333] shadow-md border border-stone-700 p-[20px] rounded-[5px] text-white">
      {params.children}
    </section>
  )
}
