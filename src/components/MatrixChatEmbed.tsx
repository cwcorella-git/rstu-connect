'use client'

interface MatrixChatEmbedProps {
  roomId: string;
  alias: string;
  buildingAddress: string;
}

export function MatrixChatEmbed({ roomId, alias, buildingAddress }: MatrixChatEmbedProps) {
  // Element Web instance deployed to Netlify with custom headers for iframe embedding
  const ELEMENT_URL = 'https://rstu-element.netlify.app';

  // Encode the alias for use in URL
  const encodedAlias = encodeURIComponent(alias);
  const embedUrl = `${ELEMENT_URL}/#/room/${encodedAlias}`;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{buildingAddress}</h2>
        <p className="text-xs text-gray-500 mt-1">
          Organizing chat room • <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="text-rstu-red hover:underline">Open in Element</a>
        </p>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Element Web embedded from Netlify with guest access enabled */}
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          className="w-full h-full"
          title={`Matrix chat for ${buildingAddress}`}
        />

        {/* Fallback message shown if iframe fails to load */}
        <noscript>
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-8">
              <p className="text-gray-700 mb-4">Chat requires JavaScript to load.</p>
              <a
                href={embedUrl}
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
