import { useState, useEffect } from 'react'
import { Card, Row, Col, Input, Select, Button, Tag, Empty, Spin, message } from 'antd'
import { SearchOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Item } from '../types'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

const Home = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>()
  const [status, setStatus] = useState<string>('pending')
  const [type, setType] = useState<string>()

  const categories = ['电子产品', '证件卡片', '书籍文具', '生活用品', '服装配饰', '其他']

  useEffect(() => {
    loadItems()
  }, [status, category, type])

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await apiService.getItems({
        status,
        category,
        keyword,
        type,
        limit: 20
      }) as any
      setItems(response.data.items || [])
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadItems()
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

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="搜索物品名称或描述"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="信息类型"
              value={type}
              onChange={setType}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="found">失物招领</Option>
              <Option value="lost">寻物启事</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择分类"
              value={category}
              onChange={setCategory}
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: '100%' }}
            >
              <Option value="pending">待招领</Option>
              <Option value="claimed">已招领</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {items.length === 0 ? (
          <Empty description="暂无数据" />
        ) : (
          <Row gutter={[16, 16]}>
            {items.map(item => (
              <Col span={6} key={item.id}>
                <Card
                  hoverable
                  cover={
                    item.image_url ? (
                      <img
                        alt={item.title}
                        src={item.image_url}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        height: 200, 
                        background: '#f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        暂无图片
                      </div>
                    )
                  }
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}>
                          {item.title}
                        </span>
                        <div>
                          {getTypeTag(item.type)}
                          {getStatusTag(item.status, item.type)}
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          {item.description || '暂无描述'}
                        </div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          {item.category && <Tag>{item.category}</Tag>}
                          {item.location && (
                            <span style={{ marginRight: 8 }}>
                              <EnvironmentOutlined /> {item.location}
                            </span>
                          )}
                          <span>
                            <ClockCircleOutlined /> {dayjs(item.created_at).format('YYYY-MM-DD')}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  )
}

export default Home
