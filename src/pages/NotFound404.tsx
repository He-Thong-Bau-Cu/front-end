import React from 'react';
import { Button, Typography } from 'antd';
import { HomeOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function NotFound404() {
  const handleGoHome = () => {
    console.log('Navigating to home...');
    const role = localStorage.getItem('role') || '';
    switch (role) {
      case 'ADMIN':
        window.location.href = '/admin';
        break;
      case 'PRESIDE':
        window.location.href = '/preside';
        break;
      default:
        window.location.href = '/home';
    }
    // window.location.href = '/';
  };

  const handleGoBack = () => {
    console.log('Going back...');
    window.history.back();
  };

  // Reset body styles
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
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
      overflow: 'hidden'
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
          boxShadow: '0 10px 30px rgba(124, 179, 66, 0.3)'
        }}>
          <SearchOutlined style={{ fontSize: '60px', color: 'white' }} />
        </div>

        {/* 404 Number */}
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
          404
        </div>

        {/* Title */}
        <Title level={2} style={{
          color: '#333',
          marginBottom: '16px',
          fontWeight: 'bold'
        }}>
          Không tìm thấy trang
        </Title>

        {/* Description */}
        <Text style={{
          color: '#666',
          fontSize: '16px',
          display: 'block',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.<br />
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
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
            icon={<HomeOutlined />}
            onClick={handleGoHome}
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
              borderColor: '#7cb342',
              color: '#7cb342'
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
              liên hệ với chúng tôi
            </a>
          </Text>
        </div>
      </div>
    </div>
  );
}
