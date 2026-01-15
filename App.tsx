import React, { useState, useEffect } from 'react';
import { ProposalData, initialProposalState, ProgramType, Budget, CommitteeMember, ScheduleItem, PROGRAM_REFERENCES, TEACHER_DATA, SupervisionItem, Signatory } from './types';
import { ProposalPreview } from './components/ProposalPreview';
import { Tooltip } from './components/ui/Tooltip';
import { AIGeneratorButton } from './components/ui/AIGeneratorButton';
import { FileText, Save, Download, RefreshCw, PenTool, Calendar, Users, DollarSign, CheckCircle, Sparkles, Loader2, Wand2, BookOpen, Paperclip, ClipboardList, PenLine, List, Book, TrendingUp } from 'lucide-react';
import { generateFullProposal } from './services/geminiService';
import { generateWordDocument } from './services/wordGenerator';

const TABS = [
  { id: 'info', label: 'Info & Judul', icon: <FileText size={18} /> },
  { id: 'intro', label: 'Pendahuluan', icon: <PenTool size={18} /> },
  { id: 'theory', label: 'Kajian Pustaka', icon: <Book size={18} /> }, // New Tab
  { id: 'details', label: 'Detail Kegiatan', icon: <Calendar size={18} /> },
  { id: 'analysis', label: 'Analisis', icon: <TrendingUp size={18} /> }, // New Tab
  { id: 'org', label: 'Kepanitiaan', icon: <Users size={18} /> },
  { id: 'budget', label: 'Anggaran', icon: <DollarSign size={18} /> },
  { id: 'approval', label: 'Pengesahan', icon: <PenLine size={18} /> },
  { id: 'toc', label: 'Daftar Isi', icon: <List size={18} /> },
  { id: 'attachments', label: 'Lampiran', icon: <Paperclip size={18} /> },
  { id: 'closing', label: 'Penutup', icon: <CheckCircle size={18} /> },
];

