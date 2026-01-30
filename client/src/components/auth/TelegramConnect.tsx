import { useState } from 'react';
import { Phone, Key, Shield, ArrowRight, Check } from 'lucide-react';
import { LoadingSpinner } from '../common';
import { useTelegram } from '../../contexts';

export function TelegramConnect() {
  const {
    authStep,
    connect,
    sendCode,
    verifyCode,
    error,
    clearError,
  } = useTelegram();

  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!apiId || !apiHash) return;
    setLoading(true);
    clearError();
    connect(apiId, apiHash);
    setLoading(false);
  };

  const handleSendCode = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    clearError();
    sendCode(phoneNumber);
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    setLoading(true);
    clearError();
    verifyCode(verificationCode, password);
    setLoading(false);
  };

  const renderStep = () => {
    switch (authStep) {
      case 'credentials':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#5288c1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-[#5288c1]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Telegram</h2>
              <p className="text-gray-400 text-sm">
                Enter your Telegram API credentials from{' '}
                <a
                  href="https://my.telegram.org/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5288c1] hover:underline"
                >
                  my.telegram.org
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">API ID</label>
              <input
                type="text"
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0e1621] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5288c1]"
                placeholder="Enter your API ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">API Hash</label>
              <input
                type="text"
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                className="w-full px-4 py-3 bg-[#0e1621] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5288c1]"
                placeholder="Enter your API Hash"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleConnect}
              disabled={loading || !apiId || !apiHash}
              className="w-full py-3 bg-[#5288c1] hover:bg-[#4a7ab0] disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="md" /> : <ArrowRight className="w-5 h-5" />}
              Connect
            </button>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#5288c1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#5288c1]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Phone Verification</h2>
              <p className="text-gray-400 text-sm">Enter your phone number with country code</p>
            </div>

            <div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-[#0e1621] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5288c1]"
                placeholder="+1234567890"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSendCode}
              disabled={loading || !phoneNumber}
              className="w-full py-3 bg-[#5288c1] hover:bg-[#4a7ab0] disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="md" /> : <ArrowRight className="w-5 h-5" />}
              Send Code
            </button>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Enter Code</h2>
              <p className="text-gray-400 text-sm">Enter the code sent to your Telegram</p>
            </div>

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 bg-[#0e1621] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5288c1] text-center text-2xl tracking-widest"
                placeholder="12345"
                maxLength={5}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleVerifyCode}
              disabled={loading || !verificationCode}
              className="w-full py-3 bg-[#5288c1] hover:bg-[#4a7ab0] disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="md" /> : <ArrowRight className="w-5 h-5" />}
              Verify
            </button>
          </div>
        );

      case '2fa':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Two-Factor Authentication</h2>
              <p className="text-gray-400 text-sm">Enter your 2FA password</p>
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0e1621] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5288c1]"
                placeholder="Enter 2FA password"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={() => verifyCode(verificationCode, password)}
              disabled={loading || !password}
              className="w-full py-3 bg-[#5288c1] hover:bg-[#4a7ab0] disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="md" /> : <ArrowRight className="w-5 h-5" />}
              Verify
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#17212b] rounded-xl">
      {renderStep()}
    </div>
  );
}
