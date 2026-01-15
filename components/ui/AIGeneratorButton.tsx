import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateSectionContent } from '../../services/geminiService';
import { ProposalData } from '../../types';

interface AIGeneratorButtonProps {
  sectionName: string;
  context: ProposalData;
  promptGuidance: string;
  onGenerate: (text: string) => void;
}

export const AIGeneratorButton: React.FC<AIGeneratorButtonProps> = ({ 
  sectionName, 
  context, 
  promptGuidance, 
  onGenerate 
}) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!context.title) {
      alert("Mohon isi Judul Kegiatan terlebih dahulu agar AI dapat bekerja maksimal.");
      return;
    }
    
    setLoading(true);
    const result = await generateSectionContent(sectionName, context, promptGuidance);
    onGenerate(result);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {loading ? 'Menulis...' : 'Bantu Tulis (AI)'}
    </button>
  );
};