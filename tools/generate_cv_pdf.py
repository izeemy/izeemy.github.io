from pathlib import Path
import textwrap


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "cv-nursyamsiah-fajriah.pdf"
OUT.parent.mkdir(exist_ok=True)

PAGE_W, PAGE_H = 595, 842
MARGIN_X = 44
TOP = 796
BOTTOM = 44
BLACK = "0 0 0"
DARK = "0.10 0.10 0.10"
MUTED = "0.32 0.32 0.32"
LINE = "0.72 0.72 0.72"


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class PDF:
    def __init__(self):
        self.pages = []
        self.current = []
        self.y = TOP

    def new_page(self):
        if self.current:
            self.pages.append("\n".join(self.current))
        self.current = []
        self.y = TOP

    def ensure(self, needed):
        if self.y - needed < BOTTOM:
            self.new_page()

    def text(self, x, y, text, size=10, font="F1", color=DARK):
        self.current.append(f"BT /{font} {size} Tf {color} rg {x:.2f} {y:.2f} Td ({pdf_escape(text)}) Tj ET")

    def line(self, x1, y1, x2, y2, color=LINE, width=0.8):
        self.current.append(f"{color} RG {width} w {x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def section(self, title):
        self.ensure(34)
        self.y -= 15
        self.text(MARGIN_X, self.y, title.upper(), 10, "F2", BLACK)
        self.y -= 7
        self.line(MARGIN_X, self.y, PAGE_W - MARGIN_X, self.y)
        self.y -= 12

    def paragraph(self, text, width=96, size=9.8, color=DARK, indent=0, leading=12):
        lines = textwrap.wrap(text, width=width)
        self.ensure(len(lines) * leading + 2)
        for line in lines:
            self.text(MARGIN_X + indent, self.y, line, size, "F1", color)
            self.y -= leading
        self.y -= 2

    def heading(self, title, meta=None):
        self.ensure(32)
        self.text(MARGIN_X, self.y, title, 10.6, "F2", BLACK)
        self.y -= 13
        if meta:
            self.text(MARGIN_X, self.y, meta, 9.2, "F1", MUTED)
            self.y -= 14

    def bullet(self, text):
        lines = textwrap.wrap(text, width=90)
        self.ensure(len(lines) * 12 + 4)
        self.text(MARGIN_X + 2, self.y, "-", 9.6, "F2", BLACK)
        self.text(MARGIN_X + 14, self.y, lines[0], 9.6, "F1", DARK)
        self.y -= 12
        for line in lines[1:]:
            self.text(MARGIN_X + 14, self.y, line, 9.6, "F1", DARK)
            self.y -= 12
        self.y -= 2

    def build(self, path):
        if self.current:
            self.pages.append("\n".join(self.current))

        objects = []
        objects.append("<< /Type /Catalog /Pages 2 0 R >>")
        kids = " ".join(f"{i * 2 + 5} 0 R" for i in range(len(self.pages)))
        objects.append(f"<< /Type /Pages /Kids [{kids}] /Count {len(self.pages)} >>")
        objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

        for idx, content in enumerate(self.pages):
            content_id = idx * 2 + 6
            objects.append(
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
                f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_id} 0 R >>"
            )
            stream = content.encode("latin-1", "replace")
            objects.append(f"<< /Length {len(stream)} >>\nstream\n{content}\nendstream")

        offsets = [0]
        pdf = ["%PDF-1.4\n"]
        for i, obj in enumerate(objects, start=1):
            offsets.append(sum(len(p.encode("latin-1", "replace")) for p in pdf))
            pdf.append(f"{i} 0 obj\n{obj}\nendobj\n")
        xref = sum(len(p.encode("latin-1", "replace")) for p in pdf)
        pdf.append(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n")
        for off in offsets[1:]:
            pdf.append(f"{off:010d} 00000 n \n")
        pdf.append(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF")
        path.write_bytes("".join(pdf).encode("latin-1", "replace"))


pdf = PDF()

pdf.text(MARGIN_X, pdf.y, "NURSYAMSIAH FAJRIAH", 18, "F2", BLACK)
pdf.y -= 17
pdf.text(MARGIN_X, pdf.y, "Fresh Graduate in Informatics Engineering", 10.4, "F2", DARK)
pdf.y -= 13
pdf.text(MARGIN_X, pdf.y, "Database | Application Development | Web Development | IT Support", 9.6, "F1", DARK)
pdf.y -= 13
pdf.text(
    MARGIN_X,
    pdf.y,
    "Tangerang Selatan, Banten | 087842063666 | nursyamsiafajriah1@gmail.com | linkedin.com/in/nursyamsiahfajriah",
    9.2,
    "F1",
    MUTED,
)
pdf.y -= 20
pdf.line(MARGIN_X, pdf.y, PAGE_W - MARGIN_X, pdf.y, BLACK, 1)
pdf.y -= 10

pdf.section("Professional Summary")
pdf.paragraph(
    "Fresh graduate S1 Teknik Informatika Universitas Pamulang dengan minat pada database, application development, "
    "web development, dan pengelolaan sistem informasi. Memiliki pengalaman mengembangkan project berbasis web dan "
    "database dari perancangan, implementasi, pengujian, hingga deployment."
)

pdf.section("Technical Skills")
pdf.paragraph("Database & Data: MySQL, SQL, Database Management, Data Processing, Microsoft Excel, K-Means Clustering, Association Rules Apriori")
pdf.paragraph("Application Development: Laravel, PHP, MySQL")
pdf.paragraph("Front-End: HTML, CSS, JavaScript")
pdf.paragraph("Web & Deployment: Web Development, Responsive Web, Hosting, Domain Management, cPanel, HTTPS/SSL")
pdf.paragraph("Networking / IT: Computer Networking, Network Administration")

pdf.section("Featured Projects")
pdf.heading("Sistem Pengelolaan Stok Obat Klinik Pratama Kencana", "Application Developer | Laravel, PHP, MySQL, HTML, CSS, JavaScript | stokobatkencana.my.id/login")
pdf.bullet("Mengembangkan aplikasi web untuk pengelolaan data obat, transaksi obat masuk, obat keluar, obat rusak, dan perhitungan stok otomatis.")
pdf.bullet("Membangun dashboard, monitoring status stok, validasi stok, rekomendasi restock, dan riwayat transaksi.")
pdf.bullet("Menerapkan K-Means Clustering dan Association Rules Apriori sebagai bagian dari penelitian tugas akhir.")

pdf.heading("Website Klinik Pratama Kencana", "Web Developer | Web Development, Deployment | klinikpratamakencana.my.id")
pdf.bullet("Mengembangkan website profil klinik untuk menampilkan informasi layanan, jadwal pelayanan, galeri, kontak, WhatsApp, lokasi, dan Google Maps.")
pdf.bullet("Melakukan deployment website menggunakan hosting, domain, dan HTTPS.")

pdf.heading("Sistem PPDB RA Khairul Ummah", "Web Application | Academic Project / Kerja Praktik | Local Development")
pdf.bullet("Mengembangkan sistem PPDB berbasis web untuk membantu proses pendaftaran dan penyampaian informasi sekolah.")
pdf.bullet("Membangun halaman informasi PPDB, login, pendaftaran, admin, profil sekolah, galeri, dan kontak.")

pdf.section("Education")
pdf.heading("Universitas Pamulang", "S1 Teknik Informatika | 2022-2026 | IPK 3,62")
pdf.paragraph("Mengembangkan kompetensi di bidang web development, database, UI/UX, networking, dan analisis data melalui project akademik.")

pdf.section("Certification & Training")
pdf.paragraph("Network Administrator - LSP Universitas Pamulang / BNSP | Issued: Oktober 2025 | Valid Until: Oktober 2028 | Status: Competent")
pdf.paragraph("Training: Front End Web - Dicoding Indonesia; Pemrograman Web - Dicoding Indonesia; Belajar Dasar Structured Query Language (SQL) - Dicoding Indonesia; Coding & Programming - Samsung Innovation Campus; Designing User Interfaces and Experiences (UI/UX) - IBM.")

pdf.section("Research & Publications")
pdf.paragraph("Final Project: Implementasi Metode K-Means Clustering untuk Pengelompokan Stok Obat dan Association Rules Apriori untuk Analisis Pola Penjualan Obat (Studi Kasus: Klinik Pratama Kencana).")
pdf.bullet("Publikasi terkait sistem pengelolaan stok obat pada Jurnal FASILKOM.")
pdf.bullet("Publikasi terkait sistem PPDB RA Khairul Ummah pada BINER: Jurnal Ilmu Komputer, Teknik dan Multimedia.")
pdf.bullet("Publikasi kegiatan PKM pemanfaatan Figma pada APPA: Jurnal Pengabdian kepada Masyarakat.")

pdf.section("Organization & Activities")
pdf.heading("Informatics Study Club (ISC) - UI/UX Division", "Universitas Pamulang")
pdf.paragraph("Berpartisipasi dalam kegiatan pengembangan kemampuan desain antarmuka, penggunaan Figma, collaborative learning, dan diskusi pengembangan produk digital.")
pdf.heading("Pengabdian Kepada Masyarakat (PKM)", "SMA Muhammadiyah 8 Ciputat | November 2024")
pdf.paragraph("Berpartisipasi dalam kegiatan pemanfaatan Figma sebagai alat desain kolaboratif untuk pengembangan projek digital.")

pdf.section("Additional Experience")
pdf.heading("Admin Online Shop", "Jjmuezza Hijab | Part-time | Juni 2022 - September 2022")
pdf.paragraph("Mengelola pesanan, komunikasi pelanggan, dan pembaruan data produk pada kanal penjualan online.")
pdf.heading("Brand Partner", "Oriflame | Part-time | November 2022 - Maret 2023")
pdf.paragraph("Mendukung aktivitas promosi, komunikasi pelanggan, dan proses pemesanan melalui media digital.")

pdf.build(OUT)
print(OUT)
