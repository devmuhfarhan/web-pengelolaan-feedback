from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from programs.models import Program
from feedbacks.models import Feedback
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

USERS = [
    {
        'username': 'manager01',
        'password': 'Password123!',
        'email': 'manager01@stewardship.id',
        'first_name': 'Budi',
        'last_name': 'Santoso',
        'role': 'MANAGER',
        'phone_number': '081200000001',
    },
    {
        'username': 'staff_lapangan01',
        'password': 'Password123!',
        'email': 'lapangan01@stewardship.id',
        'first_name': 'Agus',
        'last_name': 'Prasetyo',
        'role': 'STAFF_LAPANGAN',
        'phone_number': '081200000002',
    },
    {
        'username': 'staff_lapangan02',
        'password': 'Password123!',
        'email': 'lapangan02@stewardship.id',
        'first_name': 'Rina',
        'last_name': 'Wulandari',
        'role': 'STAFF_LAPANGAN',
        'phone_number': '081200000003',
    },
    {
        'username': 'staff_ops01',
        'password': 'Password123!',
        'email': 'ops01@stewardship.id',
        'first_name': 'Dewi',
        'last_name': 'Kurniasari',
        'role': 'STAFF_OPERATIONAL',
        'phone_number': '081200000004',
    },
    {
        'username': 'penerima01',
        'password': 'Password123!',
        'email': 'penerima01@stewardship.id',
        'first_name': 'Siti',
        'last_name': 'Aminah',
        'role': 'PENERIMA_MANFAAT',
        'phone_number': '081200000005',
    },
    {
        'username': 'penerima02',
        'password': 'Password123!',
        'email': 'penerima02@stewardship.id',
        'first_name': 'Joko',
        'last_name': 'Widodo',
        'role': 'PENERIMA_MANFAAT',
        'phone_number': '081200000006',
    },
    {
        'username': 'penerima03',
        'password': 'Password123!',
        'email': 'penerima03@stewardship.id',
        'first_name': 'Hana',
        'last_name': 'Pertiwi',
        'role': 'PENERIMA_MANFAAT',
        'phone_number': '081200000007',
    },
]

PROGRAMS = [
    {
        'title': 'Program Beasiswa Pendidikan 2024',
        'description': 'Program bantuan biaya pendidikan bagi penerima manfaat yang memenuhi syarat akademik dan ekonomi. Mencakup biaya kuliah, buku, dan biaya hidup bulanan.',
        'start_date': '2024-01-15',
        'end_date': '2024-12-31',
        'status': 'COMPLETED',
        'target_beneficiaries': 50,
    },
    {
        'title': 'Bantuan Modal Usaha UMKM 2025',
        'description': 'Penyaluran bantuan modal usaha bagi pelaku UMKM yang terdampak kondisi ekonomi. Disertai pelatihan manajemen keuangan dan pemasaran digital.',
        'start_date': '2025-02-01',
        'end_date': '2025-08-31',
        'status': 'ONGOING',
        'target_beneficiaries': 30,
    },
    {
        'title': 'Program Pelatihan Keterampilan Kerja',
        'description': 'Pelatihan keterampilan vokasional bagi masyarakat usia produktif yang belum memiliki pekerjaan tetap. Meliputi pelatihan komputer, menjahit, dan memasak.',
        'start_date': '2025-04-01',
        'end_date': '2025-09-30',
        'status': 'ONGOING',
        'target_beneficiaries': 75,
    },
    {
        'title': 'Distribusi Sembako Bulan Ramadan',
        'description': 'Distribusi paket sembako kepada keluarga kurang mampu selama bulan Ramadan. Setiap paket berisi beras 5kg, minyak goreng, gula, dan kebutuhan pokok lainnya.',
        'start_date': '2025-03-01',
        'end_date': '2025-03-31',
        'status': 'COMPLETED',
        'target_beneficiaries': 200,
    },
    {
        'title': 'Renovasi Rumah Layak Huni 2025',
        'description': 'Program renovasi rumah tidak layak huni bagi masyarakat berpenghasilan rendah. Mencakup perbaikan atap, lantai, dinding, dan sanitasi dasar.',
        'start_date': '2025-06-01',
        'end_date': '2025-12-31',
        'status': 'PLANNED',
        'target_beneficiaries': 20,
    },
]


