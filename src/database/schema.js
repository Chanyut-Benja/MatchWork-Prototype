/**
 * Database Schema and Seed Data
 * Simulates a MySQL Relational Schema for the MatchWork application.
 */

const tags = [
  { tag_id: 1, tag_name: 'Node.js', category: 'technical_skill', description: 'Event-driven asynchronous JavaScript runtime for backend services' },
  { tag_id: 2, tag_name: 'React.js', category: 'technical_skill', description: 'Component-based UI development library for web applications' },
  { tag_id: 3, tag_name: 'TypeScript', category: 'technical_skill', description: 'Typed superset of JavaScript that compiles to plain JavaScript' },
  { tag_id: 4, tag_name: 'Docker', category: 'technical_skill', description: 'Containerization platform for application packaging and deployment' },
  { tag_id: 5, tag_name: 'AWS', category: 'technical_skill', description: 'Amazon Web Services cloud computing platform and infrastructure' },
  { tag_id: 6, tag_name: 'PostgreSQL', category: 'technical_skill', description: 'Advanced relational open-source SQL database system' },
  { tag_id: 7, tag_name: 'Figma', category: 'technical_skill', description: 'Collaborative cloud interface design and prototyping tool' },
  { tag_id: 8, tag_name: 'UI/UX Design', category: 'soft_skill', description: 'User-centric product design, wireframing, and usability testing' },
  { tag_id: 9, tag_name: 'Tailwind CSS', category: 'technical_skill', description: 'Utility-first CSS framework for rapid modern UI styling' },
  { tag_id: 10, tag_name: 'Kubernetes', category: 'technical_skill', description: 'Automated container orchestration and cluster management system' },
  { tag_id: 11, tag_name: 'CI/CD Pipelines', category: 'technical_skill', description: 'Continuous integration and continuous deployment pipelines' },
  { tag_id: 12, tag_name: 'Python', category: 'technical_skill', description: 'High-level programming language for data, scripting, and backend APIs' },
  { tag_id: 13, tag_name: 'GraphQL', category: 'technical_skill', description: 'Query language and runtime for declarative API data fetching' },
  { tag_id: 14, tag_name: 'Next.js', category: 'technical_skill', description: 'Full-stack React framework with SSR, SSG, and routing capabilities' }
];

const candidateProfiles = [
  {
    candidate_id: 'cand_1',
    full_name: 'กวินทร์ สุขสวัสดิ์ (Kawin Suk)',
    email: 'kawin.dev@example.com',
    phone: '+66 81 234 5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Senior Full-Stack Engineer',
    experience_years: 5,
    location: 'Bangkok, Thailand',
    latitude: 13.7563,
    longitude: 100.5018,
    expected_salary: 85000,
    work_style: 'hybrid',
    bio: 'Full-Stack Developer หลงใหลใน Modern Web Stack เชี่ยวชาญ Node.js และ React ออกแบบระบบ Scalable Microservices และ CI/CD พร้อมร่วมงานกับทีม High-Performance'
  },
  {
    candidate_id: 'cand_2',
    full_name: 'ณิชาภา วิริยะ (Nichapa V.)',
    email: 'nichapa.ux@example.com',
    phone: '+66 89 876 5432',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Product & UI/UX Designer',
    experience_years: 4,
    location: 'Chiang Mai, Thailand',
    latitude: 18.7883,
    longitude: 98.9853,
    expected_salary: 65000,
    work_style: 'remote',
    bio: 'Product Designer ที่รักการแปลงโจทย์ธุรกิจที่ซับซ้อนให้เป็น User Flow ที่เรียบง่าย มีทักษะด้าน Design System บน Figma และพื้นฐาน Tailwind CSS'
  },
  {
    candidate_id: 'cand_3',
    full_name: 'ธนภัทร วัฒนกุล (Thanaphat W.)',
    email: 'thanaphat.ops@example.com',
    phone: '+66 82 345 6789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'DevOps & Cloud Architect',
    experience_years: 6,
    location: 'Bangkok, Thailand',
    latitude: 13.7460,
    longitude: 100.5347,
    expected_salary: 95000,
    work_style: 'remote',
    bio: 'ผู้เชี่ยวชาญด้าน Cloud Infrastructure, Docker, Kubernetes และ AWS ออโตเมตระบบด้วย Terraform และชำนาญการทำ Zero-Downtime Deployment'
  },
  {
    candidate_id: 'cand_4',
    full_name: 'พลอยไพลิน เจริญกิจ (Ploypailin C.)',
    email: 'ploy.frontend@example.com',
    phone: '+66 84 999 8888',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    title: 'Frontend React/Next.js Specialist',
    experience_years: 3,
    location: 'Bangkok, Thailand',
    latitude: 13.7248,
    longitude: 100.5290,
    expected_salary: 55000,
    work_style: 'hybrid',
    bio: 'Frontend Developer สไตล์ Pixel-Perfect ถนัด React, TypeScript, Next.js และ Tailwind CSS ให้ความสำคัญกับ Web Performance และ Accessible Design'
  }
];

