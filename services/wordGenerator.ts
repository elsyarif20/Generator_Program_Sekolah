import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  Header,
  Footer,
  PageNumber,
  UnderlineType,
  ImageRun,
  PageBreak,
  HeadingLevel,
  TableOfContents
} from "docx";
import FileSaver from "file-saver";
import { ProposalData, TEACHER_DATA } from "../types";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

// Helper untuk membuat cell tabel dengan border standar
const createTextCell = (text: string, bold = false, align = AlignmentType.LEFT, colSpan = 1) => {
  return new TableCell({
    children: [new Paragraph({ 
        alignment: align,
        children: [new TextRun({ text, bold, font: "Times New Roman", size: 24 })] // size 24 = 12pt
    })],
    columnSpan: colSpan,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
};

const createHeader = (text: string) => {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                bold: true,
                font: "Times New Roman",
                size: 28, // 14pt
            }),
        ],
        spacing: { before: 200, after: 100 },
        heading: HeadingLevel.HEADING_1, // Critical for TOC
    });
};

const createSubHeader = (text: string) => {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                bold: true,
                font: "Times New Roman",
                size: 24, // 12pt
            }),
        ],
        spacing: { before: 100, after: 50 },
    });
};

const createNormalText = (text: string) => {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                font: "Times New Roman",
                size: 24, // 12pt
            }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360, after: 200 }, // 1.5 line spacing (240 = 1, 360 = 1.5) + after spacing
    });
};

