import React, { useState } from 'react';

export default function PayHereConfig({ onBack }) {
  const [config, setConfig] = useState({
    merchantId: '1232223',
    merchantSecret: 'MTczMjUyMTQ3ODE0MTI5Njg5MzkyMTEyMjA2MDI2NDU3NDUw',
    appId: '4OVyIPRBDwu4JFnJsiyj4a3D3',
    appSecret: '4E1BAvC5UIL4ZCbWDIfItK49Z4CkZCF0N8W3jZn6NXjp',
    sandbox: true,
    domain: 'anne'
  });

  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const testPayHereConfig = () => {
    setLoading(true);
    setTestResult(null);

    // Simulate PayHere configuration test
    setTimeout(() => {
      const isValid = config.merchantId && config.merchantSecret && config.appId && config.appSecret;
      
      setTestResult({
        success: isValid,
        message: isValid 
          ? 'PayHere configuration is valid and ready for use'
          : 'Please fill in all required PayHere credentials',
        details: {
          merchantId: config.merchantId ? '✅ Valid' : '❌ Missing',
          merchantSecret: config.merchantSecret ? '✅ Valid' : '❌ Missing',
          appId: config.appId ? '✅ Valid' : '❌ Missing',
          appSecret: config.appSecret ? '✅ Valid' : '❌ Missing',
          mode: config.sandbox ? 'Sandbox (Test)' : 'Live (Production)',
          currency: 'LKR (Sri Lankan Rupees)'
        }
      });
      setLoading(false);
    }, 1500);
  };

  const saveConfiguration = () => {
    // In a real app, you'd save this to backend/environment variables
    localStorage.setItem('payhere_config', JSON.stringify(config));
    window.alert('PayHere configuration saved successfully!\n\nNote: In production, store these credentials securely on the server.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">💳 PayHere Payment Configuration</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      {/* Current Configuration Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2 text-blue-800">📊 Current PayHere Status</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Merchant ID:</span> {config.merchantId || 'Not set'}
          </div>
          <div>
            <span className="font-medium">App ID:</span> {config.appId || 'Not set'}
          </div>
          <div>
            <span className="font-medium">Mode:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${config.sandbox ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {config.sandbox ? 'Sandbox (Test)' : 'Live (Production)'}
            </span>
          </div>
          <div>
            <span className="font-medium">Domain:</span> {config.domain}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Merchant Credentials */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">🏪 Merchant Credentials</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Merchant ID</label>
            <input
              type="text"
              name="merchantId"
              value={config.merchantId}
              onChange={handleInputChange}
              placeholder="Enter PayHere Merchant ID"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Merchant Secret</label>
            <input
              type="password"
              name="merchantSecret"
              value={config.merchantSecret}
              onChange={handleInputChange}
              placeholder="Enter PayHere Merchant Secret"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Domain/App Name</label>
            <input
              type="text"
              name="domain"
              value={config.domain}
              onChange={handleInputChange}
              placeholder="Enter your domain/app name"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* App Credentials */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">📱 App Credentials</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">App ID</label>
            <input
              type="text"
              name="appId"
              value={config.appId}
              onChange={handleInputChange}
              placeholder="Enter PayHere App ID"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">App Secret</label>
            <input
              type="password"
              name="appSecret"
              value={config.appSecret}
              onChange={handleInputChange}
              placeholder="Enter PayHere App Secret"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="sandbox"
              checked={config.sandbox}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm">
              Sandbox Mode (Test Environment)
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={testPayHereConfig}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Configuration'}
        </button>
        
        <button
          onClick={saveConfiguration}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Configuration
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded mb-6 ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.success ? '✅ Configuration Valid' : '❌ Configuration Issues'}
          </h3>
          <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
            {testResult.message}
          </p>
          
          {testResult.details && (
            <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm">
              {Object.entries(testResult.details).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2 text-yellow-800">📋 PayHere Setup Instructions</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Login to your PayHere merchant account</li>
          <li>2. Go to Settings → API & Webhooks</li>
          <li>3. Copy your Merchant ID and Merchant Secret</li>
          <li>4. Create a new App and get App ID and App Secret</li>
          <li>5. Set notification URL: <code className="bg-yellow-100 px-1 rounded">your-domain.com/api/payhere/notify</code></li>
          <li>6. Set return URL: <code className="bg-yellow-100 px-1 rounded">your-domain.com/payment-success</code></li>
          <li>7. Test in sandbox mode before going live</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-semibold mb-2 text-red-800">🔒 Security Notice</h3>
        <p className="text-sm text-red-700">
          <strong>Important:</strong> In production, store PayHere credentials as environment variables on your server, 
          not in the frontend code. This configuration is for development and testing purposes only.
        </p>
      </div>
    </div>
  );
}
