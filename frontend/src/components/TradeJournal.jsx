import React, { useState } from 'react'

export default function TradeJournal({ trades, onEdit }) {
  console.log('TradeJournal: Component rendered with', trades.length, 'trades');
  
  const [filter, setFilter] = useState('ALL') // ALL, WINS, LOSSES
  const [selectedTrade, setSelectedTrade] = useState(null)

  // Show all trades, not just closed ones
  const allTrades = trades || [];
  console.log('TradeJournal: Found', allTrades.length, 'total trades');
  
  const filteredTrades = allTrades.filter(trade => {
    if (filter === 'WINS') return trade.pnl > 0
    if (filter === 'LOSSES') return trade.pnl < 0
    return true
  })

  const wins = allTrades.filter(t => t.pnl > 0)
  const losses = allTrades.filter(t => t.pnl < 0)
  const totalWinPnL = wins.reduce((sum, t) => sum + t.pnl, 0)
  const totalLossPnL = losses.reduce((sum, t) => sum + t.pnl, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-1">Total Trades</div>
          <div className="text-3xl font-bold">{allTrades.length}</div>
          <div className="text-sm text-slate-500 mt-1">
            {wins.length} wins, {losses.length} losses
          </div>
        </div>
        
        <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-6">
          <div className="text-sm text-emerald-400 mb-1">Total Wins</div>
          <div className="text-3xl font-bold text-emerald-400">+${totalWinPnL.toFixed(2)}</div>
          <div className="text-sm text-emerald-500 mt-1">
            {wins.length} winning trades
          </div>
        </div>
        
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="text-sm text-red-400 mb-1">Total Losses</div>
          <div className="text-3xl font-bold text-red-400">${totalLossPnL.toFixed(2)}</div>
          <div className="text-sm text-red-500 mt-1">
            {losses.length} losing trades
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Trade Journal</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded transition ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All ({allTrades.length})
            </button>
            <button
              onClick={() => setFilter('WINS')}
              className={`px-4 py-2 rounded transition ${
                filter === 'WINS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ✅ Wins ({wins.length})
            </button>
            <button
              onClick={() => setFilter('LOSSES')}
              className={`px-4 py-2 rounded transition ${
                filter === 'LOSSES'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ❌ Losses ({losses.length})
            </button>
          </div>
        </div>

        {/* Trade Cards */}
        {allTrades.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-xl mb-2">No trades in your journal yet</div>
            <div className="text-sm">Create your first trade to start building your trading journal!</div>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No {filter.toLowerCase()} trades found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrades.map(trade => (
              <div
                key={trade.id}
                onClick={() => setSelectedTrade(trade)}
                className={`cursor-pointer rounded-lg p-4 border-2 transition hover:scale-105 ${
                  trade.pnl > 0
                    ? 'bg-emerald-900/20 border-emerald-700 hover:border-emerald-500'
                    : 'bg-red-900/20 border-red-700 hover:border-red-500'
                }`}
              >
                {/* Trade Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-lg font-bold">{trade.symbol}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(trade.exit_date || trade.entry_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                </div>

                {/* Trade Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Direction:</span>
                    <span className={`font-semibold ${
                      trade.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {trade.type === 'BUY' ? 'LONG' : 'SHORT'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry:</span>
                    <span>{trade.entry_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exit:</span>
                    <span>{trade.exit_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confluence:</span>
                    <span className={`font-semibold ${
                      trade.total_confluence >= 70 ? 'text-emerald-400' :
                      trade.total_confluence >= 40 ? 'text-yellow-400' : 'text-slate-400'
                    }`}>
                      {trade.total_confluence}%
                    </span>
                  </div>
                </div>

                {/* Screenshot Indicator */}
                {trade.screenshot && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="text-xs text-blue-400 flex items-center gap-1">
                      📸 Has Screenshot
                    </div>
                  </div>
                )}

                {/* Notes Preview */}
                {trade.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="text-xs text-slate-400 line-clamp-2">
                      {trade.notes}
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-center text-slate-500">
                  Click to view details
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onEdit={onEdit}
        />
      )}
    </div>
  )
}

function TradeDetailModal({ trade, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${
          trade.pnl > 0 ? 'border-emerald-700 bg-emerald-900/20' : 'border-red-700 bg-red-900/20'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{trade.symbol}</h2>
              <div className="text-slate-400 mt-1">
                {new Date(trade.exit_date || trade.entry_date).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
              </div>
              <div className={`text-sm mt-1 ${trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trade.pnl > 0 ? '✅ WIN' : '❌ LOSS'}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trade Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Direction</div>
              <div className={`text-lg font-bold ${
                trade.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {trade.type === 'BUY' ? 'LONG' : 'SHORT'}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Entry Price</div>
              <div className="text-lg font-bold">{trade.entry_price}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Exit Price</div>
              <div className="text-lg font-bold">{trade.exit_price}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Lot Size</div>
              <div className="text-lg font-bold">{trade.quantity || trade.lot_size}</div>
            </div>
          </div>

          {/* Confluence Breakdown */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm font-semibold mb-3">Confluence Analysis</div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Weekly', value: trade.weekly_tf },
                { label: 'Daily', value: trade.daily_tf },
                { label: '4H', value: trade.h4_tf },
                { label: '1H', value: trade.h1_tf },
                { label: 'Lower', value: trade.lower_tf }
              ].map(tf => (
                <div key={tf.label} className="text-center">
                  <div className="text-xs text-slate-400 mb-1">{tf.label}</div>
                  <div className={`text-2xl font-bold ${
                    tf.value >= 70 ? 'text-emerald-400' :
                    tf.value >= 40 ? 'text-yellow-400' : 'text-slate-400'
                  }`}>
                    {tf.value}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700 text-center">
              <span className="text-slate-400">Total Confluence: </span>
              <span className={`text-xl font-bold ${
                trade.total_confluence >= 70 ? 'text-emerald-400' :
                trade.total_confluence >= 40 ? 'text-yellow-400' : 'text-slate-400'
              }`}>
                {trade.total_confluence}%
              </span>
            </div>
          </div>

          {/* Screenshot */}
          {trade.screenshot && (
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-sm font-semibold mb-3">📸 Trade Screenshot</div>
              <img
                src={trade.screenshot}
                alt="Trade Screenshot"
                className="w-full rounded-lg border border-slate-700"
              />
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-sm font-semibold mb-3">📝 Trade Notes</div>
              <div className="text-slate-300 whitespace-pre-wrap">{trade.notes}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                onEdit(trade)
                onClose()
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
            >
              ✏️ Edit Trade
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
