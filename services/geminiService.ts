import { GoogleGenAI, Schema, Type } from "@google/genai";
import { ProposalData, TEACHER_DATA } from "../types";
import { SCHOOL_CONTEXT_SUMMARY } from "../schoolContext";

// Note: In a real production app, this should be proxied through a backend to protect the key.
// Following the instructions to use process.env.API_KEY directly.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

const modelId = 'gemini-3-flash-preview'; 

export const generateSectionContent = async (
  section: string,
  context: Partial<ProposalData>,
  promptDetails: string
): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing.");
    return "API Key missing. Please configure process.env.API_KEY to use AI generation.";
  }

  try {
    const userPrompt = `
      Bertindaklah sebagai konsultan pendidikan profesional yang bekerja untuk SMA Islam Al-Ghozali.
      
      REFERENSI SEKOLAH (PENTING: Gunakan ini sebagai landasan nilai, visi, dan misi):
      ${SCHOOL_CONTEXT_SUMMARY}

      Tugas: Tuliskan konten yang SANGAT DETAIL, PANJANG, dan AKADEMIS untuk bagian "${section}" dari sebuah proposal kegiatan sekolah.
      Minimum Panjang: 300-500 kata jika memungkinkan. Gunakan bahasa formal Indonesia.
      
      Informasi Kegiatan Saat Ini:
      - Judul: ${context.title}
      - Jenis: ${context.programType}
      - Target Peserta: ${context.targetAudience || 'Siswa Sekolah'}
      
      Instruksi Tambahan:
      ${promptDetails}
      
      Pastikan narasi selaras dengan Visi dan Misi SMA Islam Al-Ghozali (Berakhlak Mulia, Berprestasi, Iptek & Imtaq).
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "Gagal menghasilkan konten.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
  }
};

export const generateFullProposal = async (
  title: string,
  schoolName: string
): Promise<any | null> => {
  if (!apiKey) return null;

  // Format list guru untuk prompt agar AI memilih dari data nyata
  const teacherList = TEACHER_DATA.map(t => `- ${t.name} (Guru ${t.subject})`).join("\n");

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      programType: { type: Type.STRING },
      background: { type: Type.STRING, description: "Latar belakang kegiatan SANGAT PANJANG (min 500 kata), mencakup urgensi, kondisi ideal vs realita, dan landasan filosofis." },
      legalBasis: { type: Type.STRING, description: "Daftar dasar hukum formal (UU, Permendikbud) yang relevan." },
      problemStatement: { type: Type.STRING, description: "Rumusan masalah mendetail." },
      objectives: { type: Type.STRING, description: "Tujuan kegiatan yang detail." },
      benefits: { type: Type.STRING, description: "Manfaat kegiatan bagi Siswa, Guru, dan Sekolah." },
      
      theoreticalFramework: { type: Type.STRING, description: "BAB II Kajian Pustaka (SANGAT PANJANG, min 1000 kata). Jelaskan teori pendidikan, kepemimpinan, atau teori relevan lainnya yang mendasari kegiatan ini." },
      
      swotAnalysis: { type: Type.STRING, description: "Analisis SWOT (Strength, Weakness, Opportunity, Threat) naratif mendetail." },
      
      targetAudience: { type: Type.STRING },
      theme: { type: Type.STRING },
      methodology: { type: Type.STRING },
      schedule: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING },
            activity: { type: Type.STRING },
            pic: { type: Type.STRING },
          }
        }
      },
      committee: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            position: { type: Type.STRING },
            name: { type: Type.STRING, description: "Pilih nama dari DAFTAR GURU yang tersedia." },
          }
        }
      },
      jobDescriptions: { type: Type.STRING, description: "Uraian tugas (Job Description) detail untuk setiap posisi panitia (Ketua, Sekretaris, dll) min 500 kata." },
      
      budget: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            quantity: { type: Type.INTEGER },
            price: { type: Type.INTEGER },
            source: { type: Type.STRING }
          }
        }
      },
      evaluationMetrics: { type: Type.STRING },
      closing: { type: Type.STRING },
    },
    required: ["background", "objectives", "schedule", "budget", "programType", "theoreticalFramework", "swotAnalysis", "jobDescriptions", "benefits"]
  };

  const prompt = `
    Buatkan proposal kegiatan sekolah yang SANGAT LENGKAP, PANJANG, DAN MENDALAM (Target output dokumen > 20 halaman).
    Judul Kegiatan: "${title}".
    Nama Sekolah: "${schoolName}".
    
    KONTEKS SEKOLAH (Wajib dirujuk):
    ${SCHOOL_CONTEXT_SUMMARY}

    DATABASE GURU:
    ${teacherList}

    Instruksi Khusus untuk Mencapai Panjang Dokumen > 20 Halaman:
    1. **Latar Belakang**: Tulis panjang lebar, mulai dari landasan filosofis pendidikan nasional, visi misi sekolah, hingga urgensi spesifik kegiatan.
    2. **Kajian Pustaka (Theoretical Framework)**: INI PALING PENTING. Tuliskan teori-teori akademis yang mendukung kegiatan ini. Misal jika LDKS, bahas teori kepemimpinan. Jika Pensi, bahas teori seni dan kreativitas. Buat ini sangat panjang.
    3. **Analisis SWOT**: Buat analisis mendalam.
    4. **Uraian Tugas Panitia**: Jangan hanya daftar nama. Tuliskan rincian tugas (job description) untuk Ketua, Sekretaris, Bendahara, Seksi Acara, Seksi Konsumsi, dll secara detail.
    5. **Manfaat**: Jabarkan manfaat untuk siswa, guru, sekolah, dan masyarakat.

    Format output JSON harus valid. Gunakan bahasa Indonesia baku dan formal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    console.error("Full generation error", e);
    throw e;
  }
}