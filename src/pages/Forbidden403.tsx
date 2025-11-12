import React from 'react';
import { Button, Typography } from 'antd';
import { HomeOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Forbidden403() {
  const handleGoHome = () => {
    console.log('Navigating to home...');
    window.location.href = '/';
  };

  const handleLogin = () => {
    console.log('Navigating to login...');
    window.location.href = '/login';
  };

  const handleGoBack = () => {
    console.log('Going back...');
    window.history.back();
  };

  // Reset body styles
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      margin: 0,
      overflow: 'auto'
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        top: '-100px',
        left: '-100px',
        backdropFilter: 'blur(10px)'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        bottom: '-150px',
        right: '-150px',
        backdropFilter: 'blur(10px)'
      }} />

      <div style={{
        maxWidth: '700px',
        width: '100%',
        background: 'white',
        borderRadius: '24px',
        padding: '80px 60px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Icon */}
        <div style={{
          width: '140px',
          height: '140px',
          background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          boxShadow: '0 10px 30px rgba(124, 179, 66, 0.3)',
          position: 'relative'
        }}>
          <LockOutlined style={{ fontSize: '60px', color: 'white' }} />
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '4px',
            background: 'white',
            transform: 'rotate(-45deg)',
            borderRadius: '2px'
          }} />
        </div>

        {/* 403 Number */}
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1',
          marginBottom: '20px',
          letterSpacing: '5px'
        }}>
          403
        </div>

        {/* Title */}
        <Title level={2} style={{
          color: '#333',
          marginBottom: '16px',
          fontWeight: 'bold'
        }}>
          Truy cập bị từ chối
        </Title>

        {/* Description */}
        <Text style={{
          color: '#666',
          fontSize: '16px',
          display: 'block',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Xin lỗi, bạn không có quyền truy cập vào trang này.<br />
          Vui lòng đăng nhập với tài khoản có đủ quyền hoặc liên hệ quản trị viên.
        </Text>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            style={{
              background: '#7cb342',
              borderColor: '#7cb342',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: '500',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(124, 179, 66, 0.3)'
            }}
          >
            Đăng nhập
          </Button>
          <Button
            size="large"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
            style={{
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: '500',
              borderRadius: '8px',
              borderColor: '#7cb342',
              color: '#7cb342'
            }}
          >
            Về trang chủ
          </Button>
          <Button
            size="large"
            onClick={handleGoBack}
            style={{
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: '500',
              borderRadius: '8px',
              borderColor: '#d9d9d9',
              color: '#666'
            }}
          >
            Quay lại
          </Button>
        </div>

        {/* Additional Help Text */}
        <div style={{
          marginTop: '50px',
          paddingTop: '30px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Text style={{ color: '#999', fontSize: '14px' }}>
            Nếu bạn cho rằng đây là lỗi, vui lòng{' '}
            <a href="#" style={{ color: '#7cb342', fontWeight: '500' }}>
              liên hệ quản trị viên
            </a>
          </Text>
        </div>

        {/* Possible reasons */}
        <div style={{
          marginTop: '30px',
          background: '#f9f9f9',
          padding: '24px',
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <Text strong style={{ color: '#333', fontSize: '15px', display: 'block', marginBottom: '12px' }}>
            Một số nguyên nhân có thể:
          </Text>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#666',
            lineHeight: '1.8'
          }}>
            <li>Bạn chưa đăng nhập vào hệ thống</li>
            <li>Tài khoản của bạn không có quyền truy cập trang này</li>
            <li>Phiên đăng nhập của bạn đã hết hạn</li>
            <li>Trang này yêu cầu vai trò hoặc quyền đặc biệt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
