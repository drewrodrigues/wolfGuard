import React from 'react'

import { OHLCTooltip } from 'react-stockcharts/lib/tooltip'
import { ChartCanvas, Chart } from 'react-stockcharts'
import { CandlestickSeries } from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { last } from 'react-stockcharts/lib/utils'

function CandleStickChart(props: { data: any[]; type: '' }) {
  const dataMapped = props.data.map((data) => ({
    ...data,
    date: new Date(data.time)
  }))

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
    // @ts-ignore
    (d) => d.date
  )
  // @ts-ignore
  const { data, xScale, xAccessor, displayXAccessor } =
    xScaleProvider(dataMapped)

  const start = xAccessor(last(data))
  const end = xAccessor(data[Math.max(0, data.length - 150)])
  const xExtents = [start, end]

  return (
    <section className="bg-white">
      <ChartCanvas
        height={500}
        width={1000}
        margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
        type="svg"
        seriesName="MSFT"
        data={data}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xScale={xScale}
        xExtents={xExtents}
        ratio={1}
      >
        {/* @ts-ignore */}
        <Chart id={1} yExtents={(d) => [d.high, d.low]}>
          <XAxis axisAt="bottom" orient="bottom" ticks={6} />
          <YAxis axisAt="left" orient="left" ticks={5} />
          <CandlestickSeries />
          <OHLCTooltip origin={[-40, 0]} />
        </Chart>
      </ChartCanvas>
    </section>
  )
}

export default fitWidth(CandleStickChart)
