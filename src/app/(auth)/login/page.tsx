import React from 'react';
import { LoginScreen } from '../../../components/LoginScreen';

export default function LoginPage() {
  const handleLoginSuccess = (_username: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
