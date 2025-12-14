import React, { useState, useEffect } from 'react'

export default function TradeForm({ trade, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    symbol: '',
    direction: 'LONG',
    entry_price: '',
    exit_price: '',
    lot_size: '',
    status: 'OPEN', // Add explicit status field
    weekly_tf: 0,
    daily_tf: 0,
    h4_tf: 0,
    h1_tf: 0,
    lower_tf: 0,
    stop_loss: '',
    take_profit: '',
    risk_reward: '',
    notes: '',
    screenshot: ''
  })
  const [screenshotPreview, setScreenshotPreview] = useState('')

  useEffect(() => {
    if (trade) {
      setFormData({
        symbol: trade.symbol || '',
        // Map API type back to direction for form display
        direction: trade.type === 'SELL' ? 'SHORT' : 'LONG',
        entry_price: trade.entry_price || '',
        exit_price: trade.exit_price || '',
        // Map API quantity back to lot_size for form display
        lot_size: trade.quantity || trade.lot_size || '',
        status: trade.status || 'OPEN', // Include status from trade
        weekly_tf: trade.weekly_tf || 0,
        daily_tf: trade.daily_tf || 0,
        h4_tf: trade.h4_tf || 0,
        h1_tf: trade.h1_tf || 0,
        lower_tf: trade.lower_tf || 0,
        stop_loss: trade.stop_loss || '',
        take_profit: trade.take_profit || '',
        risk_reward: trade.risk_reward || '',
        notes: trade.notes || '',
        screenshot: trade.screenshot || ''
      })
      setScreenshotPreview(trade.screenshot || '')
    }
  }, [trade])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setFormData(prev => ({ ...prev, screenshot: base64String }))
        setScreenshotPreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Map form data to API format
    const apiData = {
      ...formData,
      // Map direction to type for API compatibility
      type: formData.direction === 'LONG' ? 'BUY' : 'SELL',
      // Map lot_size to quantity for API compatibility
      quantity: parseFloat(formData.lot_size) || 0,
      // Use explicit status from form, but auto-set to CLOSED if exit_price is provided
      status: formData.status || ((formData.exit_price && formData.exit_price.trim() !== '') ? 'CLOSED' : 'OPEN'),
      // Ensure prices are numbers
      entry_price: parseFloat(formData.entry_price) || 0,
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      // Add current date if not editing
      entry_date: trade ? formData.entry_date : new Date().toISOString().split('T')[0],
      exit_date: formData.exit_price ? (trade?.exit_date || new Date().toISOString().split('T')[0]) : null,
      // Calculate total confluence
      total_confluence: totalConfluence
    }
    
    console.log('TradeForm submitting data:', apiData)
    onSubmit(apiData)
  }

  const totalConfluence = Math.round(
    (parseInt(formData.weekly_tf) + parseInt(formData.daily_tf) + 
     parseInt(formData.h4_tf) + parseInt(formData.h1_tf) + parseInt(formData.lower_tf)) / 5
  )

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{trade ? 'Edit Trade' : 'New Trade'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                required
                placeholder="EURUSD, XAUUSD, etc."
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Direction</label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Entry Price</label>
              <input
                type="number"
                step="0.00001"
                name="entry_price"
                value={formData.entry_price}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Exit Price (optional)</label>
              <input
                type="number"
                step="0.00001"
                name="exit_price"
                value={formData.exit_price}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Lot Size</label>
              <input
                type="number"
                step="0.01"
                name="lot_size"
                value={formData.lot_size}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Risk:Reward</label>
              <input
                type="number"
                step="0.1"
                name="risk_reward"
                value={formData.risk_reward}
                onChange={handleChange}
                placeholder="e.g., 3.0"
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">
              Confluence Analysis 
              <span className={`ml-3 ${totalConfluence >= 70 ? 'text-emerald-400' : totalConfluence >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                (Total: {totalConfluence}%)
              </span>
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { name: 'weekly_tf', label: 'Weekly' },
                { name: 'daily_tf', label: 'Daily' },
                { name: 'h4_tf', label: '4H' },
                { name: 'h1_tf', label: '1H' },
                { name: 'lower_tf', label: 'Lower TF' }
              ].map(tf => (
                <div key={tf.name}>
                  <label className="block text-xs mb-1">{tf.label}</label>
                  <input
                    type="number"
                    name={tf.name}
                    min="0"
                    max="100"
                    value={formData[tf.name]}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Trade setup, reasons, lessons learned, etc."
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">📸 Trade Screenshot (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            {screenshotPreview && (
              <div className="mt-3">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full max-h-64 object-contain rounded border border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, screenshot: '' }))
                    setScreenshotPreview('')
                  }}
                  className="mt-2 text-sm text-red-400 hover:text-red-300"
                >
                  Remove Screenshot
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded font-semibold transition"
            >
              {trade ? 'Update Trade' : 'Create Trade'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
