'use client'

export function MapPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center">
      <div className="w-16 h-16 mb-4 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Map Coming Soon</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Interactive 3D map of Reno with building locations and unit-level organizing status.
      </p>
      <div className="mt-6 text-xs text-gray-400">
        Features planned:
      </div>
      <ul className="mt-2 text-xs text-gray-400 space-y-1">
        <li>Building location highlighting</li>
        <li>Unit contact status visualization</li>
        <li>Meeting location selection</li>
      </ul>
    </div>
  );
}
