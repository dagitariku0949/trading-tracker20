import React, { useState, useEffect } from 'react'

export default function MonthlyCalendar({ trades }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthlyData, setMonthlyData] = useState({})

  useEffect(() => {
    processMonthlyData()
  }, [trades, currentDate])

  const processMonthlyData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get all days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    
    // Process trades for this month
    const dailyPnL = {}
    const closedTrades = trades.filter(t => t.status === 'CLOSED')
    
    closedTrades.forEach(trade => {
      // Use exit_date for closed trades, or entry_date as fallback
      const tradeDate = new Date(trade.exit_date || trade.entry_date)
      if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
        const day = tradeDate.getDate()
        if (!dailyPnL[day]) {
          dailyPnL[day] = { pnl: 0, trades: 0 }
        }
        dailyPnL[day].pnl += parseFloat(trade.pnl) || 0
        dailyPnL[day].trades += 1
      }
    })

    setMonthlyData({ daysInMonth, firstDay, dailyPnL })
  }

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getWeeklyTotal = (weekStart) => {
    let total = 0
    for (let i = 0; i < 7; i++) {
      const day = weekStart + i
      if (monthlyData.dailyPnL[day]) {
        total += monthlyData.dailyPnL[day].pnl
      }
    }
    return total
  }

  const getMonthlyTotal = () => {
    return Object.values(monthlyData.dailyPnL || {}).reduce((sum, day) => sum + day.pnl, 0)
  }

  const getTotalTrades = () => {
    return Object.values(monthlyData.dailyPnL || {}).reduce((sum, day) => sum + day.trades, 0)
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Build calendar grid
  const calendarDays = []
  const { daysInMonth, firstDay, dailyPnL } = monthlyData

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ isEmpty: true, key: `empty-${i}` })
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      data: dailyPnL[day],
      key: `day-${day}`
    })
  }

  // Calculate weeks
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  const monthlyTotal = getMonthlyTotal()
  const totalTrades = getTotalTrades()

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
          >
            Today
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
          >
            ← Prev
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-8 gap-2">
        {/* Day headers */}
        <div className="col-span-7 grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm text-slate-400 font-semibold py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-slate-400 font-semibold py-2">
          Week
        </div>

        {/* Calendar weeks */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {/* Days in week */}
            <div className="col-span-7 grid grid-cols-7 gap-2">
              {week.map((dayObj) => {
                if (dayObj.isEmpty) {
                  return <div key={dayObj.key} className="aspect-square" />
                }

                const { day, data } = dayObj
                const isToday = 
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear()

                const pnl = data?.pnl || 0
                const tradesCount = data?.trades || 0
                
                let bgColor = 'bg-slate-700/30'
                let textColor = 'text-slate-400'
                
                if (pnl > 0) {
                  const intensity = Math.min(Math.abs(pnl) / 1000, 1)
                  bgColor = `bg-emerald-900/${Math.round(30 + intensity * 50)}`
                  textColor = 'text-emerald-400'
                } else if (pnl < 0) {
                  const intensity = Math.min(Math.abs(pnl) / 1000, 1)
                  bgColor = `bg-red-900/${Math.round(30 + intensity * 50)}`
                  textColor = 'text-red-400'
                }

                return (
                  <div
                    key={dayObj.key}
                    className={`aspect-square ${bgColor} rounded border ${
                      isToday ? 'border-blue-500 border-2' : 'border-slate-600'
                    } p-2 flex flex-col justify-between hover:border-slate-400 transition cursor-pointer`}
                  >
                    <div className="text-xs text-slate-300">{day}</div>
                    {data && (
                      <div className="text-center">
                        <div className={`text-sm font-bold ${textColor}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-500">{tradesCount} trade{tradesCount !== 1 ? 's' : ''}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Weekly summary */}
            <div className="flex items-center justify-center">
              {(() => {
                const weekStart = week.find(d => !d.isEmpty)?.day || 1
                const weekTotal = getWeeklyTotal(weekStart)
                return (
                  <div className={`text-center p-2 rounded ${
                    weekTotal >= 0 ? 'bg-emerald-900/30' : 'bg-red-900/30'
                  }`}>
                    <div className="text-xs text-slate-400">Week {weekIndex + 1}</div>
                    <div className={`text-sm font-bold ${
                      weekTotal >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {weekTotal >= 0 ? '+' : ''}${weekTotal.toFixed(0)}
                    </div>
                  </div>
                )
              })()}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Monthly Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-sm text-slate-400 mb-1">Monthly P&L</div>
            <div className={`text-3xl font-bold ${
              monthlyTotal >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {monthlyTotal >= 0 ? '+' : ''}${monthlyTotal.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Total Trades</div>
            <div className="text-3xl font-bold text-blue-400">
              {totalTrades}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Avg Per Trade</div>
            <div className={`text-3xl font-bold ${
              monthlyTotal >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              ${totalTrades > 0 ? (monthlyTotal / totalTrades).toFixed(0) : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