const candidateTags = [
  // cand_1 (Full-Stack)
  { id: 1, candidate_id: 'cand_1', tag_id: 1, weight: 0.95 }, // Node.js
  { id: 2, candidate_id: 'cand_1', tag_id: 2, weight: 0.90 }, // React.js
  { id: 3, candidate_id: 'cand_1', tag_id: 3, weight: 0.85 }, // TypeScript
  { id: 4, candidate_id: 'cand_1', tag_id: 4, weight: 0.75 }, // Docker
  { id: 5, candidate_id: 'cand_1', tag_id: 5, weight: 0.70 }, // AWS
  { id: 6, candidate_id: 'cand_1', tag_id: 6, weight: 0.80 }, // PostgreSQL

  // cand_2 (UI/UX)
  { id: 7, candidate_id: 'cand_2', tag_id: 7, weight: 0.95 }, // Figma
  { id: 8, candidate_id: 'cand_2', tag_id: 8, weight: 0.95 }, // UI/UX Design
  { id: 9, candidate_id: 'cand_2', tag_id: 9, weight: 0.60 }, // Tailwind CSS
  { id: 10, candidate_id: 'cand_2', tag_id: 2, weight: 0.35 }, // React.js

  // cand_3 (DevOps)
  { id: 11, candidate_id: 'cand_3', tag_id: 4, weight: 0.95 }, // Docker
  { id: 12, candidate_id: 'cand_3', tag_id: 5, weight: 0.95 }, // AWS
  { id: 13, candidate_id: 'cand_3', tag_id: 10, weight: 0.90 }, // Kubernetes
  { id: 14, candidate_id: 'cand_3', tag_id: 11, weight: 0.90 }, // CI/CD
  { id: 15, candidate_id: 'cand_3', tag_id: 1, weight: 0.60 }, // Node.js

  // cand_4 (Frontend)
  { id: 16, candidate_id: 'cand_4', tag_id: 2, weight: 0.95 }, // React.js
  { id: 17, candidate_id: 'cand_4', tag_id: 3, weight: 0.85 }, // TypeScript
  { id: 18, candidate_id: 'cand_4', tag_id: 9, weight: 0.90 }, // Tailwind CSS
  { id: 19, candidate_id: 'cand_4', tag_id: 14, weight: 0.85 }, // Next.js
  { id: 20, candidate_id: 'cand_4', tag_id: 1, weight: 0.50 }  // Node.js
];