export const generateWordDocument = async (data: ProposalData) => {
  
  // 1. HEADER HALAMAN ISI (KOP) - Cover Page content
  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: data.foundationName || "", bold: true, size: 28, font: "Times New Roman" }),
      ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: data.schoolName, bold: true, size: 32, font: "Times New Roman" }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: data.schoolAddress, size: 20, font: "Times New Roman" }),
        ],
        border: { bottom: { style: BorderStyle.DOUBLE, size: 6, space: 1, color: "000000" } },
        spacing: { after: 400 }
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({ text: "PROPOSAL KEGIATAN", bold: true, underline: { type: UnderlineType.SINGLE }, size: 28, font: "Times New Roman" }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({ text: data.title.toUpperCase(), bold: true, size: 24, font: "Times New Roman" }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({ text: `Tahun Ajaran ${data.academicYear}`, italics: true, size: 22, font: "Times New Roman" }),
        ],
        spacing: { after: 400 }
    }),
  ];

  // 2. LEMBAR PENGESAHAN (APPROVAL SHEET)
  const approvalPage: any[] = [];
  
  if (data.approvalSignatories.length > 0) {
      approvalPage.push(new Paragraph({ pageBreakBefore: true }));
      approvalPage.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "LEMBAR PENGESAHAN", bold: true, size: 28, font: "Times New Roman", underline: { type: UnderlineType.SINGLE } })],
        spacing: { after: 200 }
      }));
      approvalPage.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Proposal ini telah diperiksa dan disetujui pada tanggal: ${data.approvalDate}`, font: "Times New Roman", size: 24 })],
        spacing: { after: 400 }
      }));

      // Construct Signature Table
      const sigs = [...data.approvalSignatories];
      const rows: TableRow[] = [];
      
      for (let i = 0; i < sigs.length; i += 2) {
          const leftSig = sigs[i];
          const rightSig = sigs[i + 1];

          if (!rightSig) {
             rows.push(new TableRow({
                children: [
                    new TableCell({ children: [], width: { size: 25, type: WidthType.PERCENTAGE }, borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} } }), // Spacer
                    new TableCell({
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: leftSig.role, font: "Times New Roman", size: 24 })] }),
                            new Paragraph({ text: "", spacing: { after: 1200 } }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: leftSig.name, bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 24 })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: leftSig.idNumber || "", size: 20, font: "Times New Roman" })] }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                         borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} }
                    }),
                    new TableCell({ children: [], width: { size: 25, type: WidthType.PERCENTAGE }, borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} } }), // Spacer
                ]
             }));
          } else {
             rows.push(new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: leftSig.role, font: "Times New Roman", size: 24 })] }),
                            new Paragraph({ text: "", spacing: { after: 1200 } }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: leftSig.name, bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 24 })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: leftSig.idNumber || "", size: 20, font: "Times New Roman" })] }),
                        ],
                        borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} }
                    }),
                    new TableCell({ children: [], width: { size: 10, type: WidthType.PERCENTAGE }, borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} } }), // Spacer
                    new TableCell({
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: rightSig.role, font: "Times New Roman", size: 24 })] }),
                            new Paragraph({ text: "", spacing: { after: 1200 } }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: rightSig.name, bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 24 })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: rightSig.idNumber || "", size: 20, font: "Times New Roman" })] }),
                        ],
                        borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} }
                    }),
                ]
             }));
          }
          rows.push(new TableRow({ children: [ new TableCell({ children: [new Paragraph({text: "", spacing: {after: 400}})], columnSpan: 3, borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} } }) ] }));
      }

      const sigTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: rows,
          borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE}, insideHorizontal: {style: BorderStyle.NONE}, insideVertical: {style: BorderStyle.NONE} }
      });
      approvalPage.push(sigTable);
  }

  // 3. TABLE OF CONTENTS
  const tocPage: any[] = [];
  if (data.includeTableOfContents) {
      tocPage.push(new Paragraph({ pageBreakBefore: true }));
      tocPage.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "DAFTAR ISI", bold: true, size: 28, font: "Times New Roman" })],
          spacing: { after: 200 }
      }));
      
      tocPage.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "(Klik Kanan pada area ini > Update Field untuk memunculkan nomor halaman otomatis)", italics: true, color: "888888", size: 16, font: "Times New Roman" })],
          spacing: { after: 200 }
      }));

      tocPage.push(new TableOfContents("Summary", {
        hyperlink: true,
        headingStyleRange: "1-5",
      }));
  }

  // BAB I. Pendahuluan
  const sectionI = [
      new Paragraph({ pageBreakBefore: true, children: [], spacing: { after: 0 }}), 
      createHeader("BAB I. PENDAHULUAN"),
      createSubHeader("1.1. Latar Belakang"),
      createNormalText(data.background || "-"),
      createSubHeader("1.2. Dasar Hukum"),
      createNormalText(data.legalBasis || "-"),
      createSubHeader("1.3. Rumusan Masalah"),
      createNormalText(data.problemStatement || "-"),
      createSubHeader("1.4. Tujuan Kegiatan"),
      createNormalText(data.objectives || "-"),
      createSubHeader("1.5. Manfaat Kegiatan"),
      createNormalText(data.benefits || "-"),
  ];

  // BAB II. Kajian Pustaka
  const sectionII = [
      new Paragraph({ pageBreakBefore: true, children: [], spacing: { after: 0 }}), 
      createHeader("BAB II. KAJIAN PUSTAKA"),
      createNormalText(data.theoreticalFramework || "Belum ada kajian pustaka."),
  ];

  // BAB III. Analisis Kegiatan
  const sectionIII = [
      new Paragraph({ pageBreakBefore: true, children: [], spacing: { after: 0 }}), 
      createHeader("BAB III. ANALISIS KEGIATAN"),
      createSubHeader("3.1. Analisis SWOT"),
      createNormalText(data.swotAnalysis || "-"),
  ];

  // BAB IV. Pelaksanaan
  const sectionIV = [
      new Paragraph({ pageBreakBefore: true, children: [], spacing: { after: 0 }}), 
      createHeader("BAB IV. PELAKSANAAN KEGIATAN"),
      data.theme ? createSubHeader("4.1. Tema Kegiatan") : null,
      data.theme ? createNormalText(data.theme) : null,
      createSubHeader(data.theme ? "4.2. Sasaran Peserta" : "4.1. Sasaran Peserta"),
      createNormalText(data.targetAudience || "-"),
      createSubHeader(data.theme ? "4.3. Waktu dan Tempat" : "4.2. Waktu dan Tempat"),
      new Paragraph({
        children: [
            new TextRun({ text: "Hari/Tanggal : ", bold: true, font: "Times New Roman", size: 24 }),
            new TextRun({ text: `${data.startDate} s.d. ${data.endDate}`, font: "Times New Roman", size: 24 }),
        ]
      }),
      new Paragraph({
        children: [
            new TextRun({ text: "Tempat : ", bold: true, font: "Times New Roman", size: 24 }),
            new TextRun({ text: data.location, font: "Times New Roman", size: 24 }),
        ],
        spacing: { after: 100 }
      }),
      createSubHeader(data.theme ? "4.4. Metode / Rencana Kegiatan" : "4.3. Metode / Rencana Kegiatan"),
      createNormalText(data.methodology || "-"),
  ].filter(Boolean) as Paragraph[];

  // 4.5 Jadwal (Inside BAB IV)
  const scheduleRows = data.schedule.map(item => 
    new TableRow({
        children: [
            createTextCell(item.time, false, AlignmentType.CENTER),
            createTextCell(item.activity),
            createTextCell(item.pic, false, AlignmentType.CENTER),
        ]
    })
  );

  const scheduleTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
              tableHeader: true,
              children: [
                  createTextCell("Waktu", true, AlignmentType.CENTER),
                  createTextCell("Kegiatan", true, AlignmentType.CENTER),
                  createTextCell("PJ", true, AlignmentType.CENTER),
              ]
          }),
          ...scheduleRows
      ]
  });

  const sectionIV_Schedule = [
      createSubHeader(data.theme ? "4.5. Susunan Acara" : "4.4. Susunan Acara"),
      scheduleTable
  ];

  // BAB V. Struktur Kepanitiaan
  let sectionV: any[] = [];
  if (data.isCommitteeEnabled) {
      const committeeRows = data.committee.map(item => 
        new TableRow({
            children: [
                createTextCell(item.position, true),
                createTextCell(item.name),
            ]
        })
      );

      const committeeTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
              new TableRow({
                  tableHeader: true,
                  children: [
                      createTextCell("Jabatan", true, AlignmentType.CENTER),
                      createTextCell("Nama", true, AlignmentType.CENTER),
                  ]
              }),
              ...committeeRows
          ]
      });

      sectionV = [
          new Paragraph({ pageBreakBefore: true, children: [], spacing: { after: 0 }}), 
          createHeader("BAB V. STRUKTUR KEPANITIAAN"),
          createSubHeader("5.1. Susunan Panitia"),
          committeeTable,
          createSubHeader("5.2. Uraian Tugas (Job Description)"),
          createNormalText(data.jobDescriptions || "-")
      ];
  }

  // BAB VI. Anggaran
  const budgetRows = data.budget.map(item => 
    new TableRow({
        children: [
            createTextCell(item.item),
            createTextCell(item.quantity.toString(), false, AlignmentType.CENTER),
            createTextCell(formatCurrency(item.price), false, AlignmentType.RIGHT),
            createTextCell(formatCurrency(item.total), false, AlignmentType.RIGHT),
            createTextCell(item.source, false, AlignmentType.CENTER),
        ]
    })
  );

  const totalBudget = data.budget.reduce((sum, item) => sum + item.total, 0);

  const budgetTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
              tableHeader: true,
              children: [
                  createTextCell("Uraian", true, AlignmentType.CENTER),
                  createTextCell("Vol", true, AlignmentType.CENTER),
                  createTextCell("Harga Satuan", true, AlignmentType.CENTER),
                  createTextCell("Total", true, AlignmentType.CENTER),
                  createTextCell("Sumber", true, AlignmentType.CENTER),
              ]
          }),
          ...budgetRows,
          new TableRow({
              children: [
                  createTextCell("TOTAL ESTIMASI BIAYA", true, AlignmentType.CENTER, 3),
                  createTextCell(formatCurrency(totalBudget), true, AlignmentType.RIGHT),
                  createTextCell("", false),
              ]
          })
      ]
  });

  const sectionVI = [
      new Paragraph({ pageBreakBefore: true, children: [], spacing: { after: 0 }}), 
      createHeader("BAB VI. RENCANA ANGGARAN"),
      budgetTable
  ];

  // BAB VII. Penutup
  const sectionVII = [
      new Paragraph({ pageBreakBefore: true, children: [], spacing: { after: 0 }}), 
      createHeader("BAB VII. PENUTUP"),
      createNormalText(data.closing || "-")
  ];

  // SIGNATURES
  const secretaryName = data.committee.find(c => c.position.toLowerCase().includes('sekretaris'))?.name || '...................';
  const ketuaName = data.committee.find(c => c.position.toLowerCase().includes('ketua'))?.name || '...................';

  const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
      rows: [
          new TableRow({
              children: [
                  new TableCell({
                      children: [
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ketua Pelaksana", font: "Times New Roman", size: 24 })] }),
                          new Paragraph({ text: "", spacing: { after: 1200 } }),
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ketuaName, bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 24 })] }),
                      ],
                  }),
                  new TableCell({ children: [], width: { size: 10, type: WidthType.PERCENTAGE } }),
                  new TableCell({
                      children: [
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sekretaris / Penanggung Jawab", font: "Times New Roman", size: 24 })] }),
                          new Paragraph({ text: "", spacing: { after: 1200 } }),
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: secretaryName, bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 24 })] }),
                      ],
                  }),
              ]
          }),
          new TableRow({
              children: [
                  new TableCell({ columnSpan: 3, children: [
                       new Paragraph({ text: "", spacing: { after: 400 } }),
                       new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mengetahui,", font: "Times New Roman", size: 24 })] }),
                       new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kepala Sekolah", font: "Times New Roman", size: 24 })] }),
                       new Paragraph({ text: "", spacing: { after: 1200 } }),
                       new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.principalName, bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 24 })] }),
                       new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NUPTK. ...........................", font: "Times New Roman", size: 24 })] }),
                  ] })
              ]
          })
      ]
  });

  const sectionSignatures = [
      new Paragraph({ text: "", spacing: { before: 400 } }),
      signatureTable
  ];

  // ATTACHMENTS
  const attachments: any[] = [];
  
  if (data.supervisionSchedule.length > 0) {
      attachments.push(new Paragraph({ pageBreakBefore: true }));
      attachments.push(new Paragraph({
        children: [
            new TextRun({
                text: "LAMPIRAN 1: JADWAL SUPERVISI",
                bold: true,
                font: "Times New Roman",
                size: 28,
            }),
        ],
        spacing: { before: 200, after: 100 },
        heading: HeadingLevel.HEADING_1,
      }));
      
      const supRows = data.supervisionSchedule.map((item, idx) => 
        new TableRow({
            children: [
                createTextCell((idx + 1).toString(), false, AlignmentType.CENTER),
                createTextCell(item.date, false, AlignmentType.CENTER),
                createTextCell(item.time, false, AlignmentType.CENTER),
                createTextCell(item.teacherName),
                createTextCell(item.subject),
                createTextCell(item.class, false, AlignmentType.CENTER),
                createTextCell(item.supervisor),
            ]
        })
      );
      
      const supTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
              new TableRow({
                  tableHeader: true,
                  children: [
                      createTextCell("No", true, AlignmentType.CENTER),
                      createTextCell("Hari/Tgl", true, AlignmentType.CENTER),
                      createTextCell("Waktu", true, AlignmentType.CENTER),
                      createTextCell("Nama Guru", true, AlignmentType.CENTER),
                      createTextCell("Mapel", true, AlignmentType.CENTER),
                      createTextCell("Kelas", true, AlignmentType.CENTER),
                      createTextCell("Supervisor", true, AlignmentType.CENTER),
                  ]
              }),
              ...supRows
          ]
      });
      attachments.push(supTable);
  }

  if (data.includeAttendanceList) {
      if (attachments.length === 0) attachments.push(new Paragraph({ pageBreakBefore: true }));
      else attachments.push(new Paragraph({ text: "", spacing: { before: 400 } }));

      attachments.push(new Paragraph({
        children: [
            new TextRun({
                text: "LAMPIRAN 2: DAFTAR HADIR",
                bold: true,
                font: "Times New Roman",
                size: 28,
            }),
        ],
        spacing: { before: 200, after: 100 },
        heading: HeadingLevel.HEADING_1,
      }));
      attachments.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.title.toUpperCase(), bold: true, size: 24, font: "Times New Roman" })], spacing: { after: 200 } }));

      const uniqueTeachers = Array.from(new Set(TEACHER_DATA.map(t => t.name))).sort();
      const attRows = uniqueTeachers.map((name, idx) => 
        new TableRow({
            children: [
                createTextCell((idx + 1).toString(), false, AlignmentType.CENTER),
                createTextCell(name),
                createTextCell(`${idx + 1}.............`, false, idx % 2 === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT),
                createTextCell(""),
            ]
        })
      );

      const attTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createTextCell("No", true, AlignmentType.CENTER),
                    createTextCell("Nama Guru", true, AlignmentType.CENTER),
                    createTextCell("Tanda Tangan", true, AlignmentType.CENTER),
                    createTextCell("Ket", true, AlignmentType.CENTER),
                ]
            }),
            ...attRows
        ]
      });

      attachments.push(attTable);
      
      attachments.push(new Paragraph({ text: "", spacing: { before: 400 } }));
      attachments.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Bogor, ........................... 2024", font: "Times New Roman", size: 24 })] }));
      attachments.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Kepala Sekolah", font: "Times New Roman", size: 24 })] }));
      attachments.push(new Paragraph({ text: "", spacing: { after: 1200 } }));
      attachments.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.principalName, bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 24 })] }));
  }

  // CREATE DOC
  const doc = new Document({
    sections: [
      {
        properties: {},
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                children: [PageNumber.CURRENT],
                            }),
                        ],
                    }),
                ],
            }),
        },
        children: [
          ...titleParagraphs,
          ...approvalPage,
          ...tocPage,
          ...sectionI,
          ...sectionII,
          ...sectionIII,
          ...sectionIV,
          ...sectionIV_Schedule,
          ...sectionV,
          ...sectionVI,
          ...sectionVII,
          ...sectionSignatures,
          ...attachments
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  FileSaver.saveAs(blob, `Proposal_${safeTitle || 'kegiatan'}.docx`);
};