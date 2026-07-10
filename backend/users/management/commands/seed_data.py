from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from programs.models import Program
from feedbacks.models import Feedback
from users.models import BeneficiaryData
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

USERS = [
    {
        'username': 'manager01',
        'password': 'Password123!',
        'email': 'manager01@puspadibali.org',
        'first_name': 'Budi',
        'last_name': 'Santoso',
        'role': 'MANAGER',
        'phone_number': '081200000001',
    },
    {
        'username': 'staff_lapangan01',
        'password': 'Password123!',
        'email': 'lapangan01@puspadibali.org',
        'first_name': 'Agus',
        'last_name': 'Prasetyo',
        'role': 'STAFF_LAPANGAN',
        'phone_number': '081200000002',
    },
    {
        'username': 'staff_lapangan02',
        'password': 'Password123!',
        'email': 'lapangan02@puspadibali.org',
        'first_name': 'Rina',
        'last_name': 'Wulandari',
        'role': 'STAFF_LAPANGAN',
        'phone_number': '081200000003',
    },
    {
        'username': 'staff_ops01',
        'password': 'Password123!',
        'email': 'ops01@puspadibali.org',
        'first_name': 'Dewi',
        'last_name': 'Kurniasari',
        'role': 'STAFF_OPERATIONAL',
        'phone_number': '081200000004',
    },
    {
        'username': 'penerima01',
        'password': 'Password123!',
        'email': 'penerima01@puspadibali.org',
        'first_name': 'Siti',
        'last_name': 'Aminah',
        'role': 'PENERIMA_MANFAAT',
        'phone_number': '081200000005',
    },
    {
        'username': 'penerima02',
        'password': 'Password123!',
        'email': 'penerima02@puspadibali.org',
        'first_name': 'Joko',
        'last_name': 'Widodo',
        'role': 'PENERIMA_MANFAAT',
        'phone_number': '081200000006',
    },
    {
        'username': 'penerima03',
        'password': 'Password123!',
        'email': 'penerima03@puspadibali.org',
        'first_name': 'Hana',
        'last_name': 'Pertiwi',
        'role': 'PENERIMA_MANFAAT',
        'phone_number': '081200000007',
    },
]

PROGRAMS = [
    {
        'title': 'Rehabilitation',
        'description': 'PUSPADI Bali provides Adaptive Wheelchairs, Prosthetics & Orthotics as well as other mobility aids free of charge to our clients. We fund 100% of the costs incurred to carry out treatment which includes rehabilitation and any other follow-up procedures to ensure effective treatment.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 200,
    },
    {
        'title': 'Education',
        'description': 'Through consultation with partner organizations, Puspadi Bali helps to facilitate access to education for children with physical disabilities.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 150,
    },
    {
        'title': 'Training & Empowerment',
        'description': 'PUSPADI Bali creates a sustainable infrastructure to help people with disabilities in Bali recognize and fulfill their potential in society and the workplace. We do this by providing personal and professional development courses, as well as offering support that will enable people with disabilities to seek employment and take practical steps towards economic independence and personal empowerment.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Advocacy',
        'description': 'PUSPADI Bali aims to raise awareness about disability issues within the community and challenge common misconceptions and cultural beliefs about disability. This is done through increasing the participation and visibility of people with disabilities.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 300,
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

        # --- Update Beneficiary profiles ---
        self.stdout.write('\n[*] Updating beneficiary profile data...')
        penerima1 = created_users.get('penerima01')
        if penerima1 and len(created_programs) > 0:
            penerima1.birth_date = '1995-04-12'
            penerima1.gender = 'P'
            penerima1.program = created_programs[0]
            penerima1.date_provided = '2024-01-20'
            penerima1.save()
            self.stdout.write(self.style.SUCCESS('  [OK] Profile info for penerima01'))

        penerima2 = created_users.get('penerima02')
        if penerima2 and len(created_programs) > 1:
            penerima2.birth_date = '1988-11-23'
            penerima2.gender = 'L'
            penerima2.program = created_programs[1]
            penerima2.date_provided = '2025-02-05'
            penerima2.save()
            self.stdout.write(self.style.SUCCESS('  [OK] Profile info for penerima02'))

        penerima3 = created_users.get('penerima03')
        if penerima3 and len(created_programs) > 2:
            penerima3.birth_date = '2001-07-05'
            penerima3.gender = 'P'
            penerima3.program = created_programs[2]
            penerima3.date_provided = '2025-04-10'
            penerima3.save()
            self.stdout.write(self.style.SUCCESS('  [OK] Profile info for penerima03'))

        # --- Create Feedbacks ---
        self.stdout.write('\n[*] Creating feedbacks...')
        import json
        dummy_answers_1 = json.dumps({
            "q1": 4, "q2": 4, "q3": 4, "q4": 3, "q5": 4,
            "q6": 3, "q7": 4, "q8": 4, "q9": 4, "q10": 4
        })
        dummy_answers_2 = json.dumps({
            "q1": 3, "q2": 3, "q3": 4, "q4": 4, "q5": 3,
            "q6": 3, "q7": 3, "q8": 3, "q9": 4, "q10": 3
        })
        feedbacks_data = [
            {
                'user': created_users['penerima01'],
                'program': created_programs[0],
                'content': dummy_answers_1,
                'rating': 4,
                'status': 'RESOLVED',
            },
            {
                'user': created_users['penerima02'],
                'program': created_programs[1],
                'content': dummy_answers_2,
                'rating': 3,
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

        self.stdout.write(self.style.SUCCESS('\n[*] Creating beneficiary data...'))
        beneficiaries_data = [
            {
                'lokasi': 'Kec. Bojonggede, Bogor',
                'status': 'VERIFIED',
            },
            {
                'lokasi': 'Desa Sukamaju, Bandung',
                'status': 'INCOMPLETE',
            },
            {
                'lokasi': 'Kel. Jaya, Sukabumi',
                'status': 'PENDING',
            },
        ]

        for ben_data in beneficiaries_data:
            exists = BeneficiaryData.objects.filter(lokasi=ben_data['lokasi']).exists()
            if not exists:
                BeneficiaryData.objects.create(
                    lokasi=ben_data['lokasi'],
                    status=ben_data['status']
                )
                self.stdout.write(self.style.SUCCESS(f"  [OK] Beneficiary Location: {ben_data['lokasi']}"))
            else:
                self.stdout.write(f"  [--] Skipped location: {ben_data['lokasi']}")

        self.stdout.write(self.style.SUCCESS('\n[DONE] Seeding complete!\n'))
        self.stdout.write(self.style.WARNING('Login credentials (password: Password123!)'))
        self.stdout.write('  MANAGER           -> manager01')
        self.stdout.write('  STAFF_LAPANGAN    -> staff_lapangan01, staff_lapangan02')
        self.stdout.write('  STAFF_OPERATIONAL -> staff_ops01')
        self.stdout.write('  PENERIMA_MANFAAT  -> penerima01, penerima02, penerima03')
