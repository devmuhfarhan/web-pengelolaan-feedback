from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from programs.models import Program
from feedbacks.models import Feedback, FeedbackQuestion
from users.models import BeneficiaryData
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

USERS = [
    {
        'username': 'manager_01',
        'password': 'Password123!',
        'email': 'manager01@puspadibali.org',
        'first_name': 'Budi',
        'last_name': 'Santoso',
        'role': 'MANAGER',
        'phone_number': '081200000001',
    },
    {
        'username': 'field_staff_01',
        'password': 'Password123!',
        'email': 'field_staff_01@puspadibali.org',
        'first_name': 'Agus',
        'last_name': 'Prasetyo',
        'role': 'FIELD_STAFF',
        'phone_number': '081200000002',
    },
    {
        'username': 'field_staff_02',
        'password': 'Password123!',
        'email': 'field_staff_02@puspadibali.org',
        'first_name': 'Rina',
        'last_name': 'Wulandari',
        'role': 'FIELD_STAFF',
        'phone_number': '081200000003',
    },
    {
        'username': 'operational_staff_01',
        'password': 'Password123!',
        'email': 'operational_staff_01@puspadibali.org',
        'first_name': 'Dewi',
        'last_name': 'Kurniasari',
        'role': 'OPERATIONAL_STAFF',
        'phone_number': '081200000004',
    },
    {
        'username': 'beneficiary_01',
        'password': 'Password123!',
        'email': 'beneficiary_01@puspadibali.org',
        'first_name': 'Siti',
        'last_name': 'Aminah',
        'role': 'BENEFICIARY',
        'phone_number': '081200000005',
    },
    {
        'username': 'beneficiary_02',
        'password': 'Password123!',
        'email': 'beneficiary_02@puspadibali.org',
        'first_name': 'John',
        'last_name': 'Doe',
        'role': 'BENEFICIARY',
        'phone_number': '081200000006',
    },
    {
        'username': 'beneficiary_03',
        'password': 'Password123!',
        'email': 'beneficiary_03@puspadibali.org',
        'first_name': 'Hana',
        'last_name': 'Pertiwi',
        'role': 'BENEFICIARY',
        'phone_number': '081200000007',
    },
    {
        'username': 'admin_puspadi',
        'password': 'Password123!',
        'email': 'admin@puspadibali.org',
        'first_name': 'Admin',
        'last_name': 'Puspadi',
        'role': 'ADMIN',
        'phone_number': '081200000008',
    },
]

PROGRAMS = [
    {
        'title': 'Prosthetics & Orthotics',
        'description': 'Provides customized prosthetic and orthotic solutions to improve mobility, physical function, and independence, enabling people with disabilities to participate more actively in their daily lives.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Adaptive Wheelchair',
        'description': 'Provides individually customized adaptive wheelchairs designed to enhance mobility, comfort, safety, and independence according to each beneficiary\'s specific needs.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Physiotherapy',
        'description': 'Delivers professional physiotherapy services that support physical rehabilitation, improve functional abilities, reduce physical limitations, and promote long-term well-being.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Corrective Operations Referral and Support',
        'description': 'Facilitates access to corrective surgical services by coordinating medical referrals, providing guidance throughout the treatment process, and supporting post-operative recovery.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Accessible Home Project',
        'description': 'Improves the accessibility of beneficiaries\' homes through practical modifications that create safer, more inclusive, and independent living environments.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Scholarships',
        'description': 'Provides educational scholarships to support students with disabilities in accessing quality education, promoting equal opportunities, and encouraging lifelong learning.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Vocational Training',
        'description': 'Provides vocational training programs that develop practical skills, increase employability, and support sustainable economic independence for beneficiaries.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Soft Skills Training',
        'description': 'Enhances essential interpersonal and professional competencies, including communication, teamwork, leadership, problem-solving, and self-confidence, to prepare beneficiaries for personal and professional success.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Work Experience',
        'description': 'Offers practical workplace experience through structured placements, enabling beneficiaries to develop professional competencies, gain confidence, and adapt to real working environments.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Job Placement',
        'description': 'Connects beneficiaries with inclusive employment opportunities by facilitating job matching, employer engagement, and career support based on their individual skills and potential.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Voicing the Rights of People with Disabilities',
        'description': 'Advocates for the rights of people with disabilities by promoting equal opportunities, accessibility, inclusive policies, and meaningful participation within society.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
    },
    {
        'title': 'Real Action for Public Awareness',
        'description': 'Conducts awareness campaigns and community engagement initiatives to foster greater public understanding, reduce stigma, and promote an inclusive society for people with disabilities.',
        'start_date': '2025-01-01',
        'end_date': '2025-12-31',
        'status': 'ONGOING',
        'target_beneficiaries': 100,
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
        manager_user = created_users.get('manager_01')

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

        # --- Create Feedback Questions ---
        self.stdout.write('\n[*] Creating feedback questions...')
        questions = [
            "1. Were the facilities and service environment provided by PUSPADI Bali comfortable and accessible?",
            "2. Did the team provide adequate support during the service/training process?",
            "3. Did the service run efficiently and according to the promised timeline?",
            "4. How useful were the training and services provided for your daily life?",
            "5. Did the team communicate information clearly and comprehensively?",
            "6. Is the provided mobility aid or equipment in good condition and functioning properly?",
            "7. Were you involved in the decision-making process regarding the service or equipment provided?",
            "8. Did the team respond to your complaints and needs quickly and appropriately?",
            "9. Do you feel more independent after receiving services from PUSPADI Bali?",
            "10. Are you satisfied with the overall service provided by PUSPADI Bali?",
        ]
        for idx, q_text in enumerate(questions):
            q, created = FeedbackQuestion.objects.get_or_create(text=q_text, defaults={'order': idx + 1})
            if created:
                self.stdout.write(self.style.SUCCESS(f'  [OK] Question {idx+1}'))
            else:
                self.stdout.write(f'  [--] Skipped (exists): Question {idx+1}')

        self.stdout.write(self.style.SUCCESS('\n[DONE] Seeding complete!\n'))
        self.stdout.write(self.style.WARNING('Login credentials (password: Password123!)'))
        self.stdout.write('  MANAGER           -> manager_01')
        self.stdout.write('  FIELD_STAFF    -> field_staff_01, field_staff_02')
        self.stdout.write('  OPERATIONAL_STAFF -> operational_staff_01')
        self.stdout.write('  BENEFICIARY  -> beneficiary_01, beneficiary_02, beneficiary_03')
        self.stdout.write('  ADMIN             -> admin_puspadi')
