
import React, { useState } from 'react';
import { CardData, CardCategory } from '../types';
import { Search, CreditCard, Share2, MoreVertical, Trash2, Mail, Phone, Briefcase, FileText, Globe, Calendar, AlertCircle } from 'lucide-react';

interface WalletProps {
  cards: CardData[];
  onDelete: (id: string) => void;
  onUse: (id: string) => void;
}

const Wallet: React.FC<WalletProps> = ({ cards, onDelete, onUse }) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCards = cards.filter(card => {
    const matchesFilter = filter === 'All' || card.type === filter;
    const matchesSearch = card.issuer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          card.holderName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLogo = (issuer: string) => {
    const lower = issuer.toLowerCase();
    if (lower.includes('visa')) return <span className="font-bold italic text-white/90 text-xl">VISA</span>;
    if (lower.includes('master')) return (
      <div className="flex -space-x-2">
        <div className="w-6 h-6 rounded-full bg-red-500/90"></div>
        <div className="w-6 h-6 rounded-full bg-yellow-500/90"></div>
      </div>
    );
    return <span className="font-bold text-white/90 truncate max-w-[150px]">{issuer}</span>;
  }

  const getCardIcon = (type: CardCategory) => {
    switch (type) {
        case CardCategory.BUSINESS: return <Briefcase size={16} />;
        case CardCategory.PASSPORT: return <Globe size={16} />;
        case CardCategory.DRIVER_LICENSE: return <CreditCard size={16} />;
        case CardCategory.NATIONAL_ID: return <FileText size={16} />;
        default: return <CreditCard className="opacity-50" />;
    }
  }

  const isExpired = (expiryDate?: string) => {
      if (!expiryDate) return false;
      try {
        const parts = expiryDate.split('/');
        if (parts.length < 2) return false;
        let month = parseInt(parts[0], 10);
        let year = parseInt(parts[1], 10);
        if (year < 100) year += 2000;
        const expiry = new Date(year, month, 0); 
        return expiry < new Date();
      } catch (e) { return false; }
  }

  const handleAction = (e: React.MouseEvent, id: string, action?: string) => {
    e.stopPropagation();
    onUse(id);
    if(action === 'copy') alert('Copied to clipboard!');
    if(action === 'share') alert('Secure 1-time link generated! (Demo)');
  };

  const categories = ['All', ...new Set(cards.map(c => c.type))];

  return (
    <div className="p-4 md:p-8 pb-24 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Digital Vault</h1>

      {/* Search and Filter */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search documents & cards..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => {
            const expired = isExpired(card.expiryDate);
            const isID = [CardCategory.PASSPORT, CardCategory.DRIVER_LICENSE, CardCategory.NATIONAL_ID, CardCategory.STUDENT_ID].includes(card.type);

            return (
              <div key={card.id} className="group relative perspective-1000" onClick={() => onUse(card.id)}>
                 {/* Card Visual */}
                 <div className={`relative min-h-56 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-transform transform hover:-translate-y-2 bg-gradient-to-br ${card.colorTheme} text-white`}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium opacity-75 mb-1 flex items-center gap-1">
                          {card.type.toUpperCase()} 
                          {expired && <span className="bg-red-500 text-white px-1 rounded text-[9px] ml-1">EXPIRED</span>}
                        </span>
                        {getLogo(card.issuer)}
                      </div>
                      <div className="p-2 bg-white/20 rounded-full">{getCardIcon(card.type)}</div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-2 my-4">
                       {card.jobTitle && (
                           <div className="text-sm font-medium opacity-90">{card.jobTitle}</div>
                       )}
                       
                       {/* ID Specific Fields */}
                       {isID && card.nationality && (
                           <div className="text-xs uppercase opacity-75">{card.nationality}</div>
                       )}

                      <div className={`font-mono tracking-widest drop-shadow-md ${card.type === CardCategory.BUSINESS ? 'text-lg' : 'text-xl'}`}>
                        {card.number}
                      </div>

                      {/* ID Specific - DOB */}
                      {isID && card.dob && (
                          <div className="text-xs flex items-center gap-1 opacity-80 mt-1">
                              <Calendar size={10} /> DOB: {card.dob}
                          </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col max-w-[60%]">
                         <span className="text-[10px] uppercase opacity-75">Holder</span>
                         <span className="font-medium tracking-wide uppercase truncate">{card.holderName}</span>
                      </div>
                      {card.expiryDate && (
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] uppercase opacity-75">Expires</span>
                             <span className={`font-medium tracking-wide ${expired ? 'text-red-300' : ''}`}>{card.expiryDate}</span>
                          </div>
                      )}
                    </div>
                    
                    {/* Decorative Chip for banking */}
                    {card.type === CardCategory.BANKING && (
                      <div className="absolute top-20 left-6 w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 opacity-80 border border-yellow-600/30 flex items-center justify-center overflow-hidden">
                          <div className="w-full h-[1px] bg-black/10 absolute top-2"></div>
                          <div className="w-full h-[1px] bg-black/10 absolute bottom-2"></div>
                          <div className="h-full w-[1px] bg-black/10 absolute left-4"></div>
                          <div className="h-full w-[1px] bg-black/10 absolute right-4"></div>
                      </div>
                    )}

                    {/* Contact Actions for Business */}
                    {card.type === CardCategory.BUSINESS && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
                            {card.email && (
                                <button onClick={(e) => handleAction(e, card.id, 'copy')} className="flex-1 bg-white/10 hover:bg-white/20 py-1 rounded text-xs flex items-center justify-center gap-1">
                                    <Mail size={12} /> Email
                                </button>
                            )}
                            {card.phone && (
                                <button onClick={(e) => handleAction(e, card.id, 'copy')} className="flex-1 bg-white/10 hover:bg-white/20 py-1 rounded text-xs flex items-center justify-center gap-1">
                                    <Phone size={12} /> Call
                                </button>
                            )}
                        </div>
                    )}

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                       <button onClick={(e) => handleAction(e, card.id, 'share')} className="p-3 bg-white/20 rounded-full hover:bg-white/40 text-white transition flex flex-col items-center gap-1">
                         <Share2 size={20} />
                         <span className="text-[9px]">Share</span>
                       </button>
                       <button onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} className="p-3 bg-red-500/80 rounded-full hover:bg-red-500 text-white transition flex flex-col items-center gap-1">
                         <Trash2 size={20} />
                         <span className="text-[9px]">Delete</span>
                       </button>
                    </div>
                 </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <CreditCard size={32} />
             </div>
             <p className="text-lg font-medium text-gray-600">No items found</p>
             <p className="text-sm">Tap the + button to scan your first card or document.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