function App() {
  const [data, setData] = useState<ProposalData>(initialProposalState);
  const [activeTab, setActiveTab] = useState('info');
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [isFullGenerating, setIsFullGenerating] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('proposal_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial state to ensure new fields (attachments, principalName) exist if loading old draft
        setData({ ...initialProposalState, ...parsed });
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  const saveDraft = () => {
    try {
        localStorage.setItem('proposal_draft', JSON.stringify(data));
        alert('Draft berhasil disimpan!');
    } catch (e) {
        alert('Gagal menyimpan draft.');
    }
  };

  const handleDownloadWord = async () => {
    try {
        await generateWordDocument(data);
    } catch (error) {
        console.error("Error generating word doc:", error);
        alert("Gagal membuat file Word. Pastikan data sudah terisi.");
    }
  };

  const updateField = (field: keyof ProposalData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleProgramTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = e.target.value;
    if (!selectedTitle) return;

    const selectedProgram = PROGRAM_REFERENCES.find(p => p.title === selectedTitle);
    
    if (selectedProgram) {
      setData(prev => ({
        ...prev,
        title: selectedProgram.title,
        programType: selectedProgram.type
      }));
    }
  };

  const handleAutoGenerate = async () => {
    if (!data.title) {
      alert("Mohon isi 'Judul Kegiatan' terlebih dahulu.");
      return;
    }

    setIsFullGenerating(true);
    try {
      const aiResult = await generateFullProposal(data.title, data.schoolName || 'Sekolah Menengah Atas');
      
      if (aiResult) {
        const mappedData: ProposalData = {
          ...data,
          ...aiResult,
          programType: Object.values(ProgramType).includes(aiResult.programType) ? aiResult.programType : ProgramType.ACARA_SEKOLAH,
          
          schedule: Array.isArray(aiResult.schedule) ? aiResult.schedule.map((s: any, i: number) => ({
            id: `sch-${Date.now()}-${i}`,
            time: s.time || '',
            activity: s.activity || '',
            pic: s.pic || ''
          })) : [],

          committee: Array.isArray(aiResult.committee) ? aiResult.committee.map((c: any, i: number) => ({
            id: `com-${Date.now()}-${i}`,
            position: c.position || '',
            name: c.name || '...',
            contact: ''
          })) : [],

          budget: Array.isArray(aiResult.budget) ? aiResult.budget.map((b: any, i: number) => ({
            id: `bud-${Date.now()}-${i}`,
            item: b.item || '',
            quantity: b.quantity || 1,
            price: b.price || 0,
            total: (b.quantity || 1) * (b.price || 0),
            source: b.source || 'Sekolah'
          })) : []
        };

        setData(mappedData);
        alert("Proposal LENGKAP berhasil dibuat otomatis! Silakan periksa setiap tab.");
        setActiveTab('theory'); 
      } else {
        alert("Gagal membuat proposal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghubungkan ke AI.");
    } finally {
      setIsFullGenerating(false);
    }
  };

  // Helper for dynamic tables
  const addScheduleItem = () => {
    const newItem: ScheduleItem = { id: Date.now().toString(), time: '', activity: '', pic: '' };
    setData(prev => ({ ...prev, schedule: [...prev.schedule, newItem] }));
  };
  const removeScheduleItem = (id: string) => {
    setData(prev => ({ ...prev, schedule: prev.schedule.filter(i => i.id !== id) }));
  };

  const addCommittee = () => {
    const newItem: CommitteeMember = { id: Date.now().toString(), position: '', name: '', contact: '' };
    setData(prev => ({ ...prev, committee: [...prev.committee, newItem] }));
  };
  const removeCommittee = (id: string) => {
    setData(prev => ({ ...prev, committee: prev.committee.filter(i => i.id !== id) }));
  };

  const addBudget = () => {
    const newItem: Budget = { id: Date.now().toString(), item: '', quantity: 1, price: 0, total: 0, source: 'Sekolah' };
    setData(prev => ({ ...prev, budget: [...prev.budget, newItem] }));
  };
  const removeBudget = (id: string) => {
    setData(prev => ({ ...prev, budget: prev.budget.filter(i => i.id !== id) }));
  };

  const updateBudgetRow = (id: string, field: keyof Budget, value: any) => {
    setData(prev => ({
      ...prev,
      budget: prev.budget.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updated.total = updated.quantity * updated.price;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  // Signatory Helpers
  const addSignatory = () => {
    const newItem: Signatory = { id: Date.now().toString(), role: '', name: '', idNumber: '' };
    setData(prev => ({ ...prev, approvalSignatories: [...prev.approvalSignatories, newItem] }));
  };
  const removeSignatory = (id: string) => {
    setData(prev => ({ ...prev, approvalSignatories: prev.approvalSignatories.filter(i => i.id !== id) }));
  };
  const updateSignatory = (id: string, field: keyof Signatory, value: string) => {
    setData(prev => ({
      ...prev,
      approvalSignatories: prev.approvalSignatories.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Supervision Helper
  const generateSupervisionSchedule = () => {
    if (confirm("Ini akan menimpa data jadwal supervisi saat ini. Lanjutkan?")) {
      const newSchedule: SupervisionItem[] = TEACHER_DATA.map((teacher, index) => ({
        id: `sup-${Date.now()}-${index}`,
        date: '...',
        time: '...',
        teacherName: teacher.name,
        subject: teacher.subject,
        class: teacher.classes,
        supervisor: '...'
      }));
      setData(prev => ({ ...prev, supervisionSchedule: newSchedule }));
    }
  };

  const updateSupervisionRow = (id: string, field: keyof SupervisionItem, value: string) => {
    setData(prev => ({
      ...prev,
      supervisionSchedule: prev.supervisionSchedule.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeSupervisionItem = (id: string) => {
    setData(prev => ({ ...prev, supervisionSchedule: prev.supervisionSchedule.filter(i => i.id !== id) }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            
            {/* Magic Generator Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm text-purple-600 mt-1">
                  <Wand2 size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-base mb-1">Buat Proposal LENGKAP (20+ Halaman)</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Generator ini sekarang akan membuat <strong>Bab II (Kajian Pustaka)</strong>, <strong>Analisis SWOT</strong>, dan <strong>Uraian Tugas Panitia</strong> secara otomatis untuk mencapai ketebalan proposal yang diinginkan.
                  </p>
                  <button
                    onClick={handleAutoGenerate}
                    disabled={isFullGenerating || !data.title}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      !data.title 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                    }`}
                  >
                    {isFullGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sedang Menyusun Proposal... (45-60 detik)
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Buat Proposal Otomatis
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Yayasan</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.foundationName || ''}
                  onChange={(e) => updateField('foundationName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                  value={data.schoolName}
                  onChange={(e) => updateField('schoolName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Sekolah</label>
                    <input 
                    type="text" 
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.schoolAddress}
                    onChange={(e) => updateField('schoolAddress', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
                    <input 
                    type="text" 
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.principalName}
                    placeholder="Contoh: Antoni Firdaus, M.Pd"
                    onChange={(e) => updateField('principalName', e.target.value)}
                    />
                </div>
              </div>

              {/* Template Selection */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-500"/>
                  Pilih Template Kegiatan (Opsional)
                </label>
                <select
                  className="w-full border rounded p-2 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  onChange={handleProgramTemplateSelect}
                  value=""
                >
                  <option value="" disabled>-- Pilih dari daftar kegiatan umum --</option>
                  <optgroup label="Program Unggulan & Ekstrakurikuler">
                    {PROGRAM_REFERENCES.filter(p => p.type === ProgramType.INTRAKURIKULER || p.type === ProgramType.EKSTRAKURIKULER || p.type === ProgramType.KEGIATAN_OSIS).map((p, idx) => (
                      <option key={idx} value={p.title}>{p.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Acara & Pengembangan">
                    {PROGRAM_REFERENCES.filter(p => p.type === ProgramType.ACARA_SEKOLAH || p.type === ProgramType.PENGEMBANGAN_SISWA || p.type === ProgramType.PENGEMBANGAN_GURU).map((p, idx) => (
                      <option key={idx} value={p.title}>{p.title}</option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-1">Memilih template akan otomatis mengisi Judul dan Jenis Program.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kegiatan <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="Contoh: Lomba Futsal Antar Kelas"
                  value={data.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Wajib diisi untuk fitur generator otomatis.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Program</label>
                  <select 
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={data.programType}
                    onChange={(e) => updateField('programType', e.target.value)}
                  >
                    {Object.values(ProgramType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.academicYear}
                    onChange={(e) => updateField('academicYear', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                 <input 
                    type="checkbox" 
                    id="committeeToggle"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={data.isCommitteeEnabled}
                    onChange={(e) => updateField('isCommitteeEnabled', e.target.checked)}
                 />
                 <label htmlFor="committeeToggle" className="text-sm font-medium text-gray-700 select-none">
                    Sertakan Halaman Kepanitiaan
                 </label>
              </div>
            </div>
          </div>
        );
      case 'intro':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700">Latar Belakang</label>
                  <Tooltip text="Jelaskan alasan kegiatan ini diadakan. Masukkan data pendukung jika ada." />
                </div>
                <AIGeneratorButton 
                  sectionName="Latar Belakang" 
                  context={data} 
                  promptGuidance="Fokus pada urgensi kegiatan, masalah yang ingin diselesaikan, dan keselarasan dengan visi sekolah."
                  onGenerate={(t) => updateField('background', t)} 
                />
              </div>
              <textarea 
                className="w-full border rounded p-2 h-48 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.background}
                onChange={(e) => updateField('background', e.target.value)}
                placeholder="Mengapa kegiatan ini penting?"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700">Dasar Hukum</label>
                  <Tooltip text="Landasan yuridis formal." />
                </div>
                <AIGeneratorButton 
                  sectionName="Dasar Hukum" 
                  context={data} 
                  promptGuidance="Sebutkan UU Sisdiknas, Permendikbud tentang Kesiswaan, dan Program Kerja Sekolah."
                  onGenerate={(t) => updateField('legalBasis', t)} 
                />
              </div>
              <textarea 
                className="w-full border rounded p-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.legalBasis}
                onChange={(e) => updateField('legalBasis', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700">Tujuan Kegiatan</label>
                  <Tooltip text="Gunakan prinsip SMART (Specific, Measurable, Achievable, Relevant, Time-bound)." />
                </div>
                <AIGeneratorButton 
                  sectionName="Tujuan Kegiatan" 
                  context={data} 
                  promptGuidance="Buat daftar tujuan poin per poin. Pastikan terukur dan realistis untuk siswa."
                  onGenerate={(t) => updateField('objectives', t)} 
                />
              </div>
              <textarea 
                className="w-full border rounded p-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.objectives}
                onChange={(e) => updateField('objectives', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700">Manfaat Kegiatan</label>
                  <Tooltip text="Apa manfaatnya untuk Siswa, Guru, dan Sekolah?" />
                </div>
                <AIGeneratorButton 
                  sectionName="Manfaat Kegiatan" 
                  context={data} 
                  promptGuidance="Jabarkan manfaat bagi peserta didik, guru, sekolah, dan masyarakat luas."
                  onGenerate={(t) => updateField('benefits', t)} 
                />
              </div>
              <textarea 
                className="w-full border rounded p-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.benefits}
                onChange={(e) => updateField('benefits', e.target.value)}
              />
            </div>
          </div>
        );
      case 'theory':
        return (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 border border-blue-100">
                    <p><strong>Bab II: Kajian Pustaka</strong> adalah bagian penting untuk membuat proposal berbobot akademis. AI akan men-generate teori yang relevan dengan kegiatan Anda.</p>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Isi Kajian Pustaka / Landasan Teori</label>
                        <AIGeneratorButton 
                            sectionName="Kajian Pustaka (Theoretical Framework)" 
                            context={data} 
                            promptGuidance="Tuliskan landasan teori akademis yang mendalam (min 1000 kata) terkait kegiatan ini. Kutip teori pendidikan, psikologi, atau manajemen yang relevan."
                            onGenerate={(t) => updateField('theoreticalFramework', t)} 
                        />
                    </div>
                    <textarea 
                        className="w-full border rounded p-2 h-96 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={data.theoreticalFramework}
                        onChange={(e) => updateField('theoreticalFramework', e.target.value)}
                        placeholder="Contoh: Teori Kepemimpinan Transformasional, Pentingnya Olahraga bagi Perkembangan Remaja..."
                    />
                </div>
            </div>
        );
      case 'analysis':
          return (
              <div className="space-y-6">
                  <div>
                      <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium text-gray-700">Analisis SWOT</label>
                          <AIGeneratorButton 
                              sectionName="Analisis SWOT" 
                              context={data} 
                              promptGuidance="Buat analisis Strength, Weakness, Opportunity, dan Threat untuk kegiatan ini secara mendetail."
                              onGenerate={(t) => updateField('swotAnalysis', t)} 
                          />
                      </div>
                      <textarea 
                          className="w-full border rounded p-2 h-64 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          value={data.swotAnalysis}
                          onChange={(e) => updateField('swotAnalysis', e.target.value)}
                          placeholder="Analisis Kekuatan, Kelemahan, Peluang, dan Ancaman..."
                      />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rumusan Masalah</label>
                    <textarea 
                        className="w-full border rounded p-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={data.problemStatement}
                        onChange={(e) => updateField('problemStatement', e.target.value)}
                    />
                  </div>
              </div>
          );
      case 'details':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema (Opsional)</label>
              <input 
                type="text" 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Bersatu Kita Teguh"
                value={data.theme}
                onChange={(e) => updateField('theme', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sasaran Peserta</label>
              <input 
                type="text" 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Seluruh Siswa Kelas X dan XI"
                value={data.targetAudience}
                onChange={(e) => updateField('targetAudience', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input 
                  type="date" 
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <input 
                  type="date" 
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <input 
                type="text" 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Aula Utama"
                value={data.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Rencana Kegiatan / Metode</label>
                <AIGeneratorButton 
                  sectionName="Metode Kegiatan" 
                  context={data} 
                  promptGuidance="Jelaskan bagaimana kegiatan akan dilaksanakan. Apakah workshop, lomba, atau seminar?"
                  onGenerate={(t) => updateField('methodology', t)} 
                />
              </div>
              <textarea 
                className="w-full border rounded p-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.methodology}
                onChange={(e) => updateField('methodology', e.target.value)}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jadwal Detail</label>
              {data.schedule.map((item, index) => (
                <div key={item.id} className="flex gap-2 mb-2">
                  <input 
                    placeholder="Waktu" 
                    className="w-1/4 border rounded p-1 text-sm"
                    value={item.time} 
                    onChange={e => {
                      const newSched = [...data.schedule];
                      newSched[index].time = e.target.value;
                      setData({...data, schedule: newSched});
                    }}
                  />
                  <input 
                    placeholder="Kegiatan" 
                    className="w-1/2 border rounded p-1 text-sm"
                    value={item.activity} 
                    onChange={e => {
                      const newSched = [...data.schedule];
                      newSched[index].activity = e.target.value;
                      setData({...data, schedule: newSched});
                    }}
                  />
                  <input 
                    placeholder="PIC" 
                    className="w-1/4 border rounded p-1 text-sm"
                    value={item.pic} 
                    onChange={e => {
                      const newSched = [...data.schedule];
                      newSched[index].pic = e.target.value;
                      setData({...data, schedule: newSched});
                    }}
                  />
                  <button onClick={() => removeScheduleItem(item.id)} className="text-red-500 hover:text-red-700">×</button>
                </div>
              ))}
              <button onClick={addScheduleItem} className="text-xs text-blue-600 font-medium hover:underline">+ Tambah Baris Jadwal</button>
            </div>
          </div>
        );
      case 'org':
        if (!data.isCommitteeEnabled) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <Users size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">Kepanitiaan Dinonaktifkan</p>
                    <p className="text-sm">Aktifkan kembali di tab "Info & Judul" jika diperlukan.</p>
                </div>
            );
        }
        return (
          <div>
            <datalist id="teacher-list">
                {Array.from(new Set(TEACHER_DATA.map(t => t.name))).map((name, idx) => (
                    <option key={idx} value={name} />
                ))}
            </datalist>

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Susunan Kepanitiaan</h3>
              <button onClick={addCommittee} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">+ Tambah Panitia</button>
            </div>
            <div className="space-y-3 mb-8">
              {data.committee.map((member, index) => (
                <div key={member.id} className="p-3 border rounded bg-gray-50 relative">
                  <button onClick={() => removeCommittee(member.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">×</button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Jabatan</label>
                      <input 
                        className="w-full border rounded p-1 text-sm"
                        value={member.position}
                        onChange={e => {
                          const newComm = [...data.committee];
                          newComm[index].position = e.target.value;
                          setData({...data, committee: newComm});
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Nama Lengkap</label>
                      <input 
                        className="w-full border rounded p-1 text-sm"
                        value={member.name}
                        list="teacher-list"
                        placeholder="Ketik atau pilih nama guru..."
                        onChange={e => {
                          const newComm = [...data.committee];
                          newComm[index].name = e.target.value;
                          setData({...data, committee: newComm});
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700">Uraian Tugas Panitia (Job Description)</label>
                    <AIGeneratorButton 
                        sectionName="Uraian Tugas Panitia" 
                        context={data} 
                        promptGuidance="Tuliskan rincian tugas (Job Description) untuk setiap jabatan panitia (Ketua, Sekretaris, Bendahara, dll) dengan detail."
                        onGenerate={(t) => updateField('jobDescriptions', t)} 
                    />
                </div>
                <textarea 
                    className="w-full border rounded p-2 h-64 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={data.jobDescriptions}
                    onChange={(e) => updateField('jobDescriptions', e.target.value)}
                    placeholder="Contoh: 1. Ketua Pelaksana: Bertanggung jawab penuh atas... 2. Sekretaris: Mengurus administrasi..."
                />
            </div>
          </div>
        );
      case 'budget':
        return (
          <div>
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Rencana Anggaran Biaya</h3>
              <button onClick={addBudget} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100">+ Tambah Item</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-medium">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 w-16">Jml</th>
                    <th className="p-2 w-28">Harga</th>
                    <th className="p-2 w-28">Total</th>
                    <th className="p-2 w-24">Sumber</th>
                    <th className="p-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.budget.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <input 
                          className="w-full border rounded p-1"
                          value={item.item}
                          onChange={(e) => updateBudgetRow(item.id, 'item', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number"
                          className="w-full border rounded p-1 text-center"
                          value={item.quantity}
                          onChange={(e) => updateBudgetRow(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number"
                          className="w-full border rounded p-1 text-right"
                          value={item.price}
                          onChange={(e) => updateBudgetRow(item.id, 'price', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2 text-right font-medium text-gray-700">
                        {(item.total).toLocaleString('id-ID')}
                      </td>
                      <td className="p-2">
                        <input 
                          className="w-full border rounded p-1 text-xs"
                          value={item.source}
                          onChange={(e) => updateBudgetRow(item.id, 'source', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeBudget(item.id)} className="text-red-400 hover:text-red-600">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-bold">
                    <td colSpan={3} className="p-2 text-right">Total Anggaran:</td>
                    <td className="p-2 text-right">Rp {data.budget.reduce((a, b) => a + b.total, 0).toLocaleString('id-ID')}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      case 'approval':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <PenLine size={18} />
                Lembar Pengesahan
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Halaman ini akan muncul tepat setelah cover. Silakan atur siapa saja yang akan menandatangani proposal ini.
              </p>
              
              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pengesahan</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2 text-sm"
                    value={data.approvalDate}
                    onChange={(e) => updateField('approvalDate', e.target.value)}
                    placeholder="Contoh: 20 Agustus 2025"
                  />
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Daftar Penanda Tangan</label>
                    <button onClick={addSignatory} className="text-xs bg-white border border-blue-300 text-blue-600 px-2 py-1 rounded hover:bg-blue-50">+ Tambah</button>
                 </div>
                 {data.approvalSignatories.map((sig, idx) => (
                    <div key={sig.id} className="flex gap-2 items-start bg-white p-2 rounded border">
                        <div className="w-8 flex-shrink-0 flex items-center justify-center pt-2 text-gray-400 text-xs font-bold">
                            {idx + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                            <input 
                                className="w-full border rounded px-2 py-1 text-xs font-semibold bg-gray-50"
                                placeholder="Jabatan (Misal: Ketua Panitia)"
                                value={sig.role}
                                onChange={(e) => updateSignatory(sig.id, 'role', e.target.value)}
                            />
                            <input 
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="Nama Lengkap"
                                value={sig.name}
                                list="teacher-list"
                                onChange={(e) => updateSignatory(sig.id, 'name', e.target.value)}
                            />
                             <input 
                                className="w-full border rounded px-2 py-1 text-xs text-gray-500"
                                placeholder="NIP/NUPTK (Opsional)"
                                value={sig.idNumber}
                                onChange={(e) => updateSignatory(sig.id, 'idNumber', e.target.value)}
                            />
                        </div>
                        <button onClick={() => removeSignatory(sig.id)} className="text-red-400 hover:text-red-600 pt-2 px-1">×</button>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        );
      case 'toc':
        return (
            <div className="space-y-6">
                 <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <List size={18} />
                            Daftar Isi Otomatis
                        </h3>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="tocToggle"
                                className="w-4 h-4 text-blue-600 rounded"
                                checked={data.includeTableOfContents}
                                onChange={(e) => updateField('includeTableOfContents', e.target.checked)}
                            />
                            <label htmlFor="tocToggle" className="text-sm font-medium text-gray-700">Aktifkan</label>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                        Jika diaktifkan, generator akan membuat halaman <strong>Daftar Isi</strong> secara otomatis di file Word.
                        <br/><span className="text-xs text-gray-500 italic">*Daftar isi pada file Word dapat diperbarui otomatis (klik kanan -> Update Field).</span>
                    </p>

                    {data.includeTableOfContents && (
                        <div className="bg-white p-4 rounded border text-sm text-gray-500 font-mono">
                            <p className="font-bold text-gray-700 mb-2">Preview Struktur (Updated):</p>
                            <ul className="list-decimal list-inside space-y-1 pl-2 text-xs">
                                <li>LEMBAR PENGESAHAN</li>
                                <li>DAFTAR ISI</li>
                                <li>BAB I PENDAHULUAN (Latar Belakang, Dasar Hukum, Tujuan, Manfaat)</li>
                                <li>BAB II KAJIAN PUSTAKA (Teori Pendukung)</li>
                                <li>BAB III ANALISIS KEGIATAN (Analisis SWOT)</li>
                                <li>BAB IV PELAKSANAAN KEGIATAN</li>
                                <li>BAB V STRUKTUR KEPANITIAAN (+ Uraian Tugas)</li>
                                <li>BAB VI RENCANA ANGGARAN</li>
                                <li>BAB VII PENUTUP</li>
                                <li>LAMPIRAN</li>
                            </ul>
                        </div>
                    )}
                 </div>
            </div>
        );
      case 'attachments':
        return (
            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <ClipboardList size={18} />
                            Jadwal Supervisi Guru
                        </h3>
                        <div className="flex gap-2">
                             {data.supervisionSchedule.length > 0 && (
                                <button onClick={() => setData(prev => ({...prev, supervisionSchedule: []}))} className="text-xs text-red-500 hover:underline">
                                    Hapus Tabel
                                </button>
                             )}
                            <button onClick={generateSupervisionSchedule} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                                Isi Semua Guru
                            </button>
                        </div>
                    </div>
                    
                    {data.supervisionSchedule.length === 0 ? (
                        <div className="bg-gray-50 border border-dashed p-6 rounded text-center text-gray-500 text-sm">
                            Belum ada jadwal supervisi. Klik "Isi Semua Guru" untuk membuat tabel otomatis dari database.
                        </div>
                    ) : (
                        <div className="overflow-x-auto border rounded max-h-96">
                             <table className="w-full text-xs text-left">
                                <thead className="bg-gray-100 font-medium sticky top-0">
                                    <tr>
                                        <th className="p-2 w-8">No</th>
                                        <th className="p-2 w-24">Hari/Tgl</th>
                                        <th className="p-2 w-20">Waktu</th>
                                        <th className="p-2">Nama Guru</th>
                                        <th className="p-2">Mapel</th>
                                        <th className="p-2 w-16">Kelas</th>
                                        <th className="p-2">Supervisor</th>
                                        <th className="p-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.supervisionSchedule.map((item, idx) => (
                                        <tr key={item.id}>
                                            <td className="p-2 text-center">{idx + 1}</td>
                                            <td className="p-1"><input className="w-full border rounded px-1" value={item.date} onChange={e => updateSupervisionRow(item.id, 'date', e.target.value)} /></td>
                                            <td className="p-1"><input className="w-full border rounded px-1" value={item.time} onChange={e => updateSupervisionRow(item.id, 'time', e.target.value)} /></td>
                                            <td className="p-2">{item.teacherName}</td>
                                            <td className="p-2">{item.subject}</td>
                                            <td className="p-2">{item.class}</td>
                                            <td className="p-1"><input className="w-full border rounded px-1" value={item.supervisor} placeholder="..." onChange={e => updateSupervisionRow(item.id, 'supervisor', e.target.value)} /></td>
                                            <td className="p-1"><button onClick={() => removeSupervisionItem(item.id)} className="text-red-400">×</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    )}
                </div>

                <div className="border-t pt-6">
                     <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                            <Users size={18} />
                            Daftar Hadir Guru
                        </h3>
                     <div className="flex items-center gap-2 bg-blue-50 p-4 rounded border border-blue-100">
                        <input 
                            type="checkbox" 
                            id="attendanceToggle"
                            className="w-5 h-5 text-blue-600 rounded"
                            checked={data.includeAttendanceList}
                            onChange={(e) => updateField('includeAttendanceList', e.target.checked)}
                        />
                        <div>
                            <label htmlFor="attendanceToggle" className="font-medium text-gray-800 text-sm">
                                Lampirkan Daftar Hadir (Absensi) Guru
                            </label>
                            <p className="text-xs text-gray-600">
                                Secara otomatis membuat halaman daftar hadir berisi semua nama guru untuk ditandatangani.
                            </p>
                        </div>
                     </div>
                </div>
            </div>
        );
      case 'closing':
        return (
          <div className="space-y-6">
             <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700">Indikator Keberhasilan</label>
                  <Tooltip text="Bagaimana kita tahu acara ini sukses? (Misal: 90% peserta hadir, hasil survei puas)." />
                </div>
                <AIGeneratorButton 
                  sectionName="Indikator Keberhasilan" 
                  context={data} 
                  promptGuidance="Sebutkan 3 indikator kuantitatif atau kualitatif untuk mengukur kesuksesan acara ini."
                  onGenerate={(t) => updateField('evaluationMetrics', t)} 
                />
              </div>
              <textarea 
                className="w-full border rounded p-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.evaluationMetrics}
                onChange={(e) => updateField('evaluationMetrics', e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Kata Penutup</label>
                <AIGeneratorButton 
                  sectionName="Penutup Proposal" 
                  context={data} 
                  promptGuidance="Buat kalimat penutup yang sopan, mengharapkan dukungan dan persetujuan dari pihak sekolah."
                  onGenerate={(t) => updateField('closing', t)} 
                />
              </div>
              <textarea 
                className="w-full border rounded p-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.closing}
                onChange={(e) => updateField('closing', e.target.value)}
                placeholder="Demikian proposal ini kami buat..."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row print:block">
      {/* Sidebar / Form Area - Hidden on Print */}
      <div className={`md:w-5/12 lg:w-4/12 bg-gray-50 border-r flex flex-col h-screen overflow-hidden print:hidden ${showPreviewMobile ? 'hidden' : 'flex'}`}>
        
        {/* Header */}
        <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FileText size={20} />
            </div>
            <h1 className="font-bold text-gray-800 leading-tight">EduPro<br/><span className="text-xs text-blue-600 font-normal">Proposal Generator</span></h1>
          </div>
          <div className="flex gap-2">
            <button onClick={saveDraft} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Simpan Draft">
              <Save size={18} />
            </button>
            <button onClick={() => setData(initialProposalState)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Reset Form">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => setShowPreviewMobile(true)} className="md:hidden p-2 text-blue-600 hover:bg-blue-50 rounded-full">
              Lihat Preview
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              {TABS.find(t => t.id === activeTab)?.icon}
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            {renderTabContent()}
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="bg-white border-t p-2 flex justify-between items-center overflow-x-auto gap-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] rounded-lg transition-all duration-200 ${activeTab === tab.id ? 'text-blue-600 bg-blue-50 scale-105 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1 whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className={`md:w-7/12 lg:w-8/12 bg-gray-200 h-screen overflow-y-auto print:w-full print:h-auto print:bg-white print:overflow-visible ${showPreviewMobile ? 'block' : 'hidden md:block'}`}>
        
        {/* Mobile Header for Preview */}
        <div className="md:hidden bg-white p-3 border-b flex justify-between items-center sticky top-0 z-20 print:hidden">
          <button onClick={() => setShowPreviewMobile(false)} className="text-gray-600 text-sm font-medium">
            ← Kembali ke Edit
          </button>
          <button onClick={handleDownloadWord} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1">
            <Download size={14} /> Word
          </button>
        </div>

        {/* Desktop Toolbar */}
        <div className="hidden md:flex justify-between items-center bg-gray-700 text-white p-3 px-6 sticky top-0 z-20 shadow-md print:hidden">
          <span className="text-sm font-medium opacity-90">Live Preview</span>
          <button 
            onClick={handleDownloadWord} 
            className="bg-white text-gray-900 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download size={16} />
            Cetak / Simpan Word
          </button>
        </div>

        {/* Document Render */}
        <div className="p-4 md:p-8 print:p-0">
          <ProposalPreview data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;