const jobPostings = [
  {
    job_id: 'job_101',
    company_name: 'TechScale Innovations',
    company_logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
    title: 'Lead Full-Stack Web Developer',
    experience_years_requirement: 4,
    min_salary: 80000,
    max_salary: 110000,
    location: 'Bangkok (BTS Asoke)',
    latitude: 13.7367,
    longitude: 100.5603,
    work_style: 'hybrid',
    employment_type: 'full-time',
    application_deadline: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    description: 'มองหา Full-Stack Engineer มาร่วมสร้างระบบ FinTech Platform รองรับผู้ใช้งานกว่า 1M+ Active Users เน้นเทคโนโลยี Node.js, React และ AWS Cloud',
    contact_email: 'careers@techscale.io',
    contact_phone: '+66 2 987 6543',
    status: 'active'
  },
  {
    job_id: 'job_102',
    company_name: 'CloudNative Solutions',
    company_logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=150&q=80',
    title: 'Senior DevOps & SRE Engineer',
    experience_years_requirement: 5,
    min_salary: 90000,
    max_salary: 130000,
    location: 'Bangkok (Remote-friendly)',
    latitude: 13.7465,
    longitude: 100.5347,
    work_style: 'remote',
    employment_type: 'full-time',
    application_deadline: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    description: 'ดูแลโครงสร้างพื้นฐานบน AWS Multi-Region, บริหารจัดการ Kubernetes Clusters, วางระบบ CI/CD pipeline และสร้าง Observability stack',
    contact_email: 'talent@cloudnative.tech',
    contact_phone: '+66 2 456 7890',
    status: 'active'
  },
  {
    job_id: 'job_103',
    company_name: 'PixelCraft Studio',
    company_logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
    title: 'Senior UI/UX & Product Designer',
    experience_years_requirement: 3,
    min_salary: 60000,
    max_salary: 85000,
    location: 'Bangkok (Silom)',
    latitude: 13.7285,
    longitude: 100.5340,
    work_style: 'hybrid',
    employment_type: 'full-time',
    application_deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    description: 'ออกแบบประสบการณ์ใช้งานแอปพลิเคชันยุคใหม่ ทำงานใกล้ชิดกับทีม Product และ Developers ทำ Design Tokens และ Design System บน Figma',
    contact_email: 'hr@pixelcraft.design',
    contact_phone: '+66 2 333 4444',
    status: 'active'
  },
  {
    job_id: 'job_104',
    company_name: 'FinFlow Global',
    company_logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80',
    title: 'Frontend React Engineer',
    experience_years_requirement: 2,
    min_salary: 50000,
    max_salary: 75000,
    location: 'Bangkok (Sathorn)',
    latitude: 13.7204,
    longitude: 100.5292,
    work_style: 'hybrid',
    employment_type: 'full-time',
    application_deadline: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
    description: 'ร่วมพัฒนา Web Portal ของระบบชำระเงินข้ามพรมแดนด้วย React 18, Next.js, Tailwind CSS และเชื่อมต่อ REST/GraphQL APIs',
    contact_email: 'recruiting@finflow.com',
    contact_phone: '+66 2 555 1234',
    status: 'active'
  },
  {
    job_id: 'job_105',
    company_name: 'Lanna Digital Labs',
    company_logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=150&q=80',
    title: 'Backend TypeScript Contractor',
    experience_years_requirement: 3,
    min_salary: 65000,
    max_salary: 95000,
    location: 'Chiang Mai (Nimman)',
    latitude: 18.7984,
    longitude: 98.9675,
    work_style: 'onsite',
    employment_type: 'contract',
    application_deadline: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    description: 'สัญญาจ้าง 6 เดือน พัฒนา API Gateway และ Microservices ด้วย Node.js, TypeScript และ PostgreSQL ที่ออฟฟิศเชียงใหม่',
    contact_email: 'jobs@lannalabs.th',
    contact_phone: '+66 53 222 888',
    status: 'active'
  },
  {
    job_id: 'job_106',
    company_name: 'Siam Commerce Hub',
    company_logo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=150&q=80',
    title: 'Part-time Next.js Specialist',
    experience_years_requirement: 1,
    min_salary: 30000,
    max_salary: 45000,
    location: 'Bangkok (Ari)',
    latitude: 13.7796,
    longitude: 100.5447,
    work_style: 'onsite',
    employment_type: 'part-time',
    application_deadline: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
    description: 'ร่วมปรับปรุงประสิทธิภาพ Storefront ด้วย Next.js และ Tailwind CSS ทำงานแบบ Part-time 3 วัน/สัปดาห์',
    contact_email: 'talent@siamcommerce.co.th',
    contact_phone: '+66 2 619 7777',
    status: 'active'
  }
];

