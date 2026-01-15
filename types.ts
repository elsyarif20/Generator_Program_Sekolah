
export enum ProgramType {
  INTRAKURIKULER = 'Intrakurikuler (KBM & Rutinitas)',
  EKSTRAKURIKULER = 'Ekstrakurikuler',
  ACARA_SEKOLAH = 'Acara Sekolah (Pentas Seni/Lomba)',
  PENGEMBANGAN_SISWA = 'Pengembangan Siswa (LDK/Literasi)',
  PENGEMBANGAN_GURU = 'Pengembangan & Pelatihan Guru',
  KEGIATAN_OSIS = 'Kegiatan OSIS/HMJ',
  LAINNYA = 'Lainnya'
}

export interface Budget {
  id: string;
  item: string;
  quantity: number;
  price: number;
  total: number;
  source: string; // e.g., Dana BOS, Iuran
}

export interface CommitteeMember {
  id: string;
  position: string;
  name: string;
  contact: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  pic: string; // Person In Charge
}

export interface SupervisionItem {
  id: string;
  date: string;
  time: string;
  teacherName: string;
  subject: string;
  class: string;
  supervisor: string;
}

export interface Signatory {
  id: string;
  role: string; // e.g. Ketua Panitia, Wakasek Kesiswaan
  name: string;
  idNumber?: string; // NIP or NUPTK
}

export interface ProposalData {
  // Sekolah Info
  foundationName?: string; 
  schoolName: string;
  schoolAddress: string;
  principalName: string; // New: Nama Kepala Sekolah
  logoUrl?: string; 
  
  // Basic Info
  title: string;
  programType: ProgramType;
  academicYear: string;
  
  // BAB I: Pendahuluan
  background: string;
  legalBasis: string; // Dasar Hukum (New)
  problemStatement: string; 
  objectives: string; 
  benefits: string; // Manfaat Kegiatan (New)
  
  // BAB II: Kajian Pustaka (New - for length)
  theoreticalFramework: string;

  // BAB III: Analisis Kegiatan (New)
  swotAnalysis: string;

  // BAB IV: Detail Kegiatan
  theme?: string; 
  targetAudience: string; 
  methodology: string; 
  
  // Tables
  schedule: ScheduleItem[];
  
  // Dynamic Sections
  isCommitteeEnabled: boolean; 
  committee: CommitteeMember[];
  jobDescriptions: string; // Uraian Tugas Panitia (New - for length)
  
  budget: Budget[];
  
  // Lembar Pengesahan & Daftar Isi (New)
  includeTableOfContents: boolean;
  approvalSignatories: Signatory[];
  approvalDate: string;

  // Penutup & Lainnya
  location: string;
  startDate: string;
  endDate: string;
  evaluationMetrics: string; 
  closing: string; 
  
  // Attachments
  supervisionSchedule: SupervisionItem[]; 
  includeAttendanceList: boolean; 
  
  // Optional Sections
  executiveSummary?: string;
  riskAnalysis?: string;
}

export const initialProposalState: ProposalData = {
  foundationName: 'YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI',
  schoolName: 'SMA ISLAM AL-GHOZALI',
  schoolAddress: 'Jl. Permata No. 19 Curug Gunungsindur Kab. Bogor 16340',
  principalName: 'Antoni Firdaus, M.Pd.', 
  title: '',
  programType: ProgramType.ACARA_SEKOLAH,
  academicYear: '2025/2026', 
  background: '',
  legalBasis: `1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.\n2. Peraturan Pemerintah Nomor 19 Tahun 2005 tentang Standar Nasional Pendidikan.\n3. Peraturan Menteri Pendidikan Nasional Nomor 39 Tahun 2008 tentang Pembinaan Kesiswaan.\n4. Program Kerja Sekolah Tahun Pelajaran 2025/2026.\n5. Program Kerja OSIS Masa Bakti 2025/2026.\n6. Rapat Dewan Guru dan Pengurus OSIS.`,
  problemStatement: '',
  objectives: '',
  benefits: '',
  theoreticalFramework: '',
  swotAnalysis: '',
  targetAudience: '',
  methodology: '',
  location: '',
  startDate: '',
  endDate: '',
  evaluationMetrics: '',
  closing: '',
  schedule: [
    { id: '1', time: '08:00 - 09:00', activity: 'Registrasi Peserta', pic: 'Sekretaris' }
  ],
  isCommitteeEnabled: true,
  committee: [
    { id: '1', position: 'Ketua Pelaksana', name: '', contact: '' },
    { id: '2', position: 'Sekretaris', name: '', contact: '' }
  ],
  jobDescriptions: '',
  budget: [
    { id: '1', item: 'Spanduk Kegiatan', quantity: 1, price: 100000, total: 100000, source: 'Dana Sekolah' }
  ],
  includeTableOfContents: true,
  approvalDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  approvalSignatories: [
    { id: '1', role: 'Ketua Pelaksana', name: '.........................', idNumber: '' },
    { id: '2', role: 'Sekretaris', name: '.........................', idNumber: '' },
    { id: '3', role: 'Wakasek Kesiswaan', name: '.........................', idNumber: 'NUPTK. ...................' },
    { id: '4', role: 'Kepala Sekolah', name: 'Antoni Firdaus, M.Pd.', idNumber: 'NUPTK. ...................' },
    { id: '5', role: 'Pengawas Pembina', name: '.........................', idNumber: 'NIP. ...................' }
  ],
  supervisionSchedule: [],
  includeAttendanceList: false
};

