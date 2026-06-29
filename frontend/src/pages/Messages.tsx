import { useState, useEffect, useRef } from 'react'
import { Card, List, Avatar, Badge, Input, Button, Empty, Spin, message, Typography } from 'antd'
import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'
import { Conversation, Message } from '../types'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Text } = Typography

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const response = await apiService.getConversations() as any
      setConversations(response.data || [])
    } catch (error: any) {
      message.error(error.message || '加载会话列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (otherUserId: number) => {
    setMessagesLoading(true)
    try {
      const response = await apiService.getMessages(otherUserId) as any
      setMessages(response.data || [])
    } catch (error: any) {
      message.error(error.message || '加载消息失败')
    } finally {
      setMessagesLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    await loadMessages(conversation.other_user_id)
    window.dispatchEvent(new CustomEvent('refreshUnreadCount'))
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageContent.trim()) {
      return
    }

    try {
      await apiService.sendMessage(selectedConversation.other_user_id, messageContent.trim())
      setMessageContent('')
      loadMessages(selectedConversation.other_user_id)
      loadConversations()
    } catch (error: any) {
      message.error(error.message || '发送失败')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 150px)' }}>
      <Card 
        title="会话列表" 
        style={{ width: 300 }}
        styles={{ body: { padding: 0, height: 'calc(100% - 57px)', overflow: 'hidden' } }}
      >
        <Spin spinning={loading}>
          {conversations.length === 0 ? (
            <Empty description="暂无会话" style={{ marginTop: 50 }} />
          ) : (
            <List
              dataSource={conversations}
              style={{ height: '100%', overflow: 'auto' }}
              renderItem={(conversation) => (
                <List.Item
                  onClick={() => handleSelectConversation(conversation)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.other_user_id === conversation.other_user_id ? '#e6f7ff' : 'transparent',
                    padding: '12px 16px'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={conversation.unread_count > 0} offset={[-5, 5]}>
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={conversation.other_user_name}
                    description={
                      <div>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: 12,
                          color: '#666'
                        }}>
                          {conversation.last_message}
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(conversation.last_message_time).format('MM-DD HH:mm')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>

      <Card 
        title={selectedConversation ? `与 ${selectedConversation.other_user_name} 的对话` : '请选择会话'}
        style={{ flex: 1 }}
        styles={{ 
          body: { 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100% - 57px)',
            padding: 0
          }
        }}
      >
        {!selectedConversation ? (
          <Empty description="请从左侧选择一个会话" style={{ margin: 'auto' }} />
        ) : (
          <>
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '16px',
              backgroundColor: '#f5f5f5'
            }}>
              <Spin spinning={messagesLoading}>
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender_id === selectedConversation.other_user_id ? 'flex-start' : 'flex-end',
                      marginBottom: 16
                    }}
                  >
                    <div style={{
                      maxWidth: '60%',
                      display: 'flex',
                      flexDirection: msg.sender_id === selectedConversation.other_user_id ? 'row' : 'row-reverse'
                    }}>
                      <Avatar 
                        icon={<UserOutlined />}
                        style={{ 
                          margin: msg.sender_id === selectedConversation.other_user_id ? '0 8px 0 0' : '0 0 0 8px'
                        }}
                      />
                      <div>
                        <div style={{
                          backgroundColor: msg.sender_id === selectedConversation.other_user_id ? '#fff' : '#1890ff',
                          color: msg.sender_id === selectedConversation.other_user_id ? '#000' : '#fff',
                          padding: '8px 12px',
                          borderRadius: 8,
                          wordBreak: 'break-word'
                        }}>
                          {msg.content}
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(msg.created_at).format('MM-DD HH:mm')}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </Spin>
            </div>

            <div style={{ 
              padding: '16px', 
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <TextArea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息... (Enter发送, Shift+Enter换行)"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ flex: 1 }}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim()}
                >
                  发送
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default Messages