const jobTags = [
  // job_101 (Lead Full-Stack)
  { id: 101, job_id: 'job_101', tag_id: 1, weight: 0.95 }, // Node.js (High)
  { id: 102, job_id: 'job_101', tag_id: 2, weight: 0.90 }, // React.js (High)
  { id: 103, job_id: 'job_101', tag_id: 3, weight: 0.85 }, // TypeScript
  { id: 104, job_id: 'job_101', tag_id: 4, weight: 0.70 }, // Docker
  { id: 105, job_id: 'job_101', tag_id: 5, weight: 0.75 }, // AWS
  { id: 106, job_id: 'job_101', tag_id: 6, weight: 0.65 }, // PostgreSQL

  // job_102 (DevOps)
  { id: 107, job_id: 'job_102', tag_id: 4, weight: 0.95 }, // Docker
  { id: 108, job_id: 'job_102', tag_id: 5, weight: 0.95 }, // AWS
  { id: 109, job_id: 'job_102', tag_id: 10, weight: 0.90 }, // Kubernetes
  { id: 110, job_id: 'job_102', tag_id: 11, weight: 0.85 }, // CI/CD Pipelines
  { id: 111, job_id: 'job_102', tag_id: 1, weight: 0.50 }, // Node.js

  // job_103 (UI/UX)
  { id: 112, job_id: 'job_103', tag_id: 7, weight: 0.95 }, // Figma
  { id: 113, job_id: 'job_103', tag_id: 8, weight: 0.95 }, // UI/UX Design
  { id: 114, job_id: 'job_103', tag_id: 9, weight: 0.50 }, // Tailwind CSS

  // job_104 (Frontend)
  { id: 115, job_id: 'job_104', tag_id: 2, weight: 0.95 }, // React.js
  { id: 116, job_id: 'job_104', tag_id: 3, weight: 0.85 }, // TypeScript
  { id: 117, job_id: 'job_104', tag_id: 9, weight: 0.80 }, // Tailwind CSS
  { id: 118, job_id: 'job_104', tag_id: 14, weight: 0.75 }, // Next.js

  // job_105 (Backend Contractor)
  { id: 119, job_id: 'job_105', tag_id: 1, weight: 0.95 }, // Node.js
  { id: 120, job_id: 'job_105', tag_id: 3, weight: 0.90 }, // TypeScript
  { id: 121, job_id: 'job_105', tag_id: 6, weight: 0.85 }, // PostgreSQL
  { id: 122, job_id: 'job_105', tag_id: 4, weight: 0.70 }, // Docker

  // job_106 (Part-time Next.js)
  { id: 123, job_id: 'job_106', tag_id: 2, weight: 0.90 }, // React.js
  { id: 124, job_id: 'job_106', tag_id: 14, weight: 0.90 }, // Next.js
  { id: 125, job_id: 'job_106', tag_id: 9, weight: 0.85 }  // Tailwind CSS
];

const initialInteractions = [
  // Seed with one existing interaction so recruiters or candidates already have partial actions
  {
    interaction_id: 1,
    candidate_id: 'cand_1',
    job_id: 'job_102',
    initiator_role: 'candidate',
    action: 'save',
    is_matched: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

module.exports = {
  tags,
  candidateProfiles,
  candidateTags,
  jobPostings,
  jobTags,
  initialInteractions
};
