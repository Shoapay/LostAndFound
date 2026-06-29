import { useState, useEffect } from 'react'
import { Card, Descriptions, Button, Tag, Image, Modal, Input, message, Spin, Row, Col } from 'antd'
import { EnvironmentOutlined, ClockCircleOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Item } from '../types'
import dayjs from 'dayjs'

const { TextArea } = Input

interface ItemDetailProps {
  isAuthenticated: boolean
}

const ItemDetail = ({ isAuthenticated }: ItemDetailProps) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [claimModalVisible, setClaimModalVisible] = useState(false)
  const [messageModalVisible, setMessageModalVisible] = useState(false)
  const [claimMessage, setClaimMessage] = useState('')
  const [privateMessage, setPrivateMessage] = useState('')

  useEffect(() => {
    if (id) {
      loadItem()
    }
  }, [id])

  const loadItem = async () => {
    setLoading(true)
    try {
      const response = await apiService.getItemById(Number(id)) as any
      setItem(response.data)
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    try {
      await apiService.createClaim(Number(id), claimMessage)
      message.success('申请招领成功，请等待审核')
      setClaimModalVisible(false)
      setClaimMessage('')
    } catch (error: any) {
      message.error(error.message || '申请失败')
    }
  }

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    if (!privateMessage.trim()) {
      message.warning('请输入消息内容')
      return
    }

    if (!item) return

    try {
      await apiService.sendMessage(item.user_id, privateMessage.trim(), item.id)
      message.success('发送成功')
      setMessageModalVisible(false)
      setPrivateMessage('')
    } catch (error: any) {
      message.error(error.message || '发送失败')
    }
  }

  const getStatusTag = (status: string, type?: string) => {
    let statusText = status
    let color = 'default'
    
    if (status === 'pending') {
      color = 'green'
      statusText = type === 'lost' ? '待归还' : '待招领'
    } else if (status === 'claimed') {
      color = 'blue'
      statusText = type === 'lost' ? '已归还' : '已招领'
    } else if (status === 'cancelled') {
      color = 'default'
      statusText = '已取消'
    }
    
    return <Tag color={color}>{statusText}</Tag>
  }

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      found: { color: 'blue', text: '失物招领' },
      lost: { color: 'orange', text: '寻物启事' }
    }
    const { color, text } = typeMap[type] || { color: 'default', text: type }
    return <Tag color={color}>{text}</Tag>
  }

  if (loading) {
    return <Spin />
  }

  if (!item) {
    return <div>物品不存在</div>
  }

  return (
    <div>
      <Card>
        <Row gutter={24}>
          <Col span={12}>
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
              />
            ) : (
              <div style={{ 
                height: 400, 
                background: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                暂无图片
              </div>
            )}
          </Col>
          <Col span={12}>
            <Descriptions title={item.title} column={1}>
              <Descriptions.Item label="类型">
                {getTypeTag(item.type)}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(item.status, item.type)}
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                {item.category || '未分类'}
              </Descriptions.Item>
              <Descriptions.Item label="地点">
                <EnvironmentOutlined /> {item.location || '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                <ClockCircleOutlined /> {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="发布者">
                <UserOutlined /> {item.username}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {item.description || '暂无描述'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Button 
                icon={<MessageOutlined />}
                onClick={() => setMessageModalVisible(true)}
                style={{ marginRight: 8 }}
              >
                发送私信
              </Button>
              
              {item.status === 'pending' && (
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => setClaimModalVisible(true)}
                >
                  申请招领
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      <Modal
        title="申请招领"
        open={claimModalVisible}
        onOk={handleClaim}
        onCancel={() => setClaimModalVisible(false)}
        okText="提交申请"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p>请简要说明您认为这是您丢失物品的理由：</p>
          <TextArea
            rows={4}
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            placeholder="例如：物品特征、丢失时间地点等"
          />
        </div>
      </Modal>

      <Modal
        title={`发送私信给 ${item.username}`}
        open={messageModalVisible}
        onOk={handleSendMessage}
        onCancel={() => setMessageModalVisible(false)}
        okText="发送"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <TextArea
            rows={4}
            value={privateMessage}
            onChange={(e) => setPrivateMessage(e.target.value)}
            placeholder="请输入消息内容..."
          />
        </div>
      </Modal>
    </div>
  )
}

export default ItemDetail
