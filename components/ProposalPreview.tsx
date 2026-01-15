import React from 'react';
import { ProposalData, TEACHER_DATA } from '../types';

interface ProposalPreviewProps {
  data: ProposalData;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const totalBudget = data.budget.reduce((sum, item) => sum + item.total, 0);

  // Derive unique teachers for attendance list
  const uniqueTeachers = Array.from(new Set(TEACHER_DATA.map(t => t.name))).sort();

  return (
    <div className="bg-white shadow-lg p-8 min-h-screen text-gray-800 print:shadow-none print:p-0 max-w-4xl mx-auto border border-gray-200 print:border-none">
      
      {/* --- KOP SURAT (HEADER) --- */}
      <div>
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
            {data.foundationName && (
                <h3 className="text-lg font-bold uppercase leading-tight">{data.foundationName}</h3>
            )}
            <h2 className="text-xl font-bold uppercase tracking-wider leading-tight mt-1">{data.schoolName}</h2>
            <p className="text-sm text-gray-600 mt-1 font-serif">{data.schoolAddress}</p>
        </div>

        <div className="text-center mb-12">
            <h2 className="text-xl font-bold uppercase underline">PROPOSAL KEGIATAN</h2>
            <h3 className="text-lg font-semibold mt-1">{data.title}</h3>
        </div>

        {/* --- LEMBAR PENGESAHAN (Preview) --- */}
        <section className="mb-12 border border-dashed border-gray-300 p-6 rounded bg-gray-50">
            <div className="text-center mb-8">
                <h4 className="font-bold text-lg uppercase underline">LEMBAR PENGESAHAN</h4>
            </div>
            <p className="text-center mb-8 text-sm">
                Proposal ini telah diperiksa dan disetujui pada tanggal: <br/>
                <span className="font-semibold">{data.approvalDate}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-y-12 gap-x-4 text-center text-sm">
                {data.approvalSignatories.map((sig) => (
                    <div key={sig.id} className={sig.role.toLowerCase().includes('kepala') || sig.role.toLowerCase().includes('yayasan') ? "col-span-2 mt-4" : ""}>
                        <p className="font-medium mb-16">{sig.role}</p>
                        <p className="font-bold underline">{sig.name}</p>
                        {sig.idNumber && <p className="text-xs">{sig.idNumber}</p>}
                    </div>
                ))}
            </div>
        </section>

        {/* --- DAFTAR ISI (Placeholder) --- */}
        {data.includeTableOfContents && (
             <section className="mb-12 border border-dashed border-gray-300 p-6 rounded bg-gray-50">
                <div className="text-center mb-4">
                    <h4 className="font-bold text-lg uppercase">DAFTAR ISI</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-500 italic">
                    <div className="flex justify-between"><span>LEMBAR PENGESAHAN</span><span>i</span></div>
                    <div className="flex justify-between"><span>DAFTAR ISI</span><span>ii</span></div>
                    <div className="flex justify-between"><span>BAB I PENDAHULUAN</span><span>1</span></div>
                    <div className="flex justify-between"><span>BAB II DETAIL PELAKSANAAN</span><span>2</span></div>
                    <div className="flex justify-between"><span>BAB III SUSUNAN ACARA</span><span>3</span></div>
                    <div className="flex justify-between"><span>... (Daftar Isi akan digenerate otomatis di file Word)</span><span>...</span></div>
                </div>
             </section>
        )}

        <div className="space-y-6 text-justify leading-relaxed">
            
            {/* A. Pendahuluan */}
            <section>
            <h4 className="font-bold text-lg uppercase mb-2 border-b border-gray-300 inline-block">A. Pendahuluan</h4>
            
            <div className="mb-4">
                <h5 className="font-bold mb-1">1. Latar Belakang</h5>
                <p className="whitespace-pre-wrap text-sm">{data.background || 'Belum diisi...'}</p>
            </div>

            <div className="mb-4">
                <h5 className="font-bold mb-1">2. Rumusan Masalah</h5>
                <p className="whitespace-pre-wrap text-sm">{data.problemStatement || 'Belum diisi...'}</p>
            </div>

            <div className="mb-4">
                <h5 className="font-bold mb-1">3. Tujuan Kegiatan</h5>
                <p className="whitespace-pre-wrap text-sm">{data.objectives || 'Belum diisi...'}</p>
            </div>
            </section>

            {/* B. Detail Kegiatan */}
            <section>
            <h4 className="font-bold text-lg uppercase mb-2 border-b border-gray-300 inline-block">B. Detail Pelaksanaan</h4>
            
            {data.theme && (
                <div className="mb-4">
                <h5 className="font-bold mb-1">1. Tema Kegiatan</h5>
                <p className="text-sm">{data.theme}</p>
                </div>
            )}

            <div className="mb-4">
                <h5 className="font-bold mb-1">{data.theme ? '2. ' : '1. '} Sasaran dan Peserta</h5>
                <p className="whitespace-pre-wrap text-sm">{data.targetAudience || 'Belum diisi...'}</p>
            </div>

            <div className="mb-4">
                <h5 className="font-bold mb-1">{data.theme ? '3. ' : '2. '} Waktu dan Tempat</h5>
                <div className="text-sm pl-4">
                <p><span className="font-semibold w-24 inline-block">Hari/Tanggal:</span> {data.startDate} s.d. {data.endDate}</p>
                <p><span className="font-semibold w-24 inline-block">Tempat:</span> {data.location}</p>
                </div>
            </div>

            <div className="mb-4">
                <h5 className="font-bold mb-1">{data.theme ? '4. ' : '3. '} Metode / Rencana Kegiatan</h5>
                <p className="whitespace-pre-wrap text-sm">{data.methodology || 'Belum diisi...'}</p>
            </div>
            </section>

            {/* C. Jadwal */}
            <section>
            <h4 className="font-bold text-lg uppercase mb-2 border-b border-gray-300 inline-block">C. Susunan Acara</h4>
            <table className="w-full text-sm border-collapse border border-black mt-2">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-center w-32">Waktu</th>
                    <th className="border border-black p-2 text-center">Kegiatan</th>
                    <th className="border border-black p-2 text-center w-40">Penanggung Jawab</th>
                </tr>
                </thead>
                <tbody>
                {data.schedule.map((item, idx) => (
                    <tr key={idx}>
                    <td className="border border-black p-2 text-center">{item.time}</td>
                    <td className="border border-black p-2">{item.activity}</td>
                    <td className="border border-black p-2 text-center">{item.pic}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </section>

            {/* D. Kepanitiaan (Conditional) */}
            {data.isCommitteeEnabled && (
                <section>
                <h4 className="font-bold text-lg uppercase mb-2 border-b border-gray-300 inline-block mt-4">D. Susunan Panitia</h4>
                <table className="w-full text-sm border-collapse border border-black mt-2">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-center w-48">Jabatan</th>
                        <th className="border border-black p-2 text-center">Nama</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.committee.map((item, idx) => (
                        <tr key={idx}>
                        <td className="border border-black p-2 font-medium">{item.position}</td>
                        <td className="border border-black p-2">{item.name}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </section>
            )}

            {/* E. Anggaran */}
            <section className="page-break">
            <h4 className="font-bold text-lg uppercase mb-2 border-b border-gray-300 inline-block mt-4">E. Rencana Anggaran</h4>
            <table className="w-full text-sm border-collapse border border-black mt-2">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-center">Uraian</th>
                    <th className="border border-black p-2 text-center w-20">Vol</th>
                    <th className="border border-black p-2 text-center w-32">Harga Satuan</th>
                    <th className="border border-black p-2 text-center w-32">Total</th>
                    <th className="border border-black p-2 text-center w-32">Sumber</th>
                </tr>
                </thead>
                <tbody>
                {data.budget.map((item, idx) => (
                    <tr key={idx}>
                    <td className="border border-black p-2">{item.item}</td>
                    <td className="border border-black p-2 text-center">{item.quantity}</td>
                    <td className="border border-black p-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="border border-black p-2 text-right">{formatCurrency(item.total)}</td>
                    <td className="border border-black p-2 text-center">{item.source}</td>
                    </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="border border-black p-2 text-center">TOTAL ESTIMASI BIAYA</td>
                    <td className="border border-black p-2 text-right">{formatCurrency(totalBudget)}</td>
                    <td className="border border-black p-2"></td>
                </tr>
                </tbody>
            </table>
            </section>

            {/* F. Penutup */}
            <section>
            <h4 className="font-bold text-lg uppercase mb-2 border-b border-gray-300 inline-block mt-4">F. Penutup</h4>
            <p className="whitespace-pre-wrap text-sm mb-4">{data.closing || 'Demikian proposal ini kami buat...'}</p>
            </section>

            {/* Tanda Tangan */}
            <section className="mt-12 page-break">
            <div className="flex justify-between text-center px-8">
                {data.isCommitteeEnabled && (
                    <div>
                    <p className="mb-20">Ketua Pelaksana</p>
                    <p className="font-bold underline">{data.committee.find(c => c.position.toLowerCase().includes('ketua'))?.name || '...................'}</p>
                    </div>
                )}
                <div className={!data.isCommitteeEnabled ? 'mx-auto' : ''}>
                <p className="mb-20">Sekretaris/Penanggung Jawab</p>
                <p className="font-bold underline">{data.committee.find(c => c.position.toLowerCase().includes('sekretaris'))?.name || '...................'}</p>
                </div>
            </div>
            <div className="text-center mt-12">
                <p className="mb-20">Mengetahui,<br/>Kepala Sekolah</p>
                <p className="font-bold underline">{data.principalName || '...................'}</p>
                <p className="text-sm">NUPTK. ...........................</p>
            </div>
            </section>
        </div>

      {/* LAMPIRAN - JADWAL SUPERVISI */}
      {data.supervisionSchedule.length > 0 && (
          <div className="page-break mt-8">
            <h2 className="text-center font-bold text-xl uppercase mb-6 underline">LAMPIRAN 1: JADWAL SUPERVISI GURU</h2>
             <table className="w-full text-sm border-collapse border border-black mt-2">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-10">No</th>
                        <th className="border border-black p-2">Hari/Tanggal</th>
                        <th className="border border-black p-2">Waktu</th>
                        <th className="border border-black p-2">Nama Guru</th>
                        <th className="border border-black p-2">Mata Pelajaran</th>
                        <th className="border border-black p-2">Kelas</th>
                        <th className="border border-black p-2">Supervisor</th>
                    </tr>
                </thead>
                <tbody>
                    {data.supervisionSchedule.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border border-black p-2 text-center">{idx + 1}</td>
                            <td className="border border-black p-2 text-center">{item.date}</td>
                            <td className="border border-black p-2 text-center">{item.time}</td>
                            <td className="border border-black p-2">{item.teacherName}</td>
                            <td className="border border-black p-2">{item.subject}</td>
                            <td className="border border-black p-2 text-center">{item.class}</td>
                            <td className="border border-black p-2">{item.supervisor}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      )}

      {/* LAMPIRAN - DAFTAR HADIR */}
      {data.includeAttendanceList && (
          <div className="page-break mt-8">
            <h2 className="text-center font-bold text-xl uppercase mb-2">DAFTAR HADIR GURU</h2>
            <h3 className="text-center font-semibold mb-6 uppercase">{data.title}</h3>
            
            <table className="w-full text-sm border-collapse border border-black mt-2">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-10">No</th>
                        <th className="border border-black p-2">Nama Guru</th>
                        <th className="border border-black p-2 w-48">Tanda Tangan</th>
                        <th className="border border-black p-2 w-32">Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    {uniqueTeachers.map((name, idx) => (
                        <tr key={idx}>
                            <td className="border border-black p-2 text-center">{idx + 1}</td>
                            <td className="border border-black p-2 px-4">{name}</td>
                            <td className="border border-black p-2">
                                <span className={`block text-xs text-gray-400 ${idx % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                    {idx + 1} ...........
                                </span>
                            </td>
                            <td className="border border-black p-2"></td>
                        </tr>
                    ))}
                </tbody>
             </table>

             <div className="mt-8 flex justify-end px-8">
                <div className="text-center">
                    <p className="mb-20">Bogor, .............................. 2024</p>
                    <p className="font-bold underline">{data.principalName || 'Kepala Sekolah'}</p>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};