package com.example.jobboard.config;

import com.example.jobboard.model.*;
import com.example.jobboard.model.enums.*;
import com.example.jobboard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds the database with initial data on first startup:
 * - 1 Admin account
 * - 3 Employer accounts with companies (pre-approved)
 * - 3 Seeker accounts
 * - 5 Job listings
 *
 * Only runs if the admin account doesn't already exist (idempotent).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final SeekerProfileRepository seekerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@jobboard.com")) {
            log.info("Database already seeded — skipping.");
            return;
        }

        log.info("Seeding database with initial data...");

        // ===== ADMIN =====
        userRepository.save(User.builder()
                .fullName("System Admin")
                .email("admin@jobboard.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());
        log.info("Admin created: admin@jobboard.com / Admin@123");

        // ===== EMPLOYERS (pre-approved) =====
        User employer1 = userRepository.save(User.builder()
                .fullName("Sarah Johnson")
                .email("employer1@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.EMPLOYER)
                .status(UserStatus.ACTIVE)
                .build());

        User employer2 = userRepository.save(User.builder()
                .fullName("Michael Chen")
                .email("employer2@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.EMPLOYER)
                .status(UserStatus.ACTIVE)
                .build());

        User employer3 = userRepository.save(User.builder()
                .fullName("Emily Rodriguez")
                .email("employer3@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.EMPLOYER)
                .status(UserStatus.ACTIVE)
                .build());

        // ===== COMPANIES =====
        Company techCorp = companyRepository.save(Company.builder()
                .user(employer1)
                .name("TechCorp Solutions")
                .description("Leading technology solutions provider specializing in cloud computing, AI, and enterprise software. We help businesses transform digitally with cutting-edge solutions.")
                .website("https://techcorp.example.com")
                .location("San Francisco, CA")
                .industry("Technology")
                .size("500-1000")
                .logoUrl("https://ui-avatars.com/api/?name=TechCorp&background=6366f1&color=fff&size=128")
                .build());

        Company greenEnergy = companyRepository.save(Company.builder()
                .user(employer2)
                .name("GreenEnergy Inc.")
                .description("Pioneering sustainable energy solutions for a greener tomorrow. We develop solar, wind, and battery storage technologies for residential and commercial use.")
                .website("https://greenenergy.example.com")
                .location("Austin, TX")
                .industry("Renewable Energy")
                .size("200-500")
                .logoUrl("https://ui-avatars.com/api/?name=GreenEnergy&background=22c55e&color=fff&size=128")
                .build());

        Company designStudio = companyRepository.save(Company.builder()
                .user(employer3)
                .name("Creative Design Studio")
                .description("Award-winning design agency creating stunning digital experiences. From brand identity to web applications, we bring creative visions to life.")
                .website("https://creativestudio.example.com")
                .location("New York, NY")
                .industry("Design & Creative")
                .size("50-200")
                .logoUrl("https://ui-avatars.com/api/?name=Creative+Design&background=f43f5e&color=fff&size=128")
                .build());

        // ===== JOBS =====
        jobRepository.save(Job.builder()
                .company(techCorp)
                .title("Senior Full-Stack Developer")
                .description("We're looking for an experienced Full-Stack Developer to join our growing engineering team. You'll work on building scalable web applications using modern technologies.\n\nResponsibilities:\n- Design and implement new features across the full stack\n- Collaborate with product managers and designers\n- Mentor junior developers\n- Participate in code reviews and architectural decisions")
                .location("San Francisco, CA")
                .salaryMin(120000.0)
                .salaryMax(180000.0)
                .type(JobType.FULL_TIME)
                .category("Engineering")
                .status(JobStatus.OPEN)
                .requirements("5+ years of experience with Java/Spring Boot and Angular/React\nStrong understanding of REST APIs and microservices\nExperience with cloud platforms (AWS/GCP/Azure)\nExcellent communication skills")
                .build());

        jobRepository.save(Job.builder()
                .company(techCorp)
                .title("DevOps Engineer")
                .description("Join our infrastructure team to build and maintain CI/CD pipelines, manage cloud infrastructure, and ensure system reliability.\n\nResponsibilities:\n- Design and implement CI/CD pipelines\n- Manage Kubernetes clusters and Docker containers\n- Monitor system performance and respond to incidents\n- Automate infrastructure provisioning with IaC tools")
                .location("Remote")
                .salaryMin(100000.0)
                .salaryMax(150000.0)
                .type(JobType.REMOTE)
                .category("Engineering")
                .status(JobStatus.OPEN)
                .requirements("3+ years of DevOps/SRE experience\nProficiency with Kubernetes, Docker, and Terraform\nExperience with AWS or GCP\nStrong scripting skills (Python, Bash)")
                .build());

        jobRepository.save(Job.builder()
                .company(greenEnergy)
                .title("Sustainability Analyst")
                .description("Help us drive the renewable energy transition by analyzing sustainability metrics and creating reports for stakeholders.\n\nResponsibilities:\n- Conduct lifecycle assessments for energy products\n- Create sustainability reports and dashboards\n- Collaborate with engineering teams on eco-friendly solutions\n- Research and stay current with environmental regulations")
                .location("Austin, TX")
                .salaryMin(70000.0)
                .salaryMax(95000.0)
                .type(JobType.FULL_TIME)
                .category("Analytics")
                .status(JobStatus.OPEN)
                .requirements("Bachelor's degree in Environmental Science or related field\n2+ years of experience in sustainability analysis\nProficiency with data analysis tools (Excel, Python, Tableau)\nKnowledge of ESG frameworks")
                .build());

        jobRepository.save(Job.builder()
                .company(greenEnergy)
                .title("Marketing Intern")
                .description("Exciting internship opportunity to gain hands-on experience in marketing within the renewable energy sector.\n\nResponsibilities:\n- Assist with social media content creation\n- Help organize marketing campaigns and events\n- Conduct market research and competitor analysis\n- Support the marketing team with day-to-day tasks")
                .location("Austin, TX")
                .salaryMin(25000.0)
                .salaryMax(35000.0)
                .type(JobType.INTERNSHIP)
                .category("Marketing")
                .status(JobStatus.OPEN)
                .requirements("Currently pursuing a degree in Marketing, Communications, or related field\nStrong writing and communication skills\nFamiliarity with social media platforms\nPassion for sustainability and renewable energy")
                .build());

        jobRepository.save(Job.builder()
                .company(designStudio)
                .title("UI/UX Designer")
                .description("We're seeking a talented UI/UX Designer to create beautiful and intuitive digital experiences for our clients.\n\nResponsibilities:\n- Create wireframes, prototypes, and high-fidelity mockups\n- Conduct user research and usability testing\n- Collaborate with developers to ensure design fidelity\n- Maintain and evolve our design system")
                .location("New York, NY")
                .salaryMin(85000.0)
                .salaryMax(130000.0)
                .type(JobType.FULL_TIME)
                .category("Design")
                .status(JobStatus.OPEN)
                .requirements("3+ years of UI/UX design experience\nProficiency with Figma and Adobe Creative Suite\nPortfolio demonstrating strong visual design skills\nUnderstanding of accessibility standards (WCAG)")
                .build());

        // ===== SEEKERS =====
        User seeker1 = userRepository.save(User.builder()
                .fullName("Alex Thompson")
                .email("seeker1@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.SEEKER)
                .status(UserStatus.ACTIVE)
                .build());

        User seeker2 = userRepository.save(User.builder()
                .fullName("Priya Sharma")
                .email("seeker2@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.SEEKER)
                .status(UserStatus.ACTIVE)
                .build());

        User seeker3 = userRepository.save(User.builder()
                .fullName("James Wilson")
                .email("seeker3@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.SEEKER)
                .status(UserStatus.ACTIVE)
                .build());

        // Create seeker profiles
        seekerProfileRepository.save(SeekerProfile.builder()
                .user(seeker1)
                .phone("+1-555-0101")
                .headline("Full-Stack Developer | Java & Angular Enthusiast")
                .summary("Passionate software developer with 4 years of experience building web applications.")
                .skills("Java, Spring Boot, Angular, TypeScript, PostgreSQL, Docker, AWS")
                .experience("Software Developer at StartupXYZ (2022-present)\nJunior Developer at WebDev Co (2020-2022)")
                .education("B.S. Computer Science, University of California (2020)")
                .location("San Francisco, CA")
                .build());

        seekerProfileRepository.save(SeekerProfile.builder()
                .user(seeker2)
                .phone("+1-555-0102")
                .headline("Data Analyst | Sustainability Advocate")
                .summary("Data-driven professional with a passion for environmental sustainability.")
                .skills("Python, SQL, Tableau, Excel, R, Data Visualization, Machine Learning")
                .experience("Data Analyst at DataCorp (2021-present)\nResearch Assistant at University Lab (2019-2021)")
                .education("M.S. Data Science, Stanford University (2021)\nB.S. Statistics, MIT (2019)")
                .location("Austin, TX")
                .build());

        seekerProfileRepository.save(SeekerProfile.builder()
                .user(seeker3)
                .phone("+1-555-0103")
                .headline("UI/UX Designer | Creative Problem Solver")
                .summary("Creative designer with 3 years of experience creating intuitive digital products.")
                .skills("Figma, Adobe XD, Sketch, HTML/CSS, Prototyping, User Research, Design Systems")
                .experience("UI Designer at DesignHub (2022-present)\nFreelance Designer (2020-2022)")
                .education("B.F.A. Graphic Design, Parsons School of Design (2020)")
                .location("New York, NY")
                .build());

        log.info("Database seeding complete!");
        log.info("=== Sample Credentials ===");
        log.info("Admin:    admin@jobboard.com / Admin@123");
        log.info("Employer: employer1@test.com / Password@123");
        log.info("Seeker:   seeker1@test.com / Password@123");
    }
}
