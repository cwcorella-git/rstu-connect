'use client'

interface BuildingChatEmbedProps {
  chatSlug: string;
  buildingAddress: string;
}

export function BuildingChatEmbed({ chatSlug, buildingAddress }: BuildingChatEmbedProps) {
  // Tlk.io provides free, anonymous chat rooms
  // No login required - perfect for tenant organizing
  const chatUrl = `https://tlk.io/${chatSlug}`;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{buildingAddress}</h2>
        <p className="text-xs text-gray-500 mt-1">
          Organizing chat room • <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="text-rstu-red hover:underline">Open in new window</a>
        </p>
      </div>

      <div className="flex-1 relative">
        {/* Responsive iframe wrapper for Tlk.io */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden'
          }}
        >
          <iframe
            src={chatUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title={`Chat for ${buildingAddress}`}
            allow="clipboard-write"
          />
        </div>

        {/* Fallback message shown if iframe fails to load */}
        <noscript>
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-8">
              <p className="text-gray-700 mb-4">Chat requires JavaScript to load.</p>
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rstu-red hover:underline font-medium"
              >
                Open chat in new window →
              </a>
            </div>
          </div>
        </noscript>
      </div>
    </div>
  );
}
