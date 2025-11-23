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
  const { messages, sendMessage, setTyping, typingUsers, isConnected } = useGunChat(chatSlug)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">{buildingAddress}</h2>
        <p className="text-xs text-gray-500 mt-1">
          Decentralized P2P organizing chat • Real-time updates • No login required
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          typingUsers={typingUsers}
          isConnected={isConnected}
        />
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={sendMessage}
        onSetTyping={setTyping}
        isConnected={isConnected}
      />
    </div>
  );
}
