require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  CandidateProfile,
  JobPosting,
  Tag,
  CandidateTag,
  JobTag,
  Interaction,
  Connection
} = require('./models');

const {
  tags,
  candidateProfiles,
  candidateTags,
  jobPostings,
  jobTags,
  initialInteractions
} = require('./schema');

const initialUsers = [
  {
    id: 'user_cand_1',
    email: 'kawin.dev@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'กวินทร์ สุขสวัสดิ์ (Kawin Suk)',
    role: 'candidate',
    candidate_id: 'cand_1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Senior Full-Stack Engineer'
  },
  {
    id: 'user_cand_2',
    email: 'nichapa.ux@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'ณิชาภา วิริยะ (Nichapa V.)',
    role: 'candidate',
    candidate_id: 'cand_2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Product & UI/UX Designer'
  },
  {
    id: 'user_cand_3',
    email: 'thanaphat.ops@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'ธนภัทร วัฒนกุล (Thanaphat W.)',
    role: 'candidate',
    candidate_id: 'cand_3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'DevOps & Cloud Architect'
  },
  {
    id: 'user_cand_4',
    email: 'ploy.frontend@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'พลอยไพลิน เจริญกิจ (Ploypailin C.)',
    role: 'candidate',
    candidate_id: 'cand_4',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    title: 'Frontend React/Next.js Specialist'
  },
  {
    id: 'user_rec_1',
    email: 'recruiter@techscale.io',
    password: bcrypt.hashSync('password123', 10),
    name: 'Tech Innovator HR (Sarah Connor)',
    role: 'recruiter',
    job_id: 'job_101',
    company_name: 'TechScale Innovations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    title: 'Head of Talent Acquisition'
  },
  {
    id: 'user_rec_2',
    email: 'talent@cloudnative.tech',
    password: bcrypt.hashSync('password123', 10),
    name: 'CloudNative Talent (Alex Stone)',
    role: 'recruiter',
    job_id: 'job_102',
    company_name: 'CloudNative Solutions',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    title: 'Tech Recruitment Lead'
  },
  {
    id: 'user_admin_1',
    email: 'admin@matchwork.io',
    password: bcrypt.hashSync('adminpassword', 10),
    name: 'MatchWork System Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    title: 'System Administrator'
  }
];

async function syncAndSeed(options = { force: false }) {
  try {
    const dialect = sequelize.getDialect().toUpperCase();
    console.log(`🔌 Connecting to [${dialect}] at ${sequelize.config.host}:${sequelize.config.port}...`);
    
    await sequelize.authenticate();
    console.log(`✅ Database connection successful!`);

    console.log(`📦 Synchronizing database tables (force: ${options.force})...`);
    await sequelize.sync({ force: options.force, alter: !options.force });
    console.log(`✅ All tables synchronized.`);

    // Check if users already exist
    const userCount = await User.count();
    if (userCount === 0 || options.force) {
      console.log(`🌱 Seeding initial data...`);

      // Seed Tags
      for (const t of tags) {
        await Tag.upsert(t);
      }
      console.log(`   ✔ Seeded ${tags.length} tags`);

      // Seed Candidate Profiles
      for (const cp of candidateProfiles) {
        await CandidateProfile.upsert(cp);
      }
      console.log(`   ✔ Seeded ${candidateProfiles.length} candidate profiles`);

      // Seed Candidate Tags
      for (const ct of candidateTags) {
        await CandidateTag.upsert(ct);
      }
      console.log(`   ✔ Seeded ${candidateTags.length} candidate tags`);

      // Seed Job Postings
      for (const jp of jobPostings) {
        await JobPosting.upsert(jp);
      }
      console.log(`   ✔ Seeded ${jobPostings.length} job postings`);

      // Seed Job Tags
      for (const jt of jobTags) {
        await JobTag.upsert(jt);
      }
      console.log(`   ✔ Seeded ${jobTags.length} job tags`);

      // Seed Interactions
      for (const it of initialInteractions) {
        await Interaction.upsert(it);
      }
      console.log(`   ✔ Seeded initial interactions`);

      // Seed Users with Bcrypt Hashed Passwords
      for (const u of initialUsers) {
        await User.upsert(u);
      }
      console.log(`   ✔ Seeded ${initialUsers.length} users with bcrypt-hashed passwords`);

      console.log(`🎉 Database seeding completed successfully!`);
    } else {
      console.log(`ℹ️ Tables already contain data (${userCount} users found). Skipping seed.`);
    }

    return true;
  } catch (error) {
    const errorMsg = error.parent?.message || error.original?.message || error.message || error;
    console.error(`❌ Database sync/seed error:`, errorMsg);
    console.error(`👉 Tip: Make sure your ${sequelize.getDialect().toUpperCase()} service is started and check .env settings.`);
    return false;
  }
}

// If executed directly from CLI: node src/database/sync.js
if (require.main === module) {
  const force = process.argv.includes('--force') || process.argv.includes('--seed');
  syncAndSeed({ force }).then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { syncAndSeed, initialUsers };
