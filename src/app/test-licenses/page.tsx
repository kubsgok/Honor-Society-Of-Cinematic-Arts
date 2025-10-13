"use client"

import { useState } from 'react'

export default function TestLicensesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const testAPI = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const timestamp = new Date().toLocaleTimeString()
      let output = `[${timestamp}] === Testing fetchLicenses API ===\n\n`
      
      output += `[${timestamp}] Making request to /api/fetchLicenses...\n`
      
      const response = await fetch('/api/fetchLicenses')
      
      output += `Response Status: ${response.status}\n`
      output += `Response OK: ${response.ok}\n`
      
      if (!response.ok) {
        const errorText = await response.text()
        output += `❌ API Error: ${errorText}\n`
        setResult(output)
        return
      }
      
      const data = await response.json()
      
      output += `\n=== RAW API RESPONSE ===\n`
      output += JSON.stringify(data, null, 2) + '\n'
      
      output += `\n=== RESPONSE ANALYSIS ===\n`
      output += `Has licensesData property: ${'licensesData' in data}\n`
      output += `licensesData is array: ${Array.isArray(data.licensesData)}\n`
      output += `Number of licenses: ${data.licensesData?.length || 0}\n`
      
      if (data.licensesData && data.licensesData.length > 0) {
        output += `\n=== LICENSE DETAILS ===\n`
        
        data.licensesData.forEach((license: any, index: number) => {
          output += `\n--- License ${index + 1} ---\n`
          output += `  ID: ${license.id}\n`
          output += `  Chapter ID: "${license.chapter_id}" (${typeof license.chapter_id})\n`
          output += `  Chapter Fee: $${license.chapter_fee} (paid: ${license.chapter_fee_paid})\n`
          output += `  Member Fee: $${license.member_fee} (paid: ${license.license_paid})\n`
          output += `  Nominee Fee: $${license.nominee_fee}\n`
          output += `  Startup Fee: $${license.startup_fee}\n`
          output += `  Late Fee: $${license.late_fee}\n`
          output += `  Num Licenses: ${license.num_licenses}\n`
          output += `  Created: ${license.created_at}\n`
        })
      } else {
        output += `\n⚠️  No licenses found in database!\n`
      }
      
      output += `\n✅ Test completed successfully\n`
      setResult(output)
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setResult(`❌ Test failed: ${errorMsg}`)
      console.error('Full error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">fetchLicenses API Test</h1>
          <p className="text-gray-600 mb-6">
            This page tests the /api/fetchLicenses endpoint to see what license data is available.
          </p>
          
          <div className="space-x-4 mb-6">
            <button
              onClick={testAPI}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '🔄 Testing...' : '🧪 Test fetchLicenses API'}
            </button>
            
            <button
              onClick={() => setResult('')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              🗑️ Clear Output
            </button>
          </div>
          
          {result && (
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
              <pre>{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}