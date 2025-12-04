
import React from 'react';
import {  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { CardData, CardCategory } from '../types';
import { CreditCard, ShieldCheck, Wallet, ArrowUpRight, TrendingUp, Star, AlertTriangle, Clock } from 'lucide-react';

interface DashboardProps {
  cards: CardData[];
  isPremium: boolean;
  onNavigate: (route: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ cards, isPremium, onNavigate }) => {
  
  // Calculate Stats
  const totalCards = cards.length;
  const categories = cards.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categories).map((key, index) => ({
    name: key,
    value: categories[key],
  }));

  // Analytics: Usage Frequency by Category
  const usageByCategory = cards.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + card.usageCount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(usageByCategory).map((key) => ({
    name: key,
    usage: usageByCategory[key]
  }));

  // Analytics: Most Used Cards
  const mostUsedCards = [...cards].sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);
  const totalUsage = cards.reduce((sum, card) => sum + card.usageCount, 0);

  // Smart Alerts: Expiry Checks
  const expiringCards = cards.filter(card => {
    if (!card.expiryDate) return false;
    // Basic expiry check: Assuming MM/YY or MM/YYYY
    // We'll normalize to a date object for comparison
    try {
      const parts = card.expiryDate.split('/');
      if (parts.length < 2) return false;
      let month = parseInt(parts[0], 10);
      let year = parseInt(parts[1], 10);
      
      // Handle 2-digit year
      if (year < 100) year += 2000;
      
      // Set to last day of expiry month
      const expiry = new Date(year, month, 0); 
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 90; // Alert if expiring within 90 days or already expired
    } catch (e) {
      return false;
    }
  });

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, User</p>
        </div>
        <div className="flex items-center gap-2">
            {!isPremium && (
                 <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">FREE PLAN</span>
            )}
        </div>
      </header>

      {/* Smart Alerts */}
      {expiringCards.length > 0 && (
        <section className="bg-red-50 border border-red-100 p-4 rounded-2xl animate-in slide-in-from-top-4">
           <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-red-600" size={20} />
              <h3 className="font-bold text-red-900">Smart Alerts</h3>
           </div>
           <div className="space-y-2">
              {expiringCards.map(card => (
                <div key={card.id} className="flex justify-between items-center bg-white/60 p-2 rounded-lg">
                   <div className="flex items-center gap-2">
                      <Clock size={14} className="text-red-500" />
                      <span className="text-sm font-medium text-gray-700">{card.issuer} {card.type}</span>
                   </div>
                   <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                      Expires: {card.expiryDate}
                   </span>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
            <Wallet size={20} />
          </div>
          <span className="text-gray-500 text-xs font-medium">Total Items</span>
          <span className="text-2xl font-bold text-gray-900">{totalCards}</span>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-3">
            <TrendingUp size={20} />
          </div>
          <span className="text-gray-500 text-xs font-medium">Interactions</span>
          <span className="text-2xl font-bold text-gray-900">{totalUsage}</span>
        </div>

         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-3">
            <Star size={20} />
          </div>
          <span className="text-gray-500 text-xs font-medium">Top Category</span>
          <span className="text-lg font-bold text-gray-900 truncate">
            {pieData.length > 0 ? pieData.sort((a,b) => b.value - a.value)[0].name : 'N/A'}
          </span>
        </div>

         <div onClick={() => onNavigate('premium')} className="cursor-pointer bg-gradient-to-br from-gray-900 to-black p-4 rounded-2xl shadow-lg border border-gray-800 flex flex-col text-white">
          <div className="p-2 bg-white/10 rounded-lg w-fit mb-3 text-yellow-400">
            <ArrowUpRight size={20} />
          </div>
          <span className="text-gray-400 text-xs font-medium">Plan</span>
          <span className="text-lg font-bold text-white flex items-center gap-2">
            {isPremium ? 'Premium' : 'Upgrade'}
            {!isPremium && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </span>
        </div>
      </div>

      {/* Most Frequently Used Cards */}
      {mostUsedCards.length > 0 && (
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} /> Most Frequently Used
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mostUsedCards.map((card) => (
              <div key={card.id} className={`p-4 rounded-xl text-white bg-gradient-to-br ${card.colorTheme} flex justify-between items-center shadow-md cursor-pointer hover:shadow-lg transition`} onClick={() => onNavigate('wallet')}>
                <div>
                   <div className="text-xs opacity-75 uppercase">{card.issuer}</div>
                   <div className="font-mono text-sm">{card.number}</div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-bold">{card.usageCount}</div>
                   <div className="text-[10px] opacity-75">Uses</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Wallet Distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Vault Composition</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p>No items yet</p>
                </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
              {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                      {entry.name}
                  </div>
              ))}
          </div>
        </div>

        {/* Usage Activity */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Usage Frequency by Category</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{fill: 'transparent'}} 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                        />
                        <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
