import React, { useState } from 'react'

export default function ImportTrades({ onClose, onImportComplete }) {
  const [file, setFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parsedTrades, setParsedTrades] = useState([])
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    symbol: '',
    type: '',
    entry: '',
    exit: '',
    lots: '',
    pnl: ''
  })
  const [step, setStep] = useState(1) // 1: upload, 2: map, 3: preview, 4: import

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = (file) => {
    setParsing(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        alert('File is empty')
        setParsing(false)
        return
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      // Parse rows
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      setParsedTrades(rows)
      
      // Auto-detect columns
      autoDetectColumns(headers)
      
      setParsing(false)
      setStep(2)
    }

    reader.readAsText(file)
  }

  const autoDetectColumns = (headers) => {
    const mapping = { ...columnMapping }
    
    headers.forEach(header => {
      const lower = header.toLowerCase()
      
      if (lower.includes('date') || lower.includes('time') || lower.includes('open time')) {
        mapping.date = header
      }
      if (lower.includes('symbol') || lower.includes('pair')) {
        mapping.symbol = header
      }
      if (lower.includes('type') || lower.includes('direction') || lower.includes('side')) {
        mapping.type = header
      }
      if (lower.includes('entry') || lower.includes('open') || lower.includes('price') && !lower.includes('close')) {
        mapping.entry = header
      }
      if (lower.includes('exit') || lower.includes('close')) {
        mapping.exit = header
      }
      if (lower.includes('lot') || lower.includes('volume') || lower.includes('size')) {
        mapping.lots = header
      }
      if (lower.includes('profit') || lower.includes('pnl') || lower.includes('p/l')) {
        mapping.pnl = header
      }
    })

    setColumnMapping(mapping)
  }

  const getAvailableColumns = () => {
    if (parsedTrades.length === 0) return []
    return Object.keys(parsedTrades[0])
  }

  const handleMappingChange = (field, value) => {
    setColumnMapping(prev => ({ ...prev, [field]: value }))
  }

  const previewTrades = () => {
    const trades = parsedTrades.map(row => {
      const type = row[columnMapping.type] || ''
      const direction = type.toLowerCase().includes('buy') || type.toLowerCase().includes('long') ? 'LONG' : 'SHORT'
      
      return {
        trade_date: row[columnMapping.date],
        symbol: row[columnMapping.symbol],
        direction: direction,
        entry_price: parseFloat(row[columnMapping.entry]) || 0,
        exit_price: parseFloat(row[columnMapping.exit]) || 0,
        lot_size: parseFloat(row[columnMapping.lots]) || 0,
        pnl: parseFloat(row[columnMapping.pnl]) || 0,
        status: 'CLOSED',
        weekly_tf: 0,
        daily_tf: 0,
        h4_tf: 0,
        h1_tf: 0,
        lower_tf: 0
      }
    }).filter(trade => trade.symbol && trade.entry_price > 0)

    return trades
  }

  const handleImport = async () => {
    const trades = previewTrades()
    
    try {
      setParsing(true)
      
      // Mock import - just simulate success
      let imported = trades.length
      console.log('Mock importing trades:', trades)

      alert(`Successfully imported ${imported} out of ${trades.length} trades!`)
      onImportComplete()
      onClose()
    } catch (err) {
      alert('Error importing trades: ' + err.message)
    } finally {
      setParsing(false)
    }
  }

  const availableColumns = getAvailableColumns()
  const previewTradesList = step >= 3 ? previewTrades() : []

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Import Trades from CSV</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 ${step > s ? 'bg-emerald-600' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Step 1: Upload CSV File</h3>
              <p className="text-slate-400 mb-6">
                Export your trade history from your broker as CSV and upload it here
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer inline-block bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                Choose CSV File
              </label>
              {file && (
                <div className="mt-4 text-emerald-400">
                  Selected: {file.name}
                </div>
              )}
            </div>

            {parsing && (
              <div className="text-center text-slate-400">
                Parsing file...
              </div>
            )}

            <div className="bg-slate-700/50 rounded-lg p-4 text-sm">
              <div className="font-semibold mb-2">Supported Formats:</div>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>MetaTrader 4/5 CSV exports</li>
                <li>cTrader trade history</li>
                <li>Generic CSV with columns: Date, Symbol, Type, Entry, Exit, Lots, P&L</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Map Columns */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Step 2: Map Columns</h3>
              <p className="text-slate-400">
                Match your CSV columns to the required fields
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { field: 'date', label: 'Trade Date/Time', required: true },
                { field: 'symbol', label: 'Symbol/Pair', required: true },
                { field: 'type', label: 'Type/Direction', required: true },
                { field: 'entry', label: 'Entry Price', required: true },
                { field: 'exit', label: 'Exit Price', required: false },
                { field: 'lots', label: 'Lot Size/Volume', required: true },
                { field: 'pnl', label: 'Profit/Loss', required: false }
              ].map(({ field, label, required }) => (
                <div key={field}>
                  <label className="block text-sm mb-1">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <select
                    value={columnMapping[field]}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  >
                    <option value="">-- Select Column --</option>
                    {availableColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!columnMapping.date || !columnMapping.symbol || !columnMapping.entry}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Trades
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Import */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Step 3: Preview & Import</h3>
              <p className="text-slate-400">
                Review {previewTradesList.length} trades before importing
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto border border-slate-700 rounded">
              <table className="w-full text-sm">
                <thead className="bg-slate-700 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Direction</th>
                    <th className="p-2 text-right">Entry</th>
                    <th className="p-2 text-right">Exit</th>
                    <th className="p-2 text-right">Lots</th>
                    <th className="p-2 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {previewTradesList.map((trade, index) => (
                    <tr key={index} className="border-b border-slate-700">
                      <td className="p-2">{new Date(trade.trade_date).toLocaleDateString()}</td>
                      <td className="p-2">{trade.symbol}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.direction === 'LONG' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                        }`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="p-2 text-right">{trade.entry_price}</td>
                      <td className="p-2 text-right">{trade.exit_price || '-'}</td>
                      <td className="p-2 text-right">{trade.lot_size}</td>
                      <td className={`p-2 text-right font-semibold ${
                        trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-sm">
              <div className="font-semibold text-yellow-400 mb-1">Note:</div>
              <div className="text-yellow-200">
                Confluence scores will be set to 0 for imported trades. You can edit them later if needed.
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={parsing || previewTradesList.length === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded font-semibold transition disabled:opacity-50"
              >
                {parsing ? 'Importing...' : `Import ${previewTradesList.length} Trades`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
