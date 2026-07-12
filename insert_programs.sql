-- File: insert_programs.sql
-- Description: SQL script to insert the updated list of programs for Puspadi Bali.
-- You can run this directly in phpMyAdmin.

-- First, let's get the ID of the manager to assign to these programs.
-- We will use a variable so it works dynamically, assuming 'manager01' exists.
SET @manager_id = (SELECT id FROM users_user WHERE username = 'manager01' LIMIT 1);
SET @current_time = NOW();

-- (Optional) If you want to delete the old dummy programs first, uncomment the next line:
-- DELETE FROM programs_program;

-- Insert Rehabilitation Programs
INSERT INTO programs_program (title, description, start_date, end_date, target_beneficiaries, status, manager_id, created_at, updated_at) VALUES 
('Prosthetics & Orthotics', 'Provides customized prosthetic and orthotic solutions to improve mobility, physical function, and independence, enabling people with disabilities to participate more actively in their daily lives.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Adaptive Wheelchair', 'Provides individually customized adaptive wheelchairs designed to enhance mobility, comfort, safety, and independence according to each beneficiary''s specific needs.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Physiotherapy', 'Delivers professional physiotherapy services that support physical rehabilitation, improve functional abilities, reduce physical limitations, and promote long-term well-being.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Corrective Operations Referral and Support', 'Facilitates access to corrective surgical services by coordinating medical referrals, providing guidance throughout the treatment process, and supporting post-operative recovery.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Accessible Home Project', 'Improves the accessibility of beneficiaries'' homes through practical modifications that create safer, more inclusive, and independent living environments.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time);

-- Insert Education Programs
INSERT INTO programs_program (title, description, start_date, end_date, target_beneficiaries, status, manager_id, created_at, updated_at) VALUES 
('Scholarships', 'Provides educational scholarships to support students with disabilities in accessing quality education, promoting equal opportunities, and encouraging lifelong learning.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time);

-- Insert Training & Empowerment Programs
INSERT INTO programs_program (title, description, start_date, end_date, target_beneficiaries, status, manager_id, created_at, updated_at) VALUES 
('Vocational Training', 'Provides vocational training programs that develop practical skills, increase employability, and support sustainable economic independence for beneficiaries.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Soft Skills Training', 'Enhances essential interpersonal and professional competencies, including communication, teamwork, leadership, problem-solving, and self-confidence, to prepare beneficiaries for personal and professional success.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Work Experience', 'Offers practical workplace experience through structured placements, enabling beneficiaries to develop professional competencies, gain confidence, and adapt to real working environments.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Job Placement', 'Connects beneficiaries with inclusive employment opportunities by facilitating job matching, employer engagement, and career support based on their individual skills and potential.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time);

-- Insert Advocacy Programs
INSERT INTO programs_program (title, description, start_date, end_date, target_beneficiaries, status, manager_id, created_at, updated_at) VALUES 
('Voicing the Rights of People with Disabilities', 'Advocates for the rights of people with disabilities by promoting equal opportunities, accessibility, inclusive policies, and meaningful participation within society.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time),
('Real Action for Public Awareness', 'Conducts awareness campaigns and community engagement initiatives to foster greater public understanding, reduce stigma, and promote an inclusive society for people with disabilities.', '2025-01-01', '2025-12-31', 100, 'ONGOING', @manager_id, @current_time, @current_time);

