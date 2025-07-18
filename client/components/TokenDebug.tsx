'use client';
import { useEffect, useState } from 'react';
import { Card, Text, Button, Group, Badge } from '@mantine/core';
import { IconKey, IconRefresh } from '@tabler/icons-react';

export default function TokenDebug() {
  const [tokenInfo, setTokenInfo] = useState<any>({});

  const checkToken = () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    setTokenInfo({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) || 'N/A',
      user: user ? JSON.parse(user) : null,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    checkToken();
  }, []);

  const testToken = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('No token found in localStorage');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Token is valid! API call successful.');
      } else {
        alert(`❌ Token validation failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      alert(`❌ Token test error: ${error.message}`);
    }
  };

  return (
    <Card p="md" withBorder>
      <Group mb="md">
        <IconKey size={20} />
        <Text fw={600}>Token Debug</Text>
        <Button size="xs" onClick={checkToken} leftSection={<IconRefresh size={12} />}>
          Refresh
        </Button>
      </Group>

      <div className="space-y-2 text-sm">
        <Text><strong>Has Token:</strong> <Badge color={tokenInfo.hasToken ? "green" : "red"}>{tokenInfo.hasToken ? "Yes" : "No"}</Badge></Text>
        <Text><strong>Token Length:</strong> {tokenInfo.tokenLength}</Text>
        <Text><strong>Token Start:</strong> {tokenInfo.tokenStart}...</Text>
        <Text><strong>User Role:</strong> {tokenInfo.user?.role || 'N/A'}</Text>
        <Text><strong>User Email:</strong> {tokenInfo.user?.email || 'N/A'}</Text>
        <Text><strong>Last Check:</strong> {tokenInfo.timestamp}</Text>
      </div>

      <Button 
        onClick={testToken} 
        mt="md" 
        size="sm"
        disabled={!tokenInfo.hasToken}
      >
        Test Token with API
      </Button>
    </Card>
  );
} 