import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from '../components/auth';
import { useAuth } from '../contexts';
import { FullPageLoader } from '../components/common';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0e1621] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-[#17212b]">
            <img src="/TGM.jpg" alt="Save TG" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-white">Save TG</h1>
          <p className="text-gray-400 mt-2">
            {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#17212b] rounded-xl p-6 shadow-xl">
          {isLoginMode ? (
            <LoginForm onSwitchToRegister={() => setIsLoginMode(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Download and save media from your Telegram chats
        </p>
      </div>
    </div>
  );
}
