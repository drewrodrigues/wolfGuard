import React, { useEffect } from 'react'
import { MetricCard } from '../components/metricCard'
import { useRequest } from '../hooks/request'

export function PredictionsView() {
  const barsQuery = useRequest<{ symbol: string; count: number }[]>()

  useEffect(() => {
    barsQuery.call('/symbols?type=1 D&withCount=true')
  }, [])

  return (
    <>
      <h2 className="text-white font-bold mb-[10px] text-[32px]">Analytics</h2>
      <h3 className="text-white font-bold mb-[10px]">Upcoming</h3>
      <div className="flex mb-[20px] text-white mx-[-5px]">
        <MetricCard
          header="Most Positive Mentions Today"
          metric={72}
          symbol="MSFT"
          color="green"
        />

        <MetricCard
          header="Most Negative Mentions Today"
          metric={50}
          symbol="SNAP"
          color="red"
        />
      </div>

      <h3 className="text-white font-bold mb-[10px]">Historic</h3>
      <div className="flex mb-[20px] text-white mx-[-5px]">
        <MetricCard
          header="Largest Positive Gap"
          metric="15%"
          symbol="TSLA"
          color="blue"
        />

        <MetricCard
          header="Largest Day Open to Close"
          metric="7.25%"
          symbol="NSAL"
          color="blue"
        />
      </div>

      <h3 className="text-white font-bold mb-[10px]">Performance</h3>
      <div className="flex mb-[20px] text-white mx-[-5px]">
        <MetricCard header="Bar Count" metric="7.25%" color="yellow" />
        <MetricCard header="Bar Count" metric="90238" color="yellow" />
        <MetricCard header="News Count" metric="0" color="yellow" />
      </div>

      <h3 className="text-white font-bold mb-[10px]">Platform</h3>
      <div className="flex mb-[20px] text-white mx-[-5px]">
        <MetricCard header="Bar Count" metric="7.25%" color="gray" />
        <MetricCard header="Bar Count" metric="90238" color="gray" />
        <MetricCard header="News Count" metric="0" color="gray" />
      </div>

      <h2 className="text-white font-bold mb-[10px]">Data</h2>
      {barsQuery.requestStatus === 'success' && (
        <ul className="flex flex-wrap mr-[-5px]">
          {barsQuery.data.map((data) => (
            <div className="shadow-md rounded-[3px] mb-[5px] mr-[5px] p-[10px] border-collapse flex justify-between items-center bg-[#333] text-white border border-stone-700 w-[125px] flex-grow">
              <span>{data.symbol}</span>
              <span className="text-[12px]">{data.count}</span>
            </div>
          ))}
        </ul>
      )}
    </>
  )
}
