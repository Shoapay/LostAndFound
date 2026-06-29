import { useState } from 'react'
import { Form, Input, Select, Button, Upload, message, Card, Radio } from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { UploadFile } from 'antd/es/upload/interface'

const { TextArea } = Input
const { Option } = Select
const { Dragger } = Upload

const PublishItem = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const categories = ['电子产品', '证件卡片', '书籍文具', '生活用品', '服装配饰', '其他']

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('type', values.type || 'found')
      formData.append('description', values.description || '')
      formData.append('category', values.category || '')
      formData.append('location', values.location || '')

      if (fileList.length > 0) {
        const file = fileList[0].originFileObj || fileList[0] as any
        if (file instanceof File) {
          formData.append('image', file)
        }
      }

      await apiService.createItem(formData)
      message.success('发布成功')
      navigate('/my-items')
    } catch (error: any) {
      message.error(error.message || '发布失败')
    }
  }

  const uploadProps = {
    onRemove: () => {
      setFileList([])
    },
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片')
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB')
        return false
      }
      setFileList([file as any])
      return false
    },
    fileList,
    maxCount: 1
  }

  return (
    <Card title="发布信息">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: 'found' }}
      >
        <Form.Item
          name="type"
          label="信息类型"
          rules={[{ required: true, message: '请选择信息类型' }]}
        >
          <Radio.Group>
            <Radio.Button value="found">失物招领</Radio.Button>
            <Radio.Button value="lost">寻物启事</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="title"
          label="物品名称"
          rules={[{ required: true, message: '请输入物品名称' }]}
        >
          <Input placeholder="请输入物品名称" size="large" />
        </Form.Item>

        <Form.Item
          name="category"
          label="物品分类"
        >
          <Select placeholder="请选择分类" size="large" allowClear>
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="location"
          label="丢失/捡到地点"
        >
          <Input placeholder="请输入地点" size="large" />
        </Form.Item>

        <Form.Item
          name="description"
          label="详细描述"
        >
          <TextArea 
            rows={4} 
            placeholder="请详细描述物品特征、丢失时间等信息"
          />
        </Form.Item>

        <Form.Item
          label="物品照片"
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 JPG、PNG 格式，单张图片不超过 5MB
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            发布
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default PublishItem
