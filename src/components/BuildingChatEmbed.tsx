'use client'

import { useGunChat } from '@/hooks/useGunChat'
import { MessageList } from '@/components/GunChat/MessageList'
import { MessageInput } from '@/components/GunChat/MessageInput'

interface BuildingChatEmbedProps {
  chatSlug: string;
  buildingAddress: string;
}

export function BuildingChatEmbed({ chatSlug, buildingAddress }: BuildingChatEmbedProps) {
  // Initialize Gun.js P2P chat for this building
  const { messages, sendMessage, isConnected } = useGunChat(chatSlug)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">{buildingAddress}</h2>
        <p className="text-xs text-gray-500 mt-1">
          Decentralized P2P organizing chat • No login required • Messages sync across all peers
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isConnected={isConnected} />
      </div>

      {/* Message input */}
      <MessageInput onSendMessage={sendMessage} isConnected={isConnected} />
    </div>
  );
}
