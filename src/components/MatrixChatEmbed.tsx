'use client'

interface MatrixChatEmbedProps {
  roomId: string;
  alias: string;
  buildingAddress: string;
}

export function MatrixChatEmbed({ roomId, alias, buildingAddress }: MatrixChatEmbedProps) {
  // Encode the alias for use in URL
  const encodedAlias = encodeURIComponent(alias);
  const embedUrl = `https://app.element.io/#/room/${encodedAlias}?embed=1`;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{buildingAddress}</h2>
        <p className="text-xs text-gray-500 mt-1">
          Organizing chat room • <a href={`https://app.element.io/#/room/${encodedAlias}`} target="_blank" rel="noopener noreferrer" className="text-rstu-red hover:underline">Open in Element</a>
        </p>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          className="w-full h-full"
          title={`Matrix chat for ${buildingAddress}`}
        />
      </div>
    </div>
  );
}
