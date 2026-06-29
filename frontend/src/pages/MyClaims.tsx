import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Claim } from '../types'
import dayjs from 'dayjs'

const MyClaims = () => {
  const navigate = useNavigate()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    setLoading(true)
    try {
      const response = await apiService.getMyClaims() as any
      setClaims(response.data || [])
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' }
    }
    const { color, text } = statusMap[status] || { color: 'default', text: status }
    return <Tag color={color}>{text}</Tag>
  }

  const columns = [
    {
      title: '物品名称',
      dataIndex: 'title',
      key: 'title',
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
      title: '发布者',
      dataIndex: 'owner_name',
      key: 'owner_name',
    },
    {
      title: '申请状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Claim) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/items/${record.item_id}`)}
          >
            查看物品
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Card title="我的申请">
      <Table
        columns={columns}
        dataSource={claims}
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

export default MyClaims
