import React from 'react';

const PaymentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-start p-6 relative bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath d=%22M50 10c-20 0-30 20-30 20s10 20 30 20 30-20 30-20-10-20-30-20z%22 fill=%22%23000000%22 opacity=%220.1%22/%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2215%22 fill=%22%231e40af%22 opacity=%220.05%22/%3E%3C/svg%3E')] bg-repeat before:content-[''] before:absolute before:inset-0 before:bg-black/20">
      <header className="w-full max-w-4xl mb-12">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-200">HealthBridge - Payment</h1>
          <nav className="space-x-6">
            <a href="/" className="text-blue-300 hover:text-blue-100 transition">Back</a>
          </nav>
        </div>
        <div className="mt-4 text-sm text-gray-400">Step 2: Payment</div>
      </header>
      <main className="w-full max-w-4xl">
        <section className="text-center mb-12 animate-fadeIn">
          <h2 className="text-4xl font-extrabold text-green-400 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-300 mb-6">Pay to unlock access for the selected duration.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <h3 className="text-xl font-semibold text-green-400 mb-2">$50</h3>
              <p className="text-gray-400 mb-4">1 Month</p>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 animate-pulse">
                Select
              </button>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <h3 className="text-xl font-semibold text-green-400 mb-2">$100</h3>
              <p className="text-gray-400 mb-4">3 Months</p>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 animate-pulse">
                Select
              </button>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <h3 className="text-xl font-semibold text-green-400 mb-2">$200</h3>
              <p className="text-gray-400 mb-4">6 Months</p>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 animate-pulse">
                Select
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400">*Currency adjusts to your local rate. Refer a friend (optional) for benefits!</p>
        </section>
        <section className="bg-gray-800 p-6 rounded-xl shadow-lg flex items-center justify-around animate-slideUp">
          <div className="w-1/3 text-center">
            <svg className="w-24 h-24 text-red-500 animate-spin mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <p className="text-gray-400">Secure Payment</p>
          </div>
          <div className="w-1/3 text-center">
            <svg className="w-24 h-24 text-blue-400 animate-bounce mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v3H7v2h3v3h2v-3h3v-2h-3V7z" />
            </svg>
            <p className="text-gray-400">Flexible Plans</p>
          </div>
          <div className="w-1/3 text-center">
            <svg className="w-24 h-24 text-green-500 animate-pulse mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <p className="text-gray-400">Instant Access</p>
          </div>
        </section>
      </main>
      <footer className="w-full max-w-4xl mt-12 text-center text-gray-500">
        <p>&copy; 2025 HealthBridge. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PaymentPage;