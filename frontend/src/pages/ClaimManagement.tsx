import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, message, Popconfirm, Modal, Image } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'
import { Claim } from '../types'
import dayjs from 'dayjs'

const ClaimManagement = () => {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    setLoading(true)
    try {
      const response = await apiService.getClaims('pending') as any
      setClaims(response.data || [])
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (claimId: number) => {
    try {
      await apiService.approveClaim(claimId)
      message.success('已通过申请')
      loadClaims()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleReject = async (claimId: number) => {
    try {
      await apiService.rejectClaim(claimId)
      message.success('已拒绝申请')
      loadClaims()
    } catch (error: any) {
      message.error(error.message || '操作失败')
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
      title: '申请人',
      dataIndex: 'claimer_name',
      key: 'claimer_name',
    },
    {
      title: '申请说明',
      dataIndex: 'claim_message',
      key: 'claim_message',
      render: (text: string) => text || '无'
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
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确定要通过此申请吗？"
                onConfirm={() => handleApprove(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="primary" size="small" icon={<CheckOutlined />}>
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定要拒绝此申请吗？"
                onConfirm={() => handleReject(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button danger size="small" icon={<CloseOutlined />}>
                  拒绝
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Card title="招领管理">
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

export default ClaimManagement
