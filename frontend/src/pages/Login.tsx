import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { apiService } from '../services/api'
import { LoginResponse } from '../types'

interface LoginProps {
  onLogin: (token: string) => void
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const response = await apiService.login(values.email, values.password) as any
      message.success('登录成功')
      const token = response.data.token
      onLogin(token)
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="登录" style={{ width: 400 }}>
        <Form
          form={form}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            还没有账号？ <Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
