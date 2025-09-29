'use client'

interface MinutesFilmLogEntry {
  id?: string
  created_at: string
  modified_by: string
  role: string
  member: string
  modification: number
  description: string
}

interface MinutesFilmLogTableProps {
  entries: MinutesFilmLogEntry[]
}

export function MinutesFilmLogTable({ entries }: MinutesFilmLogTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table className="min-w-full border-collapse border border-gray-300 text-sm bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-3 py-2 text-left">Timestamp</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Modified By</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Role</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Modification</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {entries?.map((entry, index) => (
            <tr key={entry.id || index} className="odd:bg-white even:bg-gray-50">
              <td className="border border-gray-200 px-3 py-2">
                {new Date(entry.created_at).toLocaleString()}
              </td>
              <td className="border border-gray-200 px-3 py-2">{entry.modified_by}</td>
              <td className="border border-gray-200 px-3 py-2">{entry.role}</td>
              <td className="border border-gray-200 px-3 py-2">{entry.modification}</td>
              <td className="border border-gray-200 px-3 py-2">{entry.description}</td>
            </tr>
          ))}
          {(!entries || entries.length === 0) && (
            <tr>
              <td className="px-3 py-4 text-gray-500 text-center" colSpan={6}>
                No log entries found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}