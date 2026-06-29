import { Layout, Menu, Button, Badge } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  HomeOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  BellOutlined,
  LogoutOutlined,
  FileSearchOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'

const { Header, Sider, Content } = Layout

interface MainLayoutProps {
  isAuthenticated: boolean
  onLogout: () => void
}

const MainLayout = ({ isAuthenticated, onLogout }: MainLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount()
      const interval = setInterval(loadUnreadCount, 30000)
      
      const handleRefresh = () => loadUnreadCount()
      window.addEventListener('refreshUnreadCount', handleRefresh)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('refreshUnreadCount', handleRefresh)
      }
    }
  }, [isAuthenticated])

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadMessageCount() as any
      setUnreadCount(response.data?.count || 0)
    } catch (error) {
      console.error('获取未读消息数失败:', error)
    }
  }

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/publish',
      icon: <PlusOutlined />,
      label: '发布信息',
      disabled: !isAuthenticated,
    },
    {
      key: '/my-items',
      icon: <UnorderedListOutlined />,
      label: '我的发布',
      disabled: !isAuthenticated,
    },
    {
      key: '/my-claims',
      icon: <FileSearchOutlined />,
      label: '我的申请',
      disabled: !isAuthenticated,
    },
    {
      key: '/claim-management',
      icon: <BellOutlined />,
      label: '招领管理',
      disabled: !isAuthenticated,
    },
    {
      key: '/messages',
      icon: (
        <Badge dot={unreadCount > 0} offset={[5, 0]}>
          <MessageOutlined />
        </Badge>
      ),
      label: '我的私信',
      disabled: !isAuthenticated,
    },
  ]

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <div className="logo">失物招领</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {isAuthenticated ? (
            <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>
              退出登录
            </Button>
          ) : (
            <div>
              <Button type="link" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </div>
          )}
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