class Command(BaseCommand):
    help = 'Seed database with starter data for all user roles'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('=== Seeding starter data ==='))

        # --- Create Users ---
        self.stdout.write('\n[*] Creating users...')
        created_users = {}
        for data in USERS:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'role': data['role'],
                    'phone_number': data['phone_number'],
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'  [OK] [{data["role"]}] {data["username"]}'))
            else:
                self.stdout.write(f'  [--] Skipped (exists): {data["username"]}')
            created_users[data['username']] = user

        # Get the manager user as the program manager
        manager_user = created_users.get('manager01')

        # --- Create Programs ---
        self.stdout.write('\n[*] Creating programs...')
        created_programs = []
        for prog_data in PROGRAMS:
            program, created = Program.objects.get_or_create(
                title=prog_data['title'],
                defaults={
                    'description': prog_data['description'],
                    'start_date': prog_data['start_date'],
                    'end_date': prog_data.get('end_date'),
                    'status': prog_data['status'],
                    'target_beneficiaries': prog_data['target_beneficiaries'],
                    'manager': manager_user,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  [OK] {prog_data["title"][:55]}'))
            else:
                self.stdout.write(f'  [--] Skipped (exists): {prog_data["title"][:55]}')
            created_programs.append(program)

        # --- Create Feedbacks ---
        self.stdout.write('\n[*] Creating feedbacks...')
        feedbacks_data = [
            {
                'user': created_users['penerima01'],
                'program': created_programs[0],
                'content': 'Program beasiswa ini sangat membantu saya menyelesaikan kuliah. Prosedur pendaftarannya jelas dan pencairan dananya tepat waktu. Terima kasih banyak!',
                'rating': 5,
                'status': 'RESOLVED',
            },
            {
                'user': created_users['penerima01'],
                'program': created_programs[1],
                'content': 'Bantuan modal usaha yang diberikan sangat bermanfaat. Namun proses pengajuannya agak lama, harap bisa dipercepat di program berikutnya.',
                'rating': 4,
                'status': 'REVIEWED',
            },
            {
                'user': created_users['penerima02'],
                'program': created_programs[2],
                'content': 'Pelatihan komputer yang diberikan sangat praktis dan langsung bisa diterapkan. Instrukturnya sabar dan mudah dipahami. Sangat puas!',
                'rating': 5,
                'status': 'RESOLVED',
            },
            {
                'user': created_users['penerima02'],
                'program': created_programs[3],
                'content': 'Paket sembakonya lengkap dan berkualitas. Distribusinya juga teratur. Saya berharap program seperti ini bisa terus berlanjut.',
                'rating': 4,
                'status': 'RESOLVED',
            },
            {
                'user': created_users['penerima03'],
                'program': created_programs[1],
                'content': 'Saya sangat terbantu dengan program ini. Modal yang diberikan sudah saya gunakan untuk membuka warung kecil. Omzet mulai meningkat.',
                'rating': 5,
                'status': 'REVIEWED',
            },
            {
                'user': created_users['penerima03'],
                'program': created_programs[2],
                'content': 'Pelatihan menjahitnya bagus, namun waktu pelatihannya terlalu singkat. Sebaiknya ditambah menjadi 2 minggu agar lebih mahir.',
                'rating': 3,
                'status': 'PENDING',
            },
            {
                'user': created_users['staff_lapangan01'],
                'program': created_programs[3],
                'content': 'Di lapangan, antrian distribusi sempat kacau karena kurangnya petugas. Untuk program selanjutnya mohon ditambah tenaga distribusi.',
                'rating': 3,
                'status': 'PENDING',
            },
            {
                'user': created_users['staff_lapangan02'],
                'program': created_programs[0],
                'content': 'Proses verifikasi dokumen penerima beasiswa sudah berjalan lancar. Data yang masuk sudah lengkap dan terverifikasi dengan baik.',
                'rating': 4,
                'status': 'REVIEWED',
            },
        ]

        for fb_data in feedbacks_data:
            exists = Feedback.objects.filter(
                user=fb_data['user'],
                program=fb_data['program'],
            ).exists()

            if not exists:
                Feedback.objects.create(
                    user=fb_data['user'],
                    program=fb_data['program'],
                    content=fb_data['content'],
                    rating=fb_data['rating'],
                    status=fb_data['status'],
                )
                self.stdout.write(self.style.SUCCESS(
                    f'  [OK] Feedback from {fb_data["user"].username} for "{fb_data["program"].title[:30]}..."'
                ))
            else:
                self.stdout.write(f'  [--] Skipped feedback: {fb_data["user"].username}')

        self.stdout.write(self.style.SUCCESS('\n[DONE] Seeding complete!\n'))
        self.stdout.write(self.style.WARNING('Login credentials (password: Password123!)'))
        self.stdout.write('  MANAGER           -> manager01')
        self.stdout.write('  STAFF_LAPANGAN    -> staff_lapangan01, staff_lapangan02')
        self.stdout.write('  STAFF_OPERATIONAL -> staff_ops01')
        self.stdout.write('  PENERIMA_MANFAAT  -> penerima01, penerima02, penerima03')
