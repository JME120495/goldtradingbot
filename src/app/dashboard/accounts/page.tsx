'use client';

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">MT5 Accounts</h1>
        <p className="text-gray-400">Manage your MetaTrader 5 accounts linked to your licenses.</p>
      </div>

      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 mt-8">
        <h2 className="text-xl font-bold mb-6">Add New Account</h2>
        <form className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">MT5 Account Number</label>
            <input 
              type="text" 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
              placeholder="e.g. 12345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Broker Name</label>
            <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]">
              <option value="">Select your broker</option>
              <option value="Fusion Markets">Fusion Markets</option>
              <option value="Pepperstone">Pepperstone</option>
              <option value="IC Markets">IC Markets</option>
              <option value="Exness">Exness</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="button" className="bg-[#D4AF37] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#AA8B2C]">
            Link Account
          </button>
        </form>
      </div>
    </div>
  );
}
