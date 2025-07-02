import { Shield, ExternalLink } from 'lucide-react';

export default function TreasuryInfo() {
  const TREASURY_ADDRESS = '62fw621KsHjW3oSU7yXjuwezU1Ssaxkj7qS8B4AAh69R';
  
  const handleViewTreasury = () => {
    window.open(`https://explorer.gorbagana.wtf/account/${TREASURY_ADDRESS}`, '_blank');
  };

  return (
    <div className="text-center mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-400/20">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-blue-400" />
        <span className="text-blue-100 text-sm font-medium">Game Treasury</span>
      </div>
      <p className="text-blue-200 text-xs mb-3">
        Entry fees go to the community treasury fund
      </p>
      <button
        onClick={handleViewTreasury}
        className="text-blue-300 hover:text-blue-100 text-xs flex items-center gap-1 mx-auto transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        View on Explorer
      </button>
    </div>
  );
}