export const PROGRAM_REFERENCES = [
  // --- PROGRAM PKKS (Penilaian Kinerja Kepala Sekolah) ---
  { title: "Sosialisasi Visi, Misi, dan Tujuan Sekolah", type: ProgramType.ACARA_SEKOLAH },
  { title: "Penyusunan RKJM & RKT (Rencana Kerja Jangka Menengah & Tahunan)", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Rapat Kerja Penyusunan RAKS & RKAS", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Workshop Pengembangan Kurikulum Satuan Pendidikan (KSP)", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Program Penguatan Literasi dan Numerasi Sekolah", type: ProgramType.INTRAKURIKULER },
  { title: "Pelatihan Digitalisasi Sekolah & Akun Belajar.id", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Kegiatan Komunitas Belajar (Kombel) Guru", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Evaluasi Diri Guru (Evadir) & Refleksi Program", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Laporan Pertanggungjawaban (LPJ) BOS & Keuangan", type: ProgramType.ACARA_SEKOLAH },
  { title: "Penyusunan Rencana Pengembangan Sekolah (RPS)", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Monitoring dan Evaluasi (Monev) Program Sekolah", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Diseminasi Hasil Pelatihan & Praktik Baik Guru", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Gelar Karya Inovasi & Kewirausahaan Sekolah", type: ProgramType.ACARA_SEKOLAH },
  { title: "Penandatanganan MoU & Kerjasama Kemitraan", type: ProgramType.ACARA_SEKOLAH },
  { title: "Pelaksanaan Penilaian Kinerja Guru (PKG)", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Supervisi Akademik & Tenaga Kependidikan", type: ProgramType.PENGEMBANGAN_GURU },

  // Program Unggulan & Khas Al-Ghozali (From PDF)
  { title: "Program Tahfidz Al-Qur'an Pagi (Metode Tilawati)", type: ProgramType.INTRAKURIKULER },
  { title: "Nature Research (Penelitian Alam)", type: ProgramType.INTRAKURIKULER },
  { title: "Al-Ghozali Science Olympiad (ASO)", type: ProgramType.ACARA_SEKOLAH },
  { title: "Kegiatan Gema Al-Kahfi (Jumat)", type: ProgramType.INTRAKURIKULER },
  { title: "Program Sukses UTBK Kelas XII", type: ProgramType.PENGEMBANGAN_SISWA },
  { title: "Halaqah / Mentoring Keislaman", type: ProgramType.PENGEMBANGAN_SISWA },
  { title: "Budidaya Maggot (Black Soldier Fly)", type: ProgramType.PENGEMBANGAN_SISWA },
  { title: "Kampanye Stop Bullying", type: ProgramType.PENGEMBANGAN_SISWA },
  { title: "Market Day (Kewirausahaan)", type: ProgramType.ACARA_SEKOLAH },

  // Ekstrakurikuler Al-Ghozali (From PDF)
  { title: "Administrasi Perkantoran (Wajib Kls XII)", type: ProgramType.EKSTRAKURIKULER },
  { title: "Ekstrakurikuler Dirosah Islamiyah (Timur Tengah)", type: ProgramType.EKSTRAKURIKULER },
  { title: "Klub Bahasa Arab (Arabic Club)", type: ProgramType.EKSTRAKURIKULER },
  { title: "Klub Bahasa Inggris (English Club)", type: ProgramType.EKSTRAKURIKULER },
  { title: "Desain Grafis & Multimedia", type: ProgramType.EKSTRAKURIKULER },
  { title: "Koding dan Kecerdasan Artifisial (AI)", type: ProgramType.EKSTRAKURIKULER },
  { title: "Jurnalistik Sekolah", type: ProgramType.EKSTRAKURIKULER },
  { title: "Seni Tari Saman", type: ProgramType.EKSTRAKURIKULER },
  { title: "Karate", type: ProgramType.EKSTRAKURIKULER },
  { title: "Liga Olahraga Al-Ghozali (Futsal/Basket)", type: ProgramType.EKSTRAKURIKULER },

  // Evaluasi & Penilaian (Baru Ditambahkan)
  { title: "Penilaian Tengah Semester (PTS)", type: ProgramType.INTRAKURIKULER },
  { title: "Penilaian Sumatif Akhir Semester (PSAS)", type: ProgramType.INTRAKURIKULER },
  { title: "Penilaian Sumatif Akhir Tahun (PSAT)", type: ProgramType.INTRAKURIKULER },
  { title: "Penilaian Sumatif Akhir Jenjang (PSAJ)", type: ProgramType.INTRAKURIKULER },
  { title: "Program Kerja Try Out", type: ProgramType.INTRAKURIKULER },

  // Umum
  { title: "Peringatan Hari Besar Islam (PHBI)", type: ProgramType.ACARA_SEKOLAH },
  { title: "Pesantren Kilat Ramadhan", type: ProgramType.ACARA_SEKOLAH },
  { title: "Upacara Bendera & Paskibraka", type: ProgramType.INTRAKURIKULER },
  { title: "Latihan Dasar Kepemimpinan Siswa (LDKS)", type: ProgramType.KEGIATAN_OSIS },
  { title: "Pentas Seni dan Budaya", type: ProgramType.ACARA_SEKOLAH },
  
  // Guru
  { title: "Workshop Pengembangan Modul Ajar", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Pelatihan Kurikulum Merdeka", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "In House Training (IHT) Guru", type: ProgramType.PENGEMBANGAN_GURU },
  { title: "Program Rencana Tindak Lanjut Supervisi", type: ProgramType.PENGEMBANGAN_GURU },
];

// Data Guru dari Gambar
export const TEACHER_DATA = [
  // PENDIDIKAN AGAMA ISLAM
  { subject: "Pendidikan Agama Islam", name: "Nurlaila, S.Ag", classes: "X, XII" },
  { subject: "Pendidikan Agama Islam", name: "Sadam Hamzah, SHI", classes: "X" },
  { subject: "Pendidikan Agama Islam", name: "Muhammad Suhail, S.Pd", classes: "XI" },
  
  // Pendidikan Pancasila
  { subject: "Pendidikan Pancasila", name: "Rendi Ramadhan, S.Pd", classes: "X, XI" },
  { subject: "Pendidikan Pancasila", name: "Antoni Firdaus, M.Pd", classes: "XII" },

  // Bahasa Indonesia
  { subject: "Bahasa Indonesia", name: "H. Asep Saepudin, M.Pd", classes: "X" },
  { subject: "Bahasa Indonesia", name: "Hj. Barrirotul Choiriyah, SEI", classes: "X, XI" },
  { subject: "Bahasa Indonesia", name: "Edi Sanjaya, S.Pd", classes: "XI" },
  { subject: "Bahasa Indonesia", name: "Fadilah Abidana, M.Pd", classes: "XII" },

  // Bahasa Inggris
  { subject: "Bahasa Inggris", name: "Muslich Anwar, M.Pd", classes: "X, XII" },
  { subject: "Bahasa Inggris", name: "Zaini Fikri, S.Pd,I", classes: "X" },
  { subject: "Bahasa Inggris", name: "Lulu Zahrotunnisa, S.Pd", classes: "X" },
  { subject: "Bahasa Inggris", name: "Fadilah Abidana, M.Pd", classes: "XI" },
  { subject: "Bahasa Inggris", name: "Ahmad Firdaus, S.Ag", classes: "XI" },
  { subject: "Bahasa Inggris", name: "Mursyid Anwar, M.Pd", classes: "XII" },

  // Matematika
  { subject: "Matematika", name: "Mali, S.Pd", classes: "X, XI" },
  { subject: "Matematika", name: "Nurachman, M.Pd", classes: "XII" },

  // Matematika Tingkat Lanjut
  { subject: "Matematika Tingkat Lanjut", name: "Putri Dina Oktavia, S.Pd", classes: "XI" },
  { subject: "Matematika Tingkat Lanjut", name: "Rizki Karomah, S.Pd", classes: "XII" },

  // Sejarah
  { subject: "Sejarah", name: "Sadam Hamzah, SHI", classes: "X" },
  { subject: "Sejarah", name: "M. Hidayatu Rusdy, SH", classes: "XI" },
  { subject: "Sejarah", name: "Saleha Mufida, M.Han", classes: "XII" },

  // Fisika
  { subject: "Fisika", name: "Rizki Karomah, S.Si", classes: "X, XI, XII" },

  // Kimia
  { subject: "Kimia", name: "Ir. Rahmawati, M.Pd", classes: "X, XI, XII" },

  // Biologi
  { subject: "Biologi", name: "Padlin, M.Pd", classes: "X, XI, XII" },

  // Ekonomi
  { subject: "Ekonomi", name: "Doni Subiyanto, SE", classes: "X, XII" },
  { subject: "Ekonomi", name: "Khairil Fahmi", classes: "X" },
  { subject: "Ekonomi", name: "Hj. Barrirotul Choiriyah, SEI", classes: "XI" },

  // Geografi
  { subject: "Geografi", name: "Hj. Barrirotul Choiriyah, SEI", classes: "X" },
  { subject: "Geografi", name: "Doni Subiyanto, SE", classes: "X, XI" },
  { subject: "Geografi", name: "Adam Hafidz, S.M", classes: "XII" },

  // Sosiologi
  { subject: "Sosiologi", name: "Liyas Syarifudin, M.Pd", classes: "X, XI, XII" },

  // Antropologi
  { subject: "Antropologi", name: "Muhammad Hidayatu Rusdy, SH", classes: "XI" },
  { subject: "Antropologi", name: "Saleha Mufida, M.Han", classes: "XII" },

  // Penjaskes
  { subject: "Penjaskes", name: "Toni, S.Go", classes: "X" },
  { subject: "Penjaskes", name: "Wintarsa, S.Pd.I", classes: "XI, XII" },

  // Informatika
  { subject: "Informatika", name: "Adam Hafidz, SM", classes: "X" },
  { subject: "Informatika", name: "Fadhilah, S.Pd", classes: "X" },
  { subject: "Informatika", name: "Muhammad Rahul Sayyid", classes: "XI" },
  { subject: "Informatika", name: "Ahmad Jaenilma, S.Kom", classes: "XII" },

  // Life Skill
  { subject: "Life Skill", name: "Adam Hafidz, SM", classes: "X" },
  { subject: "Life Skill", name: "Fadhilah, S.Pd", classes: "X" },
  { subject: "Life Skill", name: "Hafidz Hidayat, S.Pd", classes: "XI" },
  { subject: "Life Skill", name: "Fadhillah, S.Pd", classes: "XII" },

  // Bahasa Sunda
  { subject: "Bahasa Sunda", name: "Siti Nurzulfiyah, S.Pd", classes: "X, XI, XII" },

  // Al Qur'an
  { subject: "Al Qur'an", name: "Ahmad Fahrudin", classes: "X" },
  { subject: "Al Qur'an", name: "Namin, S.Pd.I", classes: "XI, XII" },

  // Tahfidz
  { subject: "Tahfidz", name: "Khairil Fahmi, S.Pd", classes: "X" },
  { subject: "Tahfidz", name: "Fadhilah, S.Pd", classes: "XII" },

  // Hadits
  { subject: "Hadits", name: "Syahroni", classes: "X, XII" },

  // Fiqih
  { subject: "Fiqih", name: "Muhammad Suhail, S.Pd", classes: "X, XI" },
  { subject: "Fiqih", name: "Khairil Fahmi, S.Pd", classes: "XII" },

  // Bahasa Arab
  { subject: "Bahasa Arab", name: "Muhammad Rahul Sayyid", classes: "X" },
  { subject: "Bahasa Arab", name: "M. Alief Nugraha Afta", classes: "XI, XII" },
];
