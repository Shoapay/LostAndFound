import { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, message, Popconfirm } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Item } from '../types'
import dayjs from 'dayjs'

const MyItems = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await apiService.getMyItems() as any
      setItems(response.data || [])
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteItem(id)
      message.success('删除成功')
      loadItems()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await apiService.cancelItem(id)
      message.success('取消成功')
      loadItems()
    } catch (error: any) {
      message.error(error.message || '取消失败')
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

  const columns = [
    {
      title: '物品名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeTag(type)
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => text || '未分类'
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => text || '未填写'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Item) => getStatusTag(status, record.type)
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Item) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/items/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Popconfirm
              title="确定要取消招领吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link">
                取消招领
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="我的发布">
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条`
        }}
      />
    </Card>
  )
}

export default MyItems
