/**
 * MatchWork - Client-Side Single Page Application Logic
 * Supports JWT / Token Authentication, Multi-Role Access Control,
 * Tag-Weighted Matching Engine, and Double Opt-in Swiping.
 */

// Application State
const state = {
  token: localStorage.getItem('matchwork_token') || null,
  currentUser: null,
  currentRole: 'candidate', // 'candidate' | 'recruiter' | 'admin'
  activePersonaId: 'cand_1',
  personas: { candidates: [], jobs: [] },
  systemTags: [],
  feedCards: [],
  currentIndex: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  currentTranslateX: 0,
  currentTranslateY: 0,
  adminPreviewFeed: 'candidate' // for admin: 'candidate' (viewing jobs) or 'recruiter' (viewing candidates)
};

// DOM Elements
const el = {
  // Views
  authSection: document.getElementById('authSection'),
  mainAppSection: document.getElementById('mainAppSection'),

  // Auth & Landing Modal Elements
  modalAuth: document.getElementById('modalAuth'),
  btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
  authModalTitle: document.getElementById('authModalTitle'),
  btnOpenLoginModal: document.getElementById('btnOpenLoginModal'),
  btnOpenRegisterModal: document.getElementById('btnOpenRegisterModal'),
  btnOpenQuickDemoModal: document.getElementById('btnOpenQuickDemoModal'),
  quickLoginSection: document.getElementById('quickLoginSection'),
  tabBtnLogin: document.getElementById('tabBtnLogin'),
  tabBtnRegister: document.getElementById('tabBtnRegister'),
  formLogin: document.getElementById('formLogin'),
  formRegister: document.getElementById('formRegister'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  btnLoginSubmit: document.getElementById('btnLoginSubmit'),
  btnQuickJobSeeker: document.getElementById('btnQuickJobSeeker'),
  btnQuickRecruiter: document.getElementById('btnQuickRecruiter'),
  btnQuickAdmin: document.getElementById('btnQuickAdmin'),
  btnOpenTestDashboardAuth: document.getElementById('btnOpenTestDashboardAuth'),
  btnOpenTestDashboardAuthMobile: document.getElementById('btnOpenTestDashboardAuthMobile'),

  // Landing Info Modal & Nav
  modalLandingInfo: document.getElementById('modalLandingInfo'),
  landingInfoTitle: document.getElementById('landingInfoTitle'),
  landingInfoBody: document.getElementById('landingInfoBody'),
  btnCloseLandingInfo: document.getElementById('btnCloseLandingInfo'),
  btnLandingInfoAction: document.getElementById('btnLandingInfoAction'),
  navHowItWorks: document.getElementById('navHowItWorks'),
  navFeatures: document.getElementById('navFeatures'),
  navForCompanies: document.getElementById('navForCompanies'),

  // Header & Navigation
  headerRoleBadge: document.getElementById('headerRoleBadge'),
  headerSubtitle: document.getElementById('headerSubtitle'),
  btnOpenProfile: document.getElementById('btnOpenProfile'),
  btnOpenCreateJob: document.getElementById('btnOpenCreateJob'),
  btnFeedAdjustWeights: document.getElementById('btnFeedAdjustWeights'),
  btnFeedPostJob: document.getElementById('btnFeedPostJob'),
  btnOpenAdminPanel: document.getElementById('btnOpenAdminPanel'),
  adminFeedSwitcher: document.getElementById('adminFeedSwitcher'),
  btnAdminViewJobs: document.getElementById('btnAdminViewJobs'),
  btnAdminViewCandidates: document.getElementById('btnAdminViewCandidates'),

  navUserAvatar: document.getElementById('navUserAvatar'),
  navUserName: document.getElementById('navUserName'),
  navUserRole: document.getElementById('navUserRole'),
  btnLogout: document.getElementById('btnLogout'),

  // Top Shortcuts
  btnSimulateMatch: document.getElementById('btnSimulateMatch'),
  btnSimulateMatchMobile: document.getElementById('btnSimulateMatchMobile'),
  btnOpenTestDashboard: document.getElementById('btnOpenTestDashboard'),
  btnOpenTestDashboardMobile: document.getElementById('btnOpenTestDashboardMobile'),
  btnOpenMatches: document.getElementById('btnOpenMatches'),
  badgeMatchCount: document.getElementById('badgeMatchCount'),
  btnOpenFavourites: document.getElementById('btnOpenFavourites'),
  badgeFavouriteCount: document.getElementById('badgeFavouriteCount'),
  btnResetDb: document.getElementById('btnResetDb'),

  // Secondary bar
  personaSelect: document.getElementById('personaSelect'),
  personaAvatar: document.getElementById('personaAvatar'),
  personaName: document.getElementById('personaName'),
  personaSub: document.getElementById('personaSub'),

  // Feed & Cards
  feedTitle: document.getElementById('feedTitle'),
  feedSubtitle: document.getElementById('feedSubtitle'),
  cardDeck: document.getElementById('cardDeck'),
  cardLoading: document.getElementById('cardLoading'),

  btnActionSkip: document.getElementById('btnActionSkip'),
  btnActionSave: document.getElementById('btnActionSave'),
  btnActionBreakdown: document.getElementById('btnActionBreakdown'),
  btnActionInterest: document.getElementById('btnActionInterest'),

  // Modals - Match
  modalMatch: document.getElementById('modalMatch'),
  btnCloseMatchModal: document.getElementById('btnCloseMatchModal'),
  btnViewBreakdownFromMatch: document.getElementById('btnViewBreakdownFromMatch'),
  matchCandidateAvatar: document.getElementById('matchCandidateAvatar'),
  matchCandidateName: document.getElementById('matchCandidateName'),
  matchCompanyAvatar: document.getElementById('matchCompanyAvatar'),
  matchCompanyName: document.getElementById('matchCompanyName'),
  matchJobTitle: document.getElementById('matchJobTitle'),
  matchEmail: document.getElementById('matchEmail'),
  matchPhone: document.getElementById('matchPhone'),
  matchSalary: document.getElementById('matchSalary'),

  // Modals - Breakdown
  modalBreakdown: document.getElementById('modalBreakdown'),
  btnCloseBreakdown: document.getElementById('btnCloseBreakdown'),
  btnCloseBreakdownFooter: document.getElementById('btnCloseBreakdownFooter'),
  breakdownTotalScore: document.getElementById('breakdownTotalScore'),
  breakdownBigScore: document.getElementById('breakdownBigScore'),
  breakdownScoreBadge: document.getElementById('breakdownScoreBadge'),
  breakdownProgressBar: document.getElementById('breakdownProgressBar'),
  breakdownSub: document.getElementById('breakdownSub'),
  breakdownSummaryStats: document.getElementById('breakdownSummaryStats'),
  breakdownTagsList: document.getElementById('breakdownTagsList'),

  // Modals - Tests
  modalTests: document.getElementById('modalTests'),
  btnCloseTests: document.getElementById('btnCloseTests'),
  btnRerunTests: document.getElementById('btnRerunTests'),
  testOverallBadge: document.getElementById('testOverallBadge'),
  testSuitesContainer: document.getElementById('testSuitesContainer'),
  metricTotalSuites: document.getElementById('metricTotalSuites'),
  metricPassedSuites: document.getElementById('metricPassedSuites'),
  metricTotalTests: document.getElementById('metricTotalTests'),
  metricSuccessRate: document.getElementById('metricSuccessRate'),

  // Drawer - Matches List (Slide-out)
  drawerMatchesBackdrop: document.getElementById('drawerMatchesBackdrop'),
  drawerMatches: document.getElementById('drawerMatches'),
  btnCloseMatchesDrawer: document.getElementById('btnCloseMatchesDrawer'),
  btnCloseMatchesDrawerFooter: document.getElementById('btnCloseMatchesDrawerFooter'),
  drawerMatchBadgeCount: document.getElementById('drawerMatchBadgeCount'),
  tabDrawerMatches: document.getElementById('tabDrawerMatches'),
  tabDrawerFavourites: document.getElementById('tabDrawerFavourites'),
  tabBadgeMatches: document.getElementById('tabBadgeMatches'),
  tabBadgeFavourites: document.getElementById('tabBadgeFavourites'),
  matchesContainer: document.getElementById('matchesContainer'),
  favouritesContainer: document.getElementById('favouritesContainer'),

  // Modals - Candidate Profile / Tags
  modalProfile: document.getElementById('modalProfile'),
  btnCloseProfile: document.getElementById('btnCloseProfile'),
  btnCancelProfile: document.getElementById('btnCancelProfile'),
  btnSaveProfileTags: document.getElementById('btnSaveProfileTags'),
  profileSummaryBox: document.getElementById('profileSummaryBox'),
  profileTagsContainer: document.getElementById('profileTagsContainer'),
  profileAddTagSelect: document.getElementById('profileAddTagSelect'),
  btnProfileAddTag: document.getElementById('btnProfileAddTag'),

  // Modals - Recruiter Create Job
  modalCreateJob: document.getElementById('modalCreateJob'),
  btnCloseCreateJob: document.getElementById('btnCloseCreateJob'),
  btnCancelCreateJob: document.getElementById('btnCancelCreateJob'),
  formCreateJob: document.getElementById('formCreateJob'),
  jobTagsSelectorContainer: document.getElementById('jobTagsSelectorContainer'),
  jobAddTagSelect: document.getElementById('jobAddTagSelect'),
  btnJobAddTag: document.getElementById('btnJobAddTag'),

  // Modals - Admin Panel
  modalAdminPanel: document.getElementById('modalAdminPanel'),
  btnCloseAdminPanel: document.getElementById('btnCloseAdminPanel'),
  btnCloseAdminPanelFooter: document.getElementById('btnCloseAdminPanelFooter'),
  tabAdminTags: document.getElementById('tabAdminTags'),
  tabAdminJobs: document.getElementById('tabAdminJobs'),
  tabAdminLogs: document.getElementById('tabAdminLogs'),
  tabAdminStats: document.getElementById('tabAdminStats'),
  adminTabContentTags: document.getElementById('adminTabContentTags'),
  adminTabContentJobs: document.getElementById('adminTabContentJobs'),
  adminTabContentLogs: document.getElementById('adminTabContentLogs'),
  adminTabContentStats: document.getElementById('adminTabContentStats'),
  formAddTag: document.getElementById('formAddTag'),
  adminTagsList: document.getElementById('adminTagsList'),
  adminTagCount: document.getElementById('adminTagCount'),
  adminTagsTableBody: document.getElementById('adminTagsTableBody'),
  adminTagFilterInput: document.getElementById('adminTagFilterInput'),
  btnRefreshAdminTags: document.getElementById('btnRefreshAdminTags'),
  adminJobsTableBody: document.getElementById('adminJobsTableBody'),
  adminJobCount: document.getElementById('adminJobCount'),
  btnRefreshAdminJobs: document.getElementById('btnRefreshAdminJobs'),
  adminLogsTableBody: document.getElementById('adminLogsTableBody'),
  adminLogCount: document.getElementById('adminLogCount'),
  adminStatsGrid: document.getElementById('adminStatsGrid'),
  btnRefreshLogs: document.getElementById('btnRefreshLogs'),

  // Toast
  toast: document.getElementById('toast'),
  toastTitle: document.getElementById('toastTitle'),
  toastMessage: document.getElementById('toastMessage'),
  toastIcon: document.getElementById('toastIcon')
};

// Temporary working state for candidate tags edit
let candidateEditTags = [];

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadSystemTags();
  await checkSessionAndInit();
});

// HTML Escape Helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper for authenticated fetch
async function authFetch(url, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  return fetch(url, { ...options, headers });
}

// ==========================================
// Event Listeners Setup
// ==========================================
function setAuthTab(mode) {
  if (mode === 'register') {
    el.tabBtnRegister.className = 'flex-1 py-2 text-xs font-semibold rounded-xl bg-white text-[#0F172A] shadow-sm transition';
    el.tabBtnLogin.className = 'flex-1 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-[#0F172A] transition';
    el.formRegister.classList.remove('hidden');
    el.formLogin.classList.add('hidden');
    if (el.authModalTitle) el.authModalTitle.innerText = 'สร้างบัญชีใหม่ MatchWork';
  } else {
    el.tabBtnLogin.className = 'flex-1 py-2 text-xs font-semibold rounded-xl bg-white text-[#2563EB] shadow-sm transition';
    el.tabBtnRegister.className = 'flex-1 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-[#0F172A] transition';
    el.formLogin.classList.remove('hidden');
    el.formRegister.classList.add('hidden');
    if (el.authModalTitle) el.authModalTitle.innerText = 'เข้าสู่ระบบ MatchWork';
  }
}

function openAuthModal(mode = 'login') {
  if (!el.modalAuth) return;
  setAuthTab(mode === 'register' ? 'register' : 'login');
  el.modalAuth.classList.remove('hidden');
  if (mode === 'quick' && el.quickLoginSection) {
    setTimeout(() => {
      el.quickLoginSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }
}

function closeAuthModal() {
  if (el.modalAuth) el.modalAuth.classList.add('hidden');
}

function openLandingInfoModal(topic) {
  if (!el.modalLandingInfo) return;
  const contentMap = {
    how: {
      title: 'วิธีใช้งาน MatchWork',
      body: `
        <div class="space-y-2.5 text-xs sm:text-sm text-slate-600">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
            <span class="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <div><strong class="text-[#0F172A]">กำหนดค่าน้ำหนักสกิล:</strong> ปรับค่าความสำคัญของแต่ละทักษะ (0.0 - 1.0) ตามความต้องการจริง</div>
          </div>
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
            <span class="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <div><strong class="text-[#0F172A]">ปัดการ์ดที่ใช่:</strong> ดูคะแนน % Match และ Compatibility Breakdown ก่อนปัดขวา Express Interest</div>
          </div>
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
            <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <div><strong class="text-[#0F172A]">Double Opt-in Match:</strong> เมื่อทั้งสองฝ่ายสนใจตรงกัน ระบบจะปลดล็อกข้อมูลติดต่อทันที</div>
          </div>
        </div>
      `,
      actionText: 'เข้าสู่ระบบเพื่อเริ่มใช้งาน',
      actionMode: 'login'
    },
    features: {
      title: 'ฟีเจอร์แนะนำ (Core Features)',
      body: `
        <div class="grid grid-cols-1 gap-2.5 text-xs sm:text-sm text-slate-600">
          <div class="p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
            <div class="font-bold text-[#2563EB] mb-0.5"><i class="fa-solid fa-scale-balanced mr-1.5"></i>Weighted Tag Matching</div>
            <div>คำนวณคะแนนความเข้ากันได้สองทางแบบเรียลไทม์จากค่าน้ำหนักแท็ก 0.00 - 1.00</div>
          </div>
          <div class="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200">
            <div class="font-bold text-[#4F46E5] mb-0.5"><i class="fa-solid fa-chart-pie mr-1.5"></i>Score Breakdown Analytics</div>
            <div>เจาะลึกคะแนนรายสกิล พร้อมแถบเปรียบเทียบระหว่างผู้สมัครและตำแหน่งงาน</div>
          </div>
          <div class="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div class="font-bold text-emerald-700 mb-0.5"><i class="fa-solid fa-handshake mr-1.5"></i>Double Opt-in Privacy</div>
            <div>ปกป้องข้อมูลติดต่อจนกว่าทั้งสองฝ่ายจะกด Express Interest ให้แก่กัน</div>
          </div>
        </div>
      `,
      actionText: 'ทดลองใช้งาน Quick Demo',
      actionMode: 'quick'
    },
    company: {
      title: 'สำหรับบริษัท (For Tech Recruiters)',
      body: `
        <div class="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>ค้นหา Tech Talent ที่ตรงกับ Tech Stack และวัฒนธรรมทีมของคุณได้เร็วขึ้น ลดเวลาคัดกรองเรซูเม่ที่ไม่ตรงสาย</p>
          <ul class="space-y-1.5 list-disc list-inside text-slate-700">
            <li>สร้างประกาศงานพร้อมระบุค่าน้ำหนักของแต่ละสกิลที่ต้องการ</li>
            <li>ดูคะแนน % Compatibility ของผู้สมัครแต่ละคนทันที</li>
            <li>ทดสอบระบบในมุมมอง Recruiter ได้ทันทีผ่าน Quick Demo Account</li>
          </ul>
        </div>
      `,
      actionText: 'สร้างบัญชีบริษัท / ทดลอง Recruiter',
      actionMode: 'register'
    }
  };
  const data = contentMap[topic] || contentMap.how;
  el.landingInfoTitle.innerText = data.title;
  el.landingInfoBody.innerHTML = data.body;
  el.btnLandingInfoAction.innerText = data.actionText;
  el.btnLandingInfoAction.onclick = () => {
    el.modalLandingInfo.classList.add('hidden');
    openAuthModal(data.actionMode);
  };
  el.modalLandingInfo.classList.remove('hidden');
}

function setupEventListeners() {
  // Landing Hero & Navbar Modal Triggers
  if (el.btnOpenLoginModal) el.btnOpenLoginModal.addEventListener('click', () => openAuthModal('login'));
  if (el.btnOpenRegisterModal) el.btnOpenRegisterModal.addEventListener('click', () => openAuthModal('register'));
  if (el.btnOpenQuickDemoModal) el.btnOpenQuickDemoModal.addEventListener('click', () => openAuthModal('quick'));
  if (el.btnCloseAuthModal) el.btnCloseAuthModal.addEventListener('click', closeAuthModal);

  if (el.navHowItWorks) el.navHowItWorks.addEventListener('click', () => openLandingInfoModal('how'));
  if (el.navFeatures) el.navFeatures.addEventListener('click', () => openLandingInfoModal('features'));
  if (el.navForCompanies) el.navForCompanies.addEventListener('click', () => openLandingInfoModal('company'));
  if (el.btnCloseLandingInfo) {
    el.btnCloseLandingInfo.addEventListener('click', () => el.modalLandingInfo.classList.add('hidden'));
  }

  // Auth Tab Switchers
  el.tabBtnLogin.addEventListener('click', () => setAuthTab('login'));
  el.tabBtnRegister.addEventListener('click', () => setAuthTab('register'));

  // Quick Demo Logins
  el.btnQuickJobSeeker.addEventListener('click', () => handleQuickLogin('candidate'));
  el.btnQuickRecruiter.addEventListener('click', () => handleQuickLogin('recruiter'));
  el.btnQuickAdmin.addEventListener('click', () => handleQuickLogin('admin'));

  // Auth Forms
  el.formLogin.addEventListener('submit', handleLogin);
  el.formRegister.addEventListener('submit', handleRegister);
  el.btnLogout.addEventListener('click', handleLogout);

  // Role Specific Modals Openers
  el.btnOpenProfile.addEventListener('click', openProfileModal);
  el.btnOpenCreateJob.addEventListener('click', openCreateJobModal);
  if (el.btnFeedAdjustWeights) {
    el.btnFeedAdjustWeights.addEventListener('click', openProfileModal);
  }
  if (el.btnFeedPostJob) {
    el.btnFeedPostJob.addEventListener('click', openCreateJobModal);
  }
  if (el.btnJobAddTag) {
    el.btnJobAddTag.addEventListener('click', addTagToJobCreate);
  }
  el.btnOpenAdminPanel.addEventListener('click', openAdminPanelModal);

  // Admin Feed Switcher
  if (el.btnAdminViewJobs) {
    el.btnAdminViewJobs.addEventListener('click', () => switchAdminPreview('candidate'));
  }
  if (el.btnAdminViewCandidates) {
    el.btnAdminViewCandidates.addEventListener('click', () => switchAdminPreview('recruiter'));
  }

  // Persona Dropdown change (Account Switcher)
  el.personaSelect.addEventListener('change', async (e) => {
    state.activePersonaId = e.target.value;
    const isAdmin = ((state.currentUser && state.currentUser.role) || '').toString().trim().toLowerCase() === 'admin';
    if (!isAdmin) {
      await switchAccountPersona(state.activePersonaId, state.currentRole);
    } else {
      syncCurrentUserFromPersona(state.activePersonaId);
    }
    updatePersonaBadge();
    await refreshFeed();
    await updateMatchBadge();
    const isDrawerOpen = el.drawerMatches && !el.drawerMatches.classList.contains('translate-x-full');
    if (isDrawerOpen) {
      await renderMatchesList();
    }
  });

  // Action Buttons
  el.btnActionSkip.addEventListener('click', () => handleCardAction('skip'));
  el.btnActionSave.addEventListener('click', () => handleCardAction('save'));
  el.btnActionInterest.addEventListener('click', () => handleCardAction('express_interest'));
  el.btnActionBreakdown.addEventListener('click', () => openCurrentCardBreakdown());

  // Demo Shortcuts
  el.btnSimulateMatch.addEventListener('click', triggerSimulateMatch);
  if (el.btnSimulateMatchMobile) {
    el.btnSimulateMatchMobile.addEventListener('click', triggerSimulateMatch);
  }
  el.btnResetDb.addEventListener('click', resetDatabase);

  // Unit Test Dashboard Modals
  el.btnOpenTestDashboard.addEventListener('click', openTestDashboard);
  if (el.btnOpenTestDashboardMobile) {
    el.btnOpenTestDashboardMobile.addEventListener('click', openTestDashboard);
  }
  if (el.btnOpenTestDashboardAuth) {
    el.btnOpenTestDashboardAuth.addEventListener('click', openTestDashboard);
  }
  if (el.btnOpenTestDashboardAuthMobile) {
    el.btnOpenTestDashboardAuthMobile.addEventListener('click', openTestDashboard);
  }
  el.btnCloseTests.addEventListener('click', () => el.modalTests.classList.add('hidden'));
  el.btnRerunTests.addEventListener('click', runAndRenderTests);

  // Matches & Favourites Drawer
  el.btnOpenMatches.addEventListener('click', openMatchesDrawer);
  if (el.btnOpenFavourites) {
    el.btnOpenFavourites.addEventListener('click', openFavouritesDrawer);
  }
  if (el.tabDrawerMatches) {
    el.tabDrawerMatches.addEventListener('click', () => switchDrawerTab('matches'));
  }
  if (el.tabDrawerFavourites) {
    el.tabDrawerFavourites.addEventListener('click', () => switchDrawerTab('favourites'));
  }
  if (el.btnCloseMatchesDrawer) {
    el.btnCloseMatchesDrawer.addEventListener('click', closeMatchesDrawer);
  }
  if (el.btnCloseMatchesDrawerFooter) {
    el.btnCloseMatchesDrawerFooter.addEventListener('click', closeMatchesDrawer);
  }
  if (el.drawerMatchesBackdrop) {
    el.drawerMatchesBackdrop.addEventListener('click', closeMatchesDrawer);
  }

  // Match Celebrate Modal
  el.btnCloseMatchModal.addEventListener('click', () => el.modalMatch.classList.add('hidden'));
  el.btnViewBreakdownFromMatch.addEventListener('click', () => {
    el.modalMatch.classList.add('hidden');
    openCurrentCardBreakdown();
  });

  // Breakdown Modal
  el.btnCloseBreakdown.addEventListener('click', () => el.modalBreakdown.classList.add('hidden'));
  el.btnCloseBreakdownFooter.addEventListener('click', () => el.modalBreakdown.classList.add('hidden'));

  // Profile Modal
  el.btnCloseProfile.addEventListener('click', () => el.modalProfile.classList.add('hidden'));
  el.btnCancelProfile.addEventListener('click', () => el.modalProfile.classList.add('hidden'));
  el.btnSaveProfileTags.addEventListener('click', saveCandidateProfileTags);
  el.btnProfileAddTag.addEventListener('click', addTagToProfileEdit);

  // Create Job Modal
  el.btnCloseCreateJob.addEventListener('click', () => el.modalCreateJob.classList.add('hidden'));
  el.btnCancelCreateJob.addEventListener('click', () => el.modalCreateJob.classList.add('hidden'));
  el.formCreateJob.addEventListener('submit', handleCreateJobSubmit);

  // Admin Panel Modal & Tabs
  el.btnCloseAdminPanel.addEventListener('click', () => el.modalAdminPanel.classList.add('hidden'));
  el.btnCloseAdminPanelFooter.addEventListener('click', () => el.modalAdminPanel.classList.add('hidden'));
  el.tabAdminTags.addEventListener('click', () => switchAdminTab('tags'));
  if (el.tabAdminJobs) el.tabAdminJobs.addEventListener('click', () => switchAdminTab('jobs'));
  el.tabAdminLogs.addEventListener('click', () => switchAdminTab('logs'));
  el.tabAdminStats.addEventListener('click', () => switchAdminTab('stats'));
  el.formAddTag.addEventListener('submit', handleAdminAddTag);
  if (el.btnRefreshAdminTags) el.btnRefreshAdminTags.addEventListener('click', () => { loadSystemTags(); renderAdminTags(); });
  if (el.btnRefreshAdminJobs) el.btnRefreshAdminJobs.addEventListener('click', loadAdminJobs);
  if (el.adminTagFilterInput) el.adminTagFilterInput.addEventListener('input', filterAdminTagsTable);
  if (el.adminJobsTableBody) {
    el.adminJobsTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="change-job-status"]');
      if (btn) {
        const jobId = btn.getAttribute('data-job-id');
        const nextStatus = btn.getAttribute('data-status');
        if (jobId && nextStatus) {
          handleJobStatusChange(jobId, nextStatus);
        }
      }
    });
  }
  el.btnRefreshLogs.addEventListener('click', loadAdminLogs);

  // Close modals on outside backdrop click
  [el.modalAuth, el.modalLandingInfo, el.modalMatch, el.modalBreakdown, el.modalTests, el.modalProfile, el.modalCreateJob, el.modalAdminPanel].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }
  });

  // Keyboard navigation & Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMatchesDrawer();
      [el.modalAuth, el.modalLandingInfo, el.modalMatch, el.modalBreakdown, el.modalTests, el.modalProfile, el.modalCreateJob, el.modalAdminPanel].forEach(m => {
        if (m) m.classList.add('hidden');
      });
      return;
    }

    const isDrawerOpen = el.drawerMatches && !el.drawerMatches.classList.contains('translate-x-full');
    const isAnyModalOpen = [el.modalAuth, el.modalLandingInfo, el.modalMatch, el.modalBreakdown, el.modalTests, el.modalProfile, el.modalCreateJob, el.modalAdminPanel]
      .some(m => m && !m.classList.contains('hidden')) || isDrawerOpen;
    if (isAnyModalOpen) return;
    if (el.mainAppSection.classList.contains('hidden')) return;

    if (e.key === 'ArrowLeft') {
      handleCardAction('skip');
    } else if (e.key === 'ArrowRight') {
      handleCardAction('express_interest');
    } else if (e.key === 'ArrowUp') {
      handleCardAction('save');
    }
  });
}

// ==========================================
// Authentication & Session Management
// ==========================================

async function checkSessionAndInit() {
  if (!state.token) {
    showAuthView();
    return;
  }

  try {
    const res = await authFetch('/api/v1/auth/me');
    const json = await res.json();
    if (json.success && json.user) {
      state.currentUser = json.user;
      state.currentRole = json.user.role;
      showMainAppView();
      await initializeAppForUser();
    } else {
      // Invalid session
      clearSession();
      showAuthView();
    }
  } catch (err) {
    console.error('Session check error:', err);
    clearSession();
    showAuthView();
  }
}

function clearSession() {
  state.token = null;
  state.currentUser = null;
  localStorage.removeItem('matchwork_token');
  localStorage.removeItem('matchwork_user');
}

function showAuthView() {
  el.authSection.classList.remove('hidden');
  el.mainAppSection.classList.add('hidden');
}

function showMainAppView() {
  closeAuthModal();
  el.authSection.classList.add('hidden');
  el.mainAppSection.classList.remove('hidden');
}

async function handleQuickLogin(role) {
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const json = await res.json();
    if (json.success) {
      saveSession(json.token, json.user);
      showToast('เข้าสู่ระบบสำเร็จ', json.message, 'success');
      showMainAppView();
      await initializeAppForUser();
    } else {
      showToast('Login Failed', json.message, 'error');
    }
  } catch (err) {
    console.error('Quick login error:', err);
    showToast('Error', 'ไม่สามารถเข้าสู่ระบบได้', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = el.loginEmail.value.trim();
  const password = el.loginPassword.value;

  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (json.success) {
      saveSession(json.token, json.user);
      showToast('เข้าสู่ระบบสำเร็จ', json.message, 'success');
      showMainAppView();
      await initializeAppForUser();
    } else {
      showToast('เข้าสู่ระบบไม่สำเร็จ', json.message, 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const role = document.querySelector('input[name="registerRole"]:checked')?.value || 'candidate';
  const name = document.getElementById('regName').value.trim();
  const title = document.getElementById('regTitle').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const work_style = document.getElementById('regWorkStyle').value;
  const expected_salary = document.getElementById('regSalary').value;

  try {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        name,
        title,
        email,
        password,
        work_style,
        expected_salary,
        company_name: role === 'recruiter' ? name : null
      })
    });
    const json = await res.json();
    if (json.success) {
      saveSession(json.token, json.user);
      showToast('ลงทะเบียนสำเร็จ', json.message, 'success');
      showMainAppView();
      await initializeAppForUser();
      if (json.user.role === 'candidate') {
        // New seekers complete their profile + skill tags straight away
        await openProfileModal();
        document.getElementById('profileOnboardingNote')?.classList.remove('hidden');
      }
    } else {
      showToast('ลงทะเบียนไม่สำเร็จ', json.message, 'error');
    }
  } catch (err) {
    console.error('Register error:', err);
    showToast('Error', 'ไม่สามารถเชื่อมต่อกับ Server ได้', 'error');
  }
}

async function switchAccountPersona(personaId, role) {
  try {
    const res = await fetch('/api/v1/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_id: personaId, role })
    });
    const json = await res.json();
    if (json.success && json.token && json.user) {
      saveSession(json.token, json.user);
      updateNavbarUserUI();
    } else {
      syncCurrentUserFromPersona(personaId);
    }
  } catch (err) {
    console.error('Switch persona error:', err);
    syncCurrentUserFromPersona(personaId);
  }
}

function saveSession(token, user) {
  state.token = token;
  state.currentUser = user;
  state.currentRole = user.role;
  localStorage.setItem('matchwork_token', token);
  localStorage.setItem('matchwork_user', JSON.stringify(user));
}

async function handleLogout() {
  try {
    await authFetch('/api/v1/auth/logout', { method: 'POST' });
  } catch (e) {
    // ignore
  }
  clearSession();
  showToast('ออกจากระบบ', 'เคลียร์เซสชันและออกจากระบบเรียบร้อยแล้ว', 'info');
  showAuthView();
}

// ==========================================
// Role Setup & UI Synchronization
// ==========================================

function updateNavbarUserUI() {
  const user = state.currentUser;
  if (!user) return;

  const isAdmin = (user.role || '').toString().trim().toLowerCase() === 'admin';
  const displayRole = isAdmin && state.currentRole ? state.currentRole : (user.role || state.currentRole || 'candidate');

  if (el.navUserAvatar) {
    el.navUserAvatar.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  }
  if (el.navUserName) {
    el.navUserName.innerText = user.name ? user.name.split(' ')[0] : 'User';
  }
  if (el.navUserRole) {
    el.navUserRole.innerText = displayRole;
  }
}

function syncCurrentUserFromPersona(personaId) {
  const baseUser = state.currentUser || {};
  const isAdmin = (baseUser.role || '').toString().trim().toLowerCase() === 'admin';

  if (state.currentRole === 'candidate') {
    const cand = (state.personas.candidates || []).find(c => c.id === personaId);
    if (cand) {
      state.currentUser = {
        ...baseUser,
        name: cand.name,
        avatar: cand.avatar || baseUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        title: cand.title || 'Job Seeker',
        candidate_id: cand.id,
        role: isAdmin ? baseUser.role : 'candidate'
      };
    }
  } else {
    const job = (state.personas.jobs || []).find(j => j.id === personaId);
    if (job) {
      state.currentUser = {
        ...baseUser,
        name: job.company || job.title,
        company_name: job.company,
        avatar: job.logo || baseUser.avatar || 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=150&q=80',
        title: job.title || 'Recruiter',
        job_id: job.id,
        role: isAdmin ? baseUser.role : 'recruiter'
      };
    }
  }

  if (state.token && state.currentUser) {
    localStorage.setItem('matchwork_user', JSON.stringify(state.currentUser));
  }

  updateNavbarUserUI();
}

async function initializeAppForUser() {
  const user = state.currentUser;
  if (!user) return;

  // Set Top Nav User Details
  updateNavbarUserUI();

  // Load Personas from API
  await loadPersonas();

  // Configure Role Specific UI (Case-insensitive check for 'admin' / 'Admin')
  const userRole = (user.role || '').toString().trim().toLowerCase();

  if (userRole === 'admin') {
    state.currentRole = state.adminPreviewFeed; // default 'candidate' to browse jobs, or 'recruiter'
    state.activePersonaId = state.currentRole === 'candidate' ? 'cand_1' : 'job_101';

    el.headerRoleBadge.innerText = 'Admin View';
    el.headerRoleBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200';

    el.btnOpenProfile.classList.add('hidden');
    el.btnOpenProfile.classList.remove('flex');
    el.btnOpenCreateJob.classList.add('hidden');
    el.btnOpenCreateJob.classList.remove('flex');
    if (el.btnFeedAdjustWeights) el.btnFeedAdjustWeights.classList.add('hidden');
    if (el.btnFeedPostJob) el.btnFeedPostJob.classList.add('hidden');

    // Admin Panel Button: Display in Navbar for Admin accounts
    if (el.btnOpenAdminPanel) {
      el.btnOpenAdminPanel.classList.remove('hidden');
      el.btnOpenAdminPanel.classList.add('flex');
    }
    if (el.adminFeedSwitcher) {
      el.adminFeedSwitcher.classList.remove('hidden');
      el.adminFeedSwitcher.classList.add('flex');
    }

    el.feedTitle.innerText = 'แผงจำลองการจับคู่สำหรับผู้ดูแลระบบ (Admin Preview)';
    el.feedSubtitle.innerText = 'ผู้ดูแลระบบสามารถตรวจสอบคะแนนการแมตช์ สลับมุมมอง และเข้าจัดการข้อมูลระบบได้';

  } else if (userRole === 'recruiter') {
    state.currentRole = 'recruiter';
    state.activePersonaId = user.job_id || 'job_101';

    el.headerRoleBadge.innerText = 'Recruiter View';
    el.headerRoleBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200';

    el.btnOpenProfile.classList.add('hidden');
    el.btnOpenProfile.classList.remove('flex');
    if (el.btnFeedAdjustWeights) el.btnFeedAdjustWeights.classList.add('hidden');
    if (el.btnFeedPostJob) el.btnFeedPostJob.classList.remove('hidden');
    el.btnOpenCreateJob.classList.remove('hidden');
    el.btnOpenCreateJob.classList.add('flex');

    if (el.btnOpenAdminPanel) {
      el.btnOpenAdminPanel.classList.add('hidden');
      el.btnOpenAdminPanel.classList.remove('flex');
    }
    if (el.adminFeedSwitcher) {
      el.adminFeedSwitcher.classList.add('hidden');
      el.adminFeedSwitcher.classList.remove('flex');
    }

    el.feedTitle.innerText = 'ค้นหาผู้สมัครที่มีความเชี่ยวชาญตรงกับโจทย์งาน';
    el.feedSubtitle.innerText = 'เปรียบเทียบ Tag Weight ทักษะของผู้สมัครเทียบกับเกณฑ์ความต้องการของตำแหน่งงาน';

  } else {
    // Default: candidate / job seeker
    state.currentRole = 'candidate';
    state.activePersonaId = user.candidate_id || 'cand_1';

    el.headerRoleBadge.innerText = 'Job Seeker View';
    el.headerRoleBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200';

    el.btnOpenProfile.classList.remove('hidden');
    el.btnOpenProfile.classList.add('flex');
    if (el.btnFeedAdjustWeights) el.btnFeedAdjustWeights.classList.remove('hidden');
    if (el.btnFeedPostJob) el.btnFeedPostJob.classList.add('hidden');
    el.btnOpenCreateJob.classList.add('hidden');
    el.btnOpenCreateJob.classList.remove('flex');

    if (el.btnOpenAdminPanel) {
      el.btnOpenAdminPanel.classList.add('hidden');
      el.btnOpenAdminPanel.classList.remove('flex');
    }
    if (el.adminFeedSwitcher) {
      el.adminFeedSwitcher.classList.add('hidden');
      el.adminFeedSwitcher.classList.remove('flex');
    }

    el.feedTitle.innerText = 'ค้นหางานที่ตรงกับสเปกทักษะของคุณ';
    el.feedSubtitle.innerText = 'ระบบคำนวณคะแนน Weighted Compatibility Score ตามค่าน้ำหนักแท็กของทั้งสองฝ่ายแบบเรียลไทม์';
  }

  populatePersonaDropdown();
  updatePersonaBadge();
  await refreshFeed();
  await updateMatchBadge();
}

function switchAdminPreview(targetRole) {
  state.adminPreviewFeed = targetRole;
  state.currentRole = targetRole;
  state.activePersonaId = targetRole === 'candidate' ? 'cand_1' : 'job_101';

  if (targetRole === 'candidate') {
    el.btnAdminViewJobs.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB] text-white';
    el.btnAdminViewCandidates.className = 'px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-[#0F172A]';
  } else {
    el.btnAdminViewCandidates.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white';
    el.btnAdminViewJobs.className = 'px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-[#0F172A]';
  }

  populatePersonaDropdown();
  syncCurrentUserFromPersona(state.activePersonaId);
  updatePersonaBadge();
  refreshFeed();
  updateMatchBadge();
}

async function loadSystemTags() {
  try {
    const res = await authFetch('/api/v1/tags');
    const json = await res.json();
    if (json.success) {
      state.systemTags = json.data;
    }
  } catch (err) {
    console.error('Failed to load system tags:', err);
  }
}

async function loadPersonas() {
  try {
    const res = await authFetch('/api/v1/personas');
    const json = await res.json();
    if (json.success) {
      state.personas = json.data;
    }
  } catch (err) {
    console.error('Failed to load personas:', err);
  }
}

function populatePersonaDropdown() {
  el.personaSelect.innerHTML = '';

  // Ensure current user is in personas if they are a custom user
  if (state.currentUser) {
    if (state.currentUser.role === 'candidate' && state.currentUser.candidate_id) {
      if (!state.personas.candidates.some(c => c.id === state.currentUser.candidate_id)) {
        state.personas.candidates.unshift({
          id: state.currentUser.candidate_id,
          name: state.currentUser.name,
          title: state.currentUser.title || 'Job Seeker',
          avatar: state.currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
        });
      }
    } else if (state.currentUser.role === 'recruiter' && state.currentUser.job_id) {
      if (!state.personas.jobs.some(j => j.id === state.currentUser.job_id)) {
        state.personas.jobs.unshift({
          id: state.currentUser.job_id,
          company: state.currentUser.company_name || state.currentUser.name,
          title: state.currentUser.title || 'Recruiter Job',
          logo: state.currentUser.avatar || 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=150&q=80'
        });
      }
    }
  }

  const list = state.currentRole === 'candidate' ? state.personas.candidates : state.personas.jobs;

  (list || []).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = state.currentRole === 'candidate' ? `${p.name} (${p.title})` : `${p.company} - ${p.title}`;
    el.personaSelect.appendChild(opt);
  });

  if (!state.activePersonaId && list && list.length > 0) {
    state.activePersonaId = list[0].id;
  }
  el.personaSelect.value = state.activePersonaId;
}

function updatePersonaBadge() {
  if (state.currentRole === 'candidate') {
    let c = (state.personas.candidates || []).find(item => item.id === state.activePersonaId);
    if (!c && state.currentUser && state.currentUser.candidate_id === state.activePersonaId) {
      c = {
        name: state.currentUser.name,
        avatar: state.currentUser.avatar,
        title: state.currentUser.title || 'Candidate'
      };
    }
    if (!c && state.personas.candidates && state.personas.candidates.length > 0) {
      c = state.personas.candidates[0];
    }
    if (c) {
      el.personaAvatar.src = c.avatar || '';
      el.personaName.innerText = c.name ? c.name.split(' ')[0] : 'User';
      el.personaSub.innerText = c.title ? `• ${c.title}` : '';
    }
  } else {
    let j = (state.personas.jobs || []).find(item => item.id === state.activePersonaId);
    if (!j && state.currentUser && state.currentUser.job_id === state.activePersonaId) {
      j = {
        company: state.currentUser.company_name || state.currentUser.name,
        logo: state.currentUser.avatar || state.currentUser.company_logo,
        title: state.currentUser.title || 'Recruiter'
      };
    }
    if (!j && state.personas.jobs && state.personas.jobs.length > 0) {
      j = state.personas.jobs[0];
    }
    if (j) {
      el.personaAvatar.src = j.logo || '';
      el.personaName.innerText = j.company || 'Company';
      el.personaSub.innerText = j.title ? `• ${j.title}` : '';
    }
  }
}

// ==========================================
// Feed Management & Card Rendering
// ==========================================
async function refreshFeed() {
  showLoading(true);
  state.currentIndex = 0;

  try {
    const url = `/api/v1/feed?role=${state.currentRole}&id=${state.activePersonaId}`;
    const res = await authFetch(url);
    const json = await res.json();

    if (json.success) {
      state.feedCards = json.data;
      renderCards();
    } else {
      showToast('ผิดพลาด', json.message || 'ไม่สามารถโหลดฟีดได้', 'error');
    }
  } catch (err) {
    console.error('Error fetching feed:', err);
    showToast('เชื่อมต่อล้มเหลว', 'ไม่สามารถเชื่อมต่อกับ Server ได้', 'error');
  } finally {
    showLoading(false);
  }
}

function showLoading(isLoading) {
  if (isLoading) {
    el.cardLoading.classList.remove('hidden');
  } else {
    el.cardLoading.classList.add('hidden');
  }
}

function renderCards() {
  const existingCards = el.cardDeck.querySelectorAll('.tinder-card');
  existingCards.forEach(c => c.remove());

  const remainingCards = state.feedCards.slice(state.currentIndex);

  if (remainingCards.length === 0) {
    renderEmptyDeck();
    return;
  }

  const maxRender = Math.min(3, remainingCards.length);
  for (let i = maxRender - 1; i >= 0; i--) {
    const cardData = remainingCards[i];
    const cardElement = createCardElement(cardData, i);
    el.cardDeck.appendChild(cardElement);

    if (i === 0) {
      attachDragHandlers(cardElement, cardData);
    }
  }
}

function renderEmptyDeck() {
  const emptyState = document.createElement('div');
  emptyState.className = 'tinder-card card-top flex flex-col items-center justify-between p-6 sm:p-8 text-center bg-white border border-slate-200 shadow-xl relative overflow-hidden';

  const matchesCount = el.badgeMatchCount && !el.badgeMatchCount.classList.contains('hidden') ? el.badgeMatchCount.innerText : '0';

  emptyState.innerHTML = `
    <!-- Glowing background accent -->
    <div class="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
    <div class="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

    <div class="w-full flex justify-between items-center text-[11px] text-slate-500">
      <span class="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 font-mono">
        <i class="fa-solid fa-flag-checkered text-[#2563EB] mr-1"></i> Feed Complete
      </span>
      <span class="text-slate-400">MatchWork Engine</span>
    </div>

    <!-- Center Icon & Message -->
    <div class="my-auto py-4 flex flex-col items-center">
      <div class="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl text-[#2563EB] mb-4 shadow-md shadow-blue-600/10">
        <i class="fa-solid fa-layer-group text-[#2563EB]"></i>
      </div>
      <h3 class="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">ปัดการ์ดครบทั้งหมดแล้ว!</h3>
      <p class="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
        คุณได้พิจารณารายการการ์ดทั้งหมดในระบบแล้ว การ์ดที่เคยกด Skip จะถูกซ่อนอัตโนมัติ คุณสามารถกดปุ่มด้านล่างเพื่อรีเซ็ตการ์ดกลับมาทดสอบปัดซ้ำได้ทันที
      </p>

      <!-- Quick Metrics Strip -->
      <div class="grid grid-cols-2 gap-3 w-full max-w-xs mt-5">
        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <span class="text-[10px] text-slate-500 block">การ์ดในรอบนี้</span>
          <span class="text-base font-extrabold text-[#0F172A]">${state.feedCards.length} ใบ</span>
        </div>
        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <span class="text-[10px] text-slate-500 block">Matches ที่สำเร็จ</span>
          <span class="text-base font-extrabold text-[#2563EB]">${matchesCount} คู่</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="w-full space-y-2 pt-2">
      <button onclick="resetFeedCards()" class="w-full py-3 px-4 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-95">
        <i class="fa-solid fa-rotate-left"></i>
        <span>รีเซ็ตการ์ดเพื่อทดสอบซ้ำ (Reset Cards)</span>
      </button>

      <div class="flex gap-2">
        <button onclick="openMatchesDrawer()" class="flex-1 py-2.5 px-3 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-[#0F172A] border border-slate-200 transition flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-heart text-[#2563EB]"></i>
          <span>ดู Matches Drawer</span>
        </button>
        <button onclick="refreshFeed()" class="py-2.5 px-4 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-rotate-right"></i>
          <span>รีเฟรช</span>
        </button>
      </div>
    </div>
  `;
  el.cardDeck.appendChild(emptyState);
}

/**
 * Resets user's swiped interactions for current persona so all cards reappear
 */
async function resetFeedCards() {
  showToast('Resetting...', 'กำลังรีเซ็ตการ์ดเพื่อนำกลับมาทดสอบซ้ำ...', 'info');
  try {
    const res = await authFetch('/api/v1/feed/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: state.currentRole,
        id: state.activePersonaId
      })
    });
    const json = await res.json();
    if (json.success) {
      showToast('รีเซ็ตสำเร็จ', 'นำการ์ดทั้งหมดกลับมาในฟีดเรียบร้อยแล้ว พร้อมทดสอบซ้ำ', 'success');
      await refreshFeed();
      await updateMatchBadge();
    } else {
      showToast('Error', json.message || 'ไม่สามารถรีเซ็ตการ์ดได้', 'error');
    }
  } catch (err) {
    console.error('Failed to reset cards:', err);
    showToast('Error', 'ไม่สามารถเชื่อมต่อ Server เพื่อรีเซ็ตการ์ดได้', 'error');
  }
}
window.resetFeedCards = resetFeedCards;

function createCardElement(data, stackIndex) {
  const card = document.createElement('div');
  let stackClass = 'card-top';
  if (stackIndex === 1) stackClass = 'card-second';
  if (stackIndex === 2) stackClass = 'card-third';

  card.className = `tinder-card rounded-3xl shadow-xl shadow-slate-200/60 ${stackClass}`;
  card.dataset.cardId = data.card_id;

  const isJob = data.card_type === 'job';
  const score = (isNaN(data.compatibility_score) || data.compatibility_score == null) ? 0 : Math.min(100, Math.max(0, Math.round(data.compatibility_score)));

  let scoreColorClass = 'text-emerald-700 bg-emerald-50/95 border-emerald-200';
  let scoreGlow = 'shadow-emerald-500/10';
  if (score < 40) {
    scoreColorClass = 'text-rose-700 bg-rose-50/95 border-rose-200';
    scoreGlow = 'shadow-rose-500/10';
  } else if (score < 60) {
    scoreColorClass = 'text-amber-700 bg-amber-50/95 border-amber-200';
    scoreGlow = 'shadow-amber-500/10';
  }

  const tagsHtml = (data.tags || []).slice(0, 5).map(t => {
    const rawW = Number(t.weight);
    const weightPct = isNaN(rawW) ? 0 : Math.round(rawW * 100);
    return `
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs text-[11px]">
        <span class="text-[#0F172A] font-medium">${t.tag_name || 'Tag'}</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB]">${weightPct}%</span>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <!-- Swipe Stamps -->
    <div class="stamp-badge stamp-like">INTEREST ★</div>
    <div class="stamp-badge stamp-nope">SKIP ✖</div>
    <div class="stamp-badge stamp-save">SAVED 🔖</div>

    <!-- Card Top Header Image / Banner -->
    <div class="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100 shrink-0">
      <img src="${isJob ? data.company_logo : data.avatar}" alt="Cover" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/35 to-transparent"></div>

      <!-- Compatibility Score Badge -->
      <div class="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full ${scoreColorClass} border shadow-md ${scoreGlow} backdrop-blur-md">
        <i class="fa-solid fa-chart-simple text-xs"></i>
        <span class="font-extrabold text-sm tracking-tight font-mono">${score}%</span>
        <span class="text-[10px] uppercase font-bold tracking-wider opacity-80">Match</span>
      </div>

      <!-- Status indicator if already interacted -->
      ${data.existing_action ? `
        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-[10px] font-semibold text-slate-700 backdrop-blur-md shadow-sm">
          Action: <span class="capitalize text-[#2563EB] font-bold">${data.existing_action}</span>
        </div>
      ` : ''}

      <!-- Bottom Card Title inside banner -->
      <div class="absolute bottom-2.5 left-4 right-4">
        <div class="flex items-center gap-2">
          <h2 class="text-base sm:text-lg font-bold text-white tracking-tight truncate">
            ${isJob ? data.title : data.full_name}
          </h2>
        </div>
        <p class="text-xs text-blue-200 font-medium truncate">
          ${isJob ? `${data.company_name} • ${data.location}` : `${data.title} • ${data.location}`}
        </p>
      </div>
    </div>

    <!-- Card Body Content -->
    <div class="flex-1 p-3.5 sm:p-4 flex flex-col justify-between overflow-y-auto bg-white">
      <div class="space-y-2.5">
        <!-- Key Metrics Strip -->
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-slate-50 rounded-xl p-1.5 sm:p-2 border border-slate-200/80">
            <span class="text-[10px] text-slate-500 block">${isJob ? 'Min Experience' : 'Experience'}</span>
            <span class="font-bold text-[#0F172A] text-[11px] sm:text-xs">${isJob ? `${data.experience_requirement}+ Years` : `${data.experience_years} Years`}</span>
          </div>
          <div class="bg-slate-50 rounded-xl p-1.5 sm:p-2 border border-slate-200/80">
            <span class="text-[10px] text-slate-500 block">Work Style</span>
            <span class="font-bold text-[#0F172A] text-[11px] sm:text-xs capitalize">${data.work_style}</span>
          </div>
          <div class="bg-slate-50 rounded-xl p-1.5 sm:p-2 border border-slate-200/80">
            <span class="text-[10px] text-slate-500 block">${isJob ? 'Salary Budget' : 'Expected Salary'}</span>
            <span class="font-bold text-emerald-600 font-mono text-[11px] truncate block">${isJob ? data.salary_range : data.expected_salary}</span>
          </div>
        </div>

        <!-- Description / Bio -->
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            ${isJob ? 'Job Description' : 'About Candidate'}
          </span>
          <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            ${isJob ? data.description : data.bio}
          </p>
        </div>

        <!-- Tag Weights Cloud -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ${isJob ? 'Required Skill Weights' : 'Candidate Skill Weights'}
            </span>
            <button onclick="event.stopPropagation(); openBreakdownModal('${data.card_id}')" title="ดูคะแนนละเอียด (Compatibility Score Breakdown)" class="text-[11px] text-[#2563EB] hover:text-blue-700 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-blue-50 transition active:scale-95">
              <span>Breakdown &gt;</span>
            </button>
          </div>
          <div class="p-2 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-wrap gap-1.5">
            ${tagsHtml}
          </div>
        </div>
      </div>

      <!-- Quick Hint at bottom of card -->
      <div class="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
        ปัดขวาเพื่อ Express Interest • ปัดซ้ายเพื่อ Skip
      </div>
    </div>
  `;

  return card;
}

// ==========================================
// Touch & Mouse Drag Swiping
// ==========================================
function attachDragHandlers(card, data) {
  const stampLike = card.querySelector('.stamp-like');
  const stampNope = card.querySelector('.stamp-nope');
  const stampSave = card.querySelector('.stamp-save');

  function onPointerDown(e) {
    if (e.target.closest('button') || e.target.closest('a')) return;

    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    card.style.transition = 'none';

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!state.isDragging) return;

    state.currentTranslateX = e.clientX - state.dragStartX;
    state.currentTranslateY = e.clientY - state.dragStartY;

    const rotation = state.currentTranslateX * 0.08;
    card.style.transform = `translate(${state.currentTranslateX}px, ${state.currentTranslateY}px) rotate(${rotation}deg)`;

    const dragProgressX = state.currentTranslateX / 100;
    const dragProgressY = state.currentTranslateY / 100;

    if (dragProgressX > 0.2) {
      stampLike.style.opacity = Math.min(1, dragProgressX);
      stampNope.style.opacity = 0;
      stampSave.style.opacity = 0;
    } else if (dragProgressX < -0.2) {
      stampNope.style.opacity = Math.min(1, Math.abs(dragProgressX));
      stampLike.style.opacity = 0;
      stampSave.style.opacity = 0;
    } else if (dragProgressY < -0.2) {
      stampSave.style.opacity = Math.min(1, Math.abs(dragProgressY));
      stampLike.style.opacity = 0;
      stampNope.style.opacity = 0;
    } else {
      stampLike.style.opacity = 0;
      stampNope.style.opacity = 0;
      stampSave.style.opacity = 0;
    }
  }

  function onPointerUp() {
    if (!state.isDragging) return;
    state.isDragging = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    const threshold = 110;
    if (state.currentTranslateX > threshold) {
      card.classList.add('swipe-right');
      setTimeout(() => executeAction('express_interest', data), 200);
    } else if (state.currentTranslateX < -threshold) {
      card.classList.add('swipe-left');
      setTimeout(() => executeAction('skip', data), 200);
    } else if (state.currentTranslateY < -threshold) {
      card.classList.add('swipe-up');
      setTimeout(() => executeAction('save', data), 200);
    } else {
      card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = '';
      stampLike.style.opacity = 0;
      stampNope.style.opacity = 0;
      stampSave.style.opacity = 0;
    }

    state.currentTranslateX = 0;
    state.currentTranslateY = 0;
  }

  card.addEventListener('pointerdown', onPointerDown);
}

// ==========================================
// Card Actions & Double Opt-in Handling
// ==========================================
function handleCardAction(action) {
  const currentCard = el.cardDeck.querySelector('.card-top');
  if (!currentCard) return;

  const cardData = state.feedCards[state.currentIndex];
  if (!cardData) return;

  if (action === 'skip') {
    currentCard.classList.add('swipe-left');
  } else if (action === 'express_interest') {
    currentCard.classList.add('swipe-right');
  } else if (action === 'save') {
    currentCard.classList.add('swipe-up');
  }

  setTimeout(() => executeAction(action, cardData), 250);
}

/**
 * Helper to build dynamic payload based on currently logged in user & visible card
 */
function buildDynamicMatchPayload(targetCard) {
  if (!targetCard) return null;

  const isCandidateRole = state.currentRole === 'candidate' || (state.currentRole === 'admin' && state.adminPreviewFeed === 'candidate');

  if (isCandidateRole) {
    // Current user is Candidate; target card is Job
    const candidateId = state.activePersonaId || state.currentUser?.candidate_id || 'cand_1';
    const candObj = (state.personas?.candidates || []).find(c => c.id === candidateId) || 
                    (state.currentUser?.candidate_id === candidateId ? state.currentUser : null);

    const realCandSalary = candObj?.expected_salary || state.currentUser?.expected_salary || 85000;
    const candidateData = {
      candidate_id: candidateId,
      full_name: candObj?.name || candObj?.full_name || state.currentUser?.name || 'Candidate',
      avatar: candObj?.avatar || state.currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: candObj?.title || state.currentUser?.title || 'Developer',
      email: state.currentUser?.email || candObj?.email || 'candidate@example.com',
      phone: state.currentUser?.phone || candObj?.phone || '+66 81 234 5678',
      expected_salary: realCandSalary
    };

    const jobData = {
      job_id: targetCard.card_id,
      title: targetCard.title,
      company_name: targetCard.company_name,
      company_logo: targetCard.company_logo,
      salary_range: targetCard.salary_range,
      location: targetCard.location,
      work_style: targetCard.work_style,
      tags: Array.isArray(targetCard.tags) ? targetCard.tags.map(t => t.tag_name || t) : [],
      contact_email: targetCard.contact_email || `careers@${(targetCard.company_name || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      contact_phone: targetCard.contact_phone || '+66 2 987 6543'
    };

    return {
      candidate_id: candidateId,
      job_id: targetCard.card_id,
      initiator_role: 'candidate',
      candidate_data: candidateData,
      job_data: jobData
    };
  } else {
    // Current user is Recruiter; target card is Candidate
    const jobId = state.activePersonaId || state.currentUser?.job_id || 'job_101';
    const jobObj = (state.personas?.jobs || []).find(j => j.id === jobId) || 
                  (state.currentUser?.job_id === jobId ? state.currentUser : null);

    const jobData = {
      job_id: jobId,
      title: jobObj?.title || 'Engineering Team',
      company_name: jobObj?.company || jobObj?.company_name || state.currentUser?.name || 'Tech Company',
      company_logo: jobObj?.logo || state.currentUser?.avatar || 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=150&q=80',
      contact_email: state.currentUser?.email || 'careers@techscale.io',
      contact_phone: '+66 2 987 6543'
    };

    const realCandEmail = targetCard.email || (targetCard.card_id ? `${targetCard.card_id}@example.com` : 'candidate@example.com');
    const realCandSalary = targetCard.raw_expected_salary || targetCard.expected_salary || 'ตามตกลง';

    const candidateData = {
      candidate_id: targetCard.card_id,
      full_name: targetCard.full_name || targetCard.name || 'Candidate',
      avatar: targetCard.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: targetCard.title || 'Developer',
      expected_salary: realCandSalary,
      location: targetCard.location || 'Bangkok, Thailand',
      work_style: targetCard.work_style || 'hybrid',
      tags: Array.isArray(targetCard.tags) ? targetCard.tags.map(t => t.tag_name || t) : [],
      email: realCandEmail,
      phone: targetCard.phone || ('+66 8' + Math.floor(10000000 + Math.random() * 90000000))
    };

    return {
      candidate_id: targetCard.card_id,
      job_id: jobId,
      initiator_role: 'recruiter',
      candidate_data: candidateData,
      job_data: jobData
    };
  }
}

async function executeAction(action, cardData) {
  const payload = buildDynamicMatchPayload(cardData) || {
    candidate_id: state.currentRole === 'candidate' ? state.activePersonaId : cardData.card_id,
    job_id: state.currentRole === 'candidate' ? cardData.card_id : state.activePersonaId,
    initiator_role: state.currentRole
  };

  try {
    const res = await authFetch('/api/v1/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: payload.candidate_id,
        job_id: payload.job_id,
        initiator_role: payload.initiator_role,
        action,
        candidate_data: payload.candidate_data,
        job_data: payload.job_data
      })
    });

    const json = await res.json();

    if (json.success) {
      state.currentIndex++;
      renderCards();

      if (json.match_event) {
        triggerConfettiCelebration();
        openMatchModal(json.match_details);
        await updateMatchBadge();
      } else {
        const actionLabels = {
          skip: 'ข้ามการ์ดแล้ว',
          save: 'บันทึกไว้ในรายการโปรดแล้ว (กดดูได้ที่ไอคอน 🔖 ด้านบน)',
          express_interest: 'ส่งความสนใจ (Express Interest) เรียบร้อย'
        };
        showToast(actionLabels[action] || action, json.message, 'success');
        if (action === 'save') {
          await updateFavouritesBadge();
          if (currentDrawerTab === 'favourites') {
            await renderFavouritesList();
          }
        }
      }
    } else {
      showToast('Error', json.message || 'บันทึกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    console.error('Failed to record action:', err);
    showToast('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
  }
}

// ==========================================
// Modals & Celebrations
// ==========================================
function triggerConfettiCelebration() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  }
}

function openMatchModal(matchDetails) {
  if (!matchDetails) return;

  el.matchCandidateAvatar.src = matchDetails.candidate_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  el.matchCandidateName.innerText = matchDetails.candidate_name || 'Candidate';

  el.matchCompanyAvatar.src = matchDetails.company_logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80';
  el.matchCompanyName.innerText = matchDetails.company_name || 'Company';

  el.matchJobTitle.innerText = `${matchDetails.job_title} @ ${matchDetails.company_name}`;

  const isCandidate = state.currentRole === 'candidate' || (state.currentRole === 'admin' && state.adminPreviewFeed === 'candidate');
  const unlockedEmail = isCandidate 
    ? (matchDetails.contact_email || matchDetails.candidate_email) 
    : (matchDetails.candidate_email || matchDetails.contact_email);
  const unlockedPhone = isCandidate 
    ? (matchDetails.contact_phone || matchDetails.candidate_phone) 
    : (matchDetails.candidate_phone || matchDetails.contact_phone);

  el.matchEmail.innerText = unlockedEmail || 'N/A';
  el.matchPhone.innerText = unlockedPhone || 'N/A';
  const candSalaryText = matchDetails.candidate_expected_salary || 'ตามตกลง';
  const jobSalaryText = matchDetails.salary_range || 'Competitive';

  if (isCandidate) {
    el.matchSalary.innerText = `งบตำแหน่งงาน: ${jobSalaryText} (คุณคาดหวัง: ${candSalaryText})`;
  } else {
    el.matchSalary.innerText = `เงินเดือนที่ผู้สมัครคาดหวัง: ${candSalaryText} (งบตำแหน่ง: ${jobSalaryText})`;
  }

  el.modalMatch.classList.remove('hidden');
}

// ==========================================
// Tag Breakdown Modal
// ==========================================
function openCurrentCardBreakdown() {
  const cardData = state.feedCards[state.currentIndex];
  if (!cardData) {
    showToast('Info', 'ไม่มีการ์ดที่เลือกอยู่', 'info');
    return;
  }
  openBreakdownModal(cardData.card_id);
}

async function openBreakdownModal(targetCardId) {
  let candidateId, jobId;

  // If no targetCardId provided, take from currently visible card
  if (!targetCardId && state.feedCards && state.feedCards[state.currentIndex]) {
    targetCardId = state.feedCards[state.currentIndex].card_id;
  }

  if (targetCardId && String(targetCardId).includes('_job_')) {
    const jobIdx = String(targetCardId).indexOf('_job_');
    candidateId = String(targetCardId).substring(0, jobIdx);
    jobId = String(targetCardId).substring(jobIdx + 1);
  } else if (targetCardId && String(targetCardId).startsWith('cand_') && String(targetCardId).includes('_') && String(targetCardId).split('_').length >= 4) {
    const parts = String(targetCardId).split('_');
    candidateId = `${parts[0]}_${parts[1]}`;
    jobId = `${parts[2]}_${parts[3]}`;
  } else if (targetCardId && String(targetCardId).startsWith('job_')) {
    jobId = targetCardId;
    candidateId = (state.activePersonaId && state.activePersonaId.startsWith('cand_')) ? state.activePersonaId : 'cand_1';
  } else if (targetCardId && String(targetCardId).startsWith('cand_')) {
    candidateId = targetCardId;
    jobId = (state.activePersonaId && state.activePersonaId.startsWith('job_')) ? state.activePersonaId : 'job_101';
  } else {
    candidateId = state.currentRole === 'candidate' ? (state.activePersonaId || 'cand_1') : (targetCardId || 'cand_1');
    jobId = state.currentRole === 'candidate' ? (targetCardId || 'job_101') : (state.activePersonaId || 'job_101');
  }

  try {
    const res = await authFetch(`/api/v1/matches/${candidateId}_${jobId}/breakdown?candidate_id=${encodeURIComponent(candidateId)}&job_id=${encodeURIComponent(jobId)}`);
    const json = await res.json();

    if (json.success) {
      renderBreakdownModal(json);
      el.modalBreakdown.classList.remove('hidden');
    } else {
      showToast('Error', json.message || 'ไม่สามารถดึงข้อมูล Breakdown ได้', 'error');
    }
  } catch (err) {
    console.error('Error fetching breakdown:', err);
    showToast('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
  }
}
window.openBreakdownModal = openBreakdownModal;

function renderBreakdownModal(data) {
  const score = (isNaN(data.compatibility_score) || data.compatibility_score == null) 
    ? (data.overall_score || 0) 
    : Math.min(100, Math.max(0, Math.round(data.compatibility_score)));

  // Update big overall match header
  if (el.breakdownBigScore) {
    el.breakdownBigScore.innerText = `${score}%`;
  }
  if (el.breakdownTotalScore) {
    el.breakdownTotalScore.innerText = `${score}% Overall Match`;
  }
  if (el.breakdownScoreBadge) {
    el.breakdownScoreBadge.innerText = data.match_level || (score >= 80 ? 'Excellent Match' : (score >= 60 ? 'Strong Match' : 'Moderate Match'));
    if (score >= 80) {
      el.breakdownScoreBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    } else if (score >= 60) {
      el.breakdownScoreBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30';
    } else {
      el.breakdownScoreBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30';
    }
  }

  // Animate progress bar
  if (el.breakdownProgressBar) {
    el.breakdownProgressBar.style.width = '0%';
    setTimeout(() => {
      el.breakdownProgressBar.style.width = `${score}%`;
      if (score >= 80) {
        el.breakdownProgressBar.className = 'h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 transition-all duration-700 shadow-sm';
      } else if (score >= 60) {
        el.breakdownProgressBar.className = 'h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-400 transition-all duration-700 shadow-sm';
      } else {
        el.breakdownProgressBar.className = 'h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 transition-all duration-700 shadow-sm';
      }
    }, 50);
  }

  // Subtitle
  const candName = data.candidate?.full_name || 'Candidate';
  const jobComp = data.job?.company_name || 'Company';
  const jobTitle = data.job?.title || 'Job';
  el.breakdownSub.innerHTML = `<span class="text-slate-200 font-semibold">${candName}</span> <span class="text-pink-400">↔</span> <span class="text-slate-200 font-semibold">${jobComp}</span> (${jobTitle})`;

  // Summary stats
  const s = data.summary || {};
  const matchedCount = s.matched_tags_count || 0;
  const missingCount = s.missing_tags_count || 0;
  const earnedWeight = typeof s.earned_weight === 'number' ? s.earned_weight : 0;
  const totalJobWeight = typeof s.total_job_weight === 'number' ? s.total_job_weight : 0;
  const bonusPoints = s.bonus_points || 0;

  el.breakdownSummaryStats.innerHTML = `
    <div>
      <span class="text-slate-400 block text-[10px]">Matched Skills</span>
      <span class="font-bold text-emerald-400 text-xs sm:text-sm flex items-center justify-center gap-1">
        <i class="fa-solid fa-check text-[10px]"></i> ${matchedCount} Tags
      </span>
    </div>
    <div>
      <span class="text-slate-400 block text-[10px]">Missing Skills</span>
      <span class="font-bold ${missingCount > 0 ? 'text-rose-400' : 'text-slate-400'} text-xs sm:text-sm flex items-center justify-center gap-1">
        <i class="fa-solid ${missingCount > 0 ? 'fa-xmark' : 'fa-check'} text-[10px]"></i> ${missingCount} Tags
      </span>
    </div>
    <div>
      <span class="text-slate-400 block text-[10px]">Earned / Max Weight</span>
      <span class="font-bold text-pink-400 text-xs sm:text-sm font-mono">${earnedWeight} / ${totalJobWeight}</span>
    </div>
  `;

  el.breakdownTagsList.innerHTML = '';

  // ==========================================
  // CATEGORY 1: Technical Skills Match
  // ==========================================
  const techCat = data.categories?.technical_skills || {};
  const techSkills = techCat.skills || data.comparison_chart || [];
  const techScore = techCat.score !== undefined ? techCat.score : (s.raw_percentage || 0);

  const matchedTechSkills = techSkills.filter(t => t.status === 'matched');
  const matchedTagsPillsHtml = matchedTechSkills.map(t => {
    return `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/25 text-pink-300 text-[11px] font-medium shadow-sm">
        <i class="fa-solid fa-code text-[9px] text-pink-400"></i>
        <span>${t.skill_name || t.tag_name}</span>
        <strong class="font-mono text-emerald-300 ml-1 font-bold">${t.candidate_percentage || Math.round(t.candidate_weight * 100)}%</strong>
      </span>
    `;
  }).join('');

  const techSection = document.createElement('div');
  techSection.className = 'p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 shadow-sm space-y-3';
  techSection.innerHTML = `
    <div class="flex items-center justify-between pb-2 border-b border-slate-700/50">
      <div class="flex items-center gap-2">
        <span class="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs">
          <i class="fa-solid fa-code"></i>
        </span>
        <div>
          <h4 class="font-bold text-white text-xs sm:text-sm">1. Technical Skills Match</h4>
          <span class="text-[10px] text-slate-400">ทักษะเชิงเทคนิคและความชำนาญการเขียนโค้ด</span>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        ${techScore}% Match
      </span>
    </div>

    <!-- Quick Matching Tags summary with weights -->
    <div>
      <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
        รายการแท็กที่ตรงกันและน้ำหนักทักษะ (Matched Skills & Weights):
      </span>
      <div class="flex flex-wrap gap-1.5">
        ${matchedTagsPillsHtml || '<span class="text-xs text-slate-500 italic">ไม่มีแท็กที่ตรงกัน</span>'}
      </div>
    </div>
  `;
  el.breakdownTagsList.appendChild(techSection);

  // ==========================================
  // CATEGORY 2: Experience & Work Style
  // ==========================================
  const expWorkCat = data.categories?.experience_work_style || {};
  const wsData = expWorkCat.work_style || {};
  const expData = expWorkCat.experience || {};
  const expWorkScore = expWorkCat.score !== undefined ? expWorkCat.score : 100;

  const candWorkStyle = data.candidate?.work_style || wsData.candidate || 'hybrid';
  const jobWorkStyle = data.job?.work_style || wsData.job || 'hybrid';
  const isWorkStyleMatch = wsData.is_match !== undefined ? wsData.is_match : (candWorkStyle.toLowerCase() === jobWorkStyle.toLowerCase());

  const candExp = Number(data.candidate?.experience_years !== undefined ? data.candidate?.experience_years : (expData.candidate_years || 0));
  const jobExpReq = Number(data.job?.experience_years_requirement !== undefined ? data.job?.experience_years_requirement : (expData.job_required_years || 0));
  const isExpMatch = expData.is_match !== undefined ? expData.is_match : (candExp >= jobExpReq);

  const expSection = document.createElement('div');
  expSection.className = 'p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 shadow-sm space-y-3';
  expSection.innerHTML = `
    <div class="flex items-center justify-between pb-2 border-b border-slate-700/50">
      <div class="flex items-center gap-2">
        <span class="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-xs">
          <i class="fa-solid fa-briefcase"></i>
        </span>
        <div>
          <h4 class="font-bold text-white text-xs sm:text-sm">2. Experience & Work Style</h4>
          <span class="text-[10px] text-slate-400">เปรียบเทียบปีประสบการณ์และการทำงาน</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300">
          +${bonusPoints}% Fit Bonus
        </span>
        <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          ${expWorkScore}% Match
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <!-- Work Style Card -->
      <div class="p-3 rounded-xl ${isWorkStyleMatch ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-slate-900/80 border border-slate-800 text-slate-400'} flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
            <i class="fa-solid fa-house-laptop text-pink-400"></i> รูปแบบการทำงาน
          </span>
          <span class="text-[11px] font-bold font-mono ${isWorkStyleMatch ? 'text-emerald-400' : 'text-amber-400'}">
            ${isWorkStyleMatch ? '100% Match' : '75% Compatible'}
          </span>
        </div>
        <p class="text-[11px] font-mono ${isWorkStyleMatch ? 'text-emerald-300 font-semibold' : 'text-slate-300'}">
          ${candWorkStyle.charAt(0).toUpperCase() + candWorkStyle.slice(1)} vs ${jobWorkStyle.charAt(0).toUpperCase() + jobWorkStyle.slice(1)} = ${isWorkStyleMatch ? '100% Match' : 'Partial Match'}
        </p>
        <span class="text-[10px] text-slate-400 mt-1">
          ${isWorkStyleMatch ? 'ผู้สมัครและตำแหน่งงานต้องการทำงานในรูปแบบเดียวกันเป๊ะ' : 'รูปแบบการทำงานต่างกันเล็กน้อยแต่สามารถปรับใช้ร่วมกันได้'}
        </span>
      </div>

      <!-- Experience Card -->
      <div class="p-3 rounded-xl ${isExpMatch ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-slate-900/80 border border-slate-800 text-slate-400'} flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
            <i class="fa-solid fa-user-clock text-amber-400"></i> ปีประสบการณ์
          </span>
          <span class="text-[11px] font-bold font-mono ${isExpMatch ? 'text-emerald-400' : 'text-amber-400'}">
            ${isExpMatch ? '100% Match' : Math.round((candExp / Math.max(1, jobExpReq)) * 100) + '% Match'}
          </span>
        </div>
        <p class="text-[11px] font-mono ${isExpMatch ? 'text-emerald-300 font-semibold' : 'text-slate-300'}">
          ${candExp} ปี vs กำหนดขั้นต่ำ ${jobExpReq} ปี (${isExpMatch ? 'ผ่านเกณฑ์ 100%' : 'ต่ำกว่าเกณฑ์'})
        </p>
        <span class="text-[10px] text-slate-400 mt-1">
          ${isExpMatch ? 'ชั่วโมงบินและความชำนาญตรงตามที่หัวหน้างานต้องการ' : 'ประสบการณ์น้อยกว่าเกณฑ์เล็กน้อยแต่อาจพิจารณาจากผลงานจริง'}
        </span>
      </div>
    </div>
  `;
  el.breakdownTagsList.appendChild(expSection);

  // ==========================================
  // CATEGORY 3: Culture & Preferences
  // ==========================================
  const cultCat = data.categories?.culture_preferences || {};
  const traits = cultCat.traits || [
    {
      trait_name: 'Team Collaboration & Agile Mindset',
      match_percentage: 95,
      description: 'ทักษะการทำงานร่วมกันเป็นทีมและการทำงานแบบ Agile สอดคล้องกันอย่างดี'
    },
    {
      trait_name: 'Continuous Learning & Growth Mindset',
      match_percentage: 96,
      description: 'เปิดรับเทคโนโลยีใหม่และมุ่งพัฒนาตนเองอย่างสม่ำเสมอ'
    },
    {
      trait_name: 'Ownership & Problem Solving',
      match_percentage: 93,
      description: 'มีความรับผิดชอบต่องานตั้งแต่ต้นจนจบ และแก้ไขปัญหาเชิงระบบ'
    }
  ];
  const cultScore = cultCat.score !== undefined ? cultCat.score : 92;

  const cultTraitsHtml = traits.map(tr => {
    return `
      <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-200 text-[11px] flex items-center gap-1.5">
            <i class="fa-solid fa-circle-check text-emerald-400 text-[10px]"></i>
            ${tr.trait_name || tr.name}
          </span>
          <span class="font-mono text-emerald-400 font-bold text-[11px]">${tr.match_percentage || 90}% Match</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500" style="width: ${tr.match_percentage || 90}%;"></div>
        </div>
        <p class="text-[10px] text-slate-400 leading-normal">${tr.description || 'วัฒนธรรมองค์กรสอดคล้องกัน'}</p>
      </div>
    `;
  }).join('');

  const cultSection = document.createElement('div');
  cultSection.className = 'p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 shadow-sm space-y-3';
  cultSection.innerHTML = `
    <div class="flex items-center justify-between pb-2 border-b border-slate-700/50">
      <div class="flex items-center gap-2">
        <span class="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xs">
          <i class="fa-solid fa-heart"></i>
        </span>
        <div>
          <h4 class="font-bold text-white text-xs sm:text-sm">3. Culture & Preferences</h4>
          <span class="text-[10px] text-slate-400">Soft Skills และวัฒนธรรมการทำงานร่วมกัน</span>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
        ${cultScore}% Alignment
      </span>
    </div>

    <div class="space-y-2">
      ${cultTraitsHtml}
    </div>
  `;
  el.breakdownTagsList.appendChild(cultSection);

  // ==========================================
  // COMPARISON BAR CHART & WEIGHTED MATCHING MATRIX
  // ==========================================
  const chartItems = data.comparison_chart || techSkills;

  let chartBarsHtml = '';
  chartItems.forEach(item => {
    const candPct = item.candidate_percentage !== undefined ? item.candidate_percentage : Math.round((item.candidate_weight || 0) * 100);
    const jobPct = item.job_percentage !== undefined ? item.job_percentage : Math.round((item.job_weight || 0) * 100);
    const contrib = typeof item.contribution === 'number' ? item.contribution : 0;
    const skillName = item.skill_name || item.tag_name || 'Skill';

    let badge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">MATCHED</span>';
    if (item.status === 'missing') {
      badge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">MISSING IN CANDIDATE</span>';
    } else if (item.status === 'extra') {
      badge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">BONUS SKILL</span>';
    }

    chartBarsHtml += `
      <div class="p-3 bg-slate-900/70 rounded-xl border border-slate-800 hover:border-slate-700/80 transition space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-100 text-xs sm:text-sm">${skillName}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">${item.category || 'Tech'}</span>
            ${badge}
          </div>
          <div class="text-right font-mono text-xs">
            <span class="text-pink-400 font-bold">${candPct}%</span>
            <span class="text-slate-500">vs</span>
            <span class="text-emerald-400 font-bold">${jobPct}%</span>
            <span class="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">(Synergy: ${contrib.toFixed(2)})</span>
          </div>
        </div>

        <!-- Comparative Dual Horizontal Bar Chart -->
        <div class="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <!-- Candidate Bar -->
          <div class="flex items-center gap-2 text-[10px]">
            <span class="w-24 shrink-0 text-slate-400 font-medium flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-pink-400"></span> Candidate:
            </span>
            <div class="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all duration-500" style="width: ${candPct}%;"></div>
            </div>
            <span class="w-10 font-mono text-right text-pink-300 font-bold">${candPct}%</span>
          </div>

          <!-- Job Requirement Bar -->
          <div class="flex items-center gap-2 text-[10px]">
            <span class="w-24 shrink-0 text-slate-400 font-medium flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Job Target:
            </span>
            <div class="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style="width: ${jobPct}%;"></div>
            </div>
            <span class="w-10 font-mono text-right text-emerald-300 font-bold">${jobPct}%</span>
          </div>
        </div>

        <p class="text-[10px] text-slate-400 leading-relaxed">${item.description || ''}</p>
      </div>
    `;
  });

  const chartSection = document.createElement('div');
  chartSection.className = 'p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 shadow-sm space-y-3';
  chartSection.innerHTML = `
    <div class="flex items-center justify-between pb-2 border-b border-slate-700/50">
      <div class="flex items-center gap-2">
        <span class="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center text-xs">
          <i class="fa-solid fa-chart-column"></i>
        </span>
        <div>
          <h4 class="font-bold text-white text-xs sm:text-sm">Weighted Matching Bar Chart</h4>
          <span class="text-[10px] text-slate-400">เปรียบเทียบค่าน้ำหนัก Candidate Weight vs Job Requirement Weight</span>
        </div>
      </div>
      <div class="flex items-center gap-2 text-[10px]">
        <span class="flex items-center gap-1 text-pink-300"><span class="w-2 h-2 rounded-full bg-pink-400"></span> Candidate</span>
        <span class="flex items-center gap-1 text-emerald-300"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Job Target</span>
      </div>
    </div>

    <!-- Formula Box -->
    <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
      <div class="font-semibold text-slate-200 mb-1 flex items-center gap-1.5 text-[11px]">
        <i class="fa-solid fa-calculator text-pink-400"></i> อัลกอริทึมการคำนวณ Weighted Compatibility:
      </div>
      <p class="font-mono text-[11px] text-pink-300">Score = [ Σ (W_candidate × W_job) / Σ (W_job) ] × 100% + Fit Bonuses</p>
      <div class="mt-2 text-[10px] text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 border-t border-slate-800">
        <div>Σ(W_c × W_j): <strong class="text-pink-300 font-mono">${earnedWeight}</strong></div>
        <div>Σ(W_j): <strong class="text-emerald-300 font-mono">${totalJobWeight}</strong></div>
        <div>Raw Ratio: <strong class="text-slate-200 font-mono">${s.raw_percentage || 0}%</strong></div>
        <div>Fit Bonuses: <strong class="text-amber-300 font-mono">+${bonusPoints}%</strong></div>
      </div>
    </div>

    <!-- Comparison Chart Items -->
    <div class="space-y-2 mt-2">
      ${chartBarsHtml}
    </div>
  `;
  el.breakdownTagsList.appendChild(chartSection);
}

// ==========================================
// Candidate Profile & Tag Weights Modal
// ==========================================
async function openProfileModal() {
  const candidateId = state.currentUser?.candidate_id || state.activePersonaId || 'cand_1';
  try {
    const res = await authFetch(`/api/v1/seekers/preferences/weights?candidate_id=${candidateId}`);
    const json = await res.json();
    if (json.success) {
      candidateEditTags = JSON.parse(JSON.stringify(json.weights || json.tags || []));
      renderProfileModalContent(json.profile);
      renderProfileTagSliders();
      populateProfileAddTagDropdown();
      el.modalProfile.classList.remove('hidden');
    } else {
      showToast('Error', json.message || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้', 'error');
    }
  } catch (err) {
    console.error('Failed to load candidate profile:', err);
    showToast('Error', 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้', 'error');
  }
}

function renderProfileModalContent(profile) {
  if (!profile) return;
  const salary = Number(profile.expected_salary) || 0;
  el.profileSummaryBox.innerHTML = `
    <img src="${escapeHtml(profile.avatar || '')}" alt="" class="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30 bg-slate-200">
    <div class="flex-1 min-w-0">
      <div class="text-sm font-bold text-[#0F172A] truncate">${escapeHtml(profile.full_name)}</div>
      <div class="text-xs text-[#2563EB] font-medium truncate">${escapeHtml(profile.title || 'Job Seeker')} • ${Number(profile.experience_years) || 0} ปีประสบการณ์</div>
      <div class="text-[11px] text-slate-500 mt-0.5 truncate">
        <i class="fa-solid fa-location-dot mr-1"></i>${escapeHtml(profile.location || '-')}
        <span class="mx-1.5">•</span>
        <i class="fa-solid fa-briefcase mr-1"></i>${escapeHtml(profile.work_style || '-')}
        <span class="mx-1.5">•</span>
        <span class="text-emerald-600 font-mono">฿${salary.toLocaleString()}</span>
      </div>
    </div>
  `;

  const set = (id, val) => { const f = document.getElementById(id); if (f) f.value = val ?? ''; };
  set('profFullName', profile.full_name);
  set('profEmail', profile.email || state.currentUser?.email || '');
  set('profTitle', profile.title);
  set('profExperience', profile.experience_years ?? 0);
  set('profSalary', profile.expected_salary || '');
  set('profLocation', profile.location);
  set('profWorkStyle', profile.work_style || 'hybrid');
  set('profPhone', profile.phone);
  set('profBio', profile.bio);
}

function readProfileForm() {
  const val = id => (document.getElementById(id)?.value ?? '').trim();
  return {
    full_name: val('profFullName'),
    email: val('profEmail') || state.currentUser?.email,
    title: val('profTitle'),
    experience_years: val('profExperience') === '' ? 0 : Number(val('profExperience')),
    expected_salary: val('profSalary') === '' ? 0 : Number(val('profSalary')),
    location: val('profLocation'),
    work_style: val('profWorkStyle') || 'hybrid',
    phone: val('profPhone'),
    bio: val('profBio')
  };
}

function renderProfileTagSliders() {
  el.profileTagsContainer.innerHTML = '';

  if (candidateEditTags.length === 0) {
    el.profileTagsContainer.innerHTML = `
      <div class="text-center py-6 text-slate-500 text-xs">ยังไม่มีแท็กสกิลในรายการ กรุณากดเลือกและเพิ่มแท็กด้านล่าง</div>
    `;
    return;
  }

  candidateEditTags.forEach((t, idx) => {
    const weightVal = typeof t.weight === 'number' ? Math.max(0, Math.min(1, t.weight)) : 0.50;
    const pct = Math.round(weightVal * 100);

    const row = document.createElement('div');
    row.className = 'p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs';
    row.innerHTML = `
      <div class="w-32 sm:w-36 shrink-0">
        <div class="font-bold text-[#0F172A] truncate">${escapeHtml(t.tag_name)}</div>
        <div class="text-[10px] text-slate-500 truncate">${escapeHtml(t.category)}</div>
      </div>

      <div class="flex-1 flex items-center gap-2 sm:gap-3">
        <input type="range" min="0.00" max="1.00" step="0.05" value="${weightVal}" data-index="${idx}" class="tag-slider w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" aria-label="น้ำหนัก ${escapeHtml(t.tag_name)}">
        <span class="font-mono font-bold text-[#2563EB] text-xs w-20 text-right" id="pctLabel_${idx}">${weightVal.toFixed(2)} (${pct}%)</span>
      </div>

      <button type="button" onclick="removeTagFromProfileEdit(${idx})" class="text-slate-400 hover:text-rose-500 p-1.5 transition" title="ลบแท็ก" aria-label="ลบแท็ก">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    const slider = row.querySelector('.tag-slider');
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      candidateEditTags[idx].weight = val;
      const lbl = document.getElementById(`pctLabel_${idx}`);
      if (lbl) lbl.innerText = `${val.toFixed(2)} (${Math.round(val * 100)}%)`;
    });

    el.profileTagsContainer.appendChild(row);
  });
}

function populateProfileAddTagDropdown() {
  el.profileAddTagSelect.innerHTML = '<option value="">-- เลือกแท็กมาตรฐานเพื่อเพิ่ม --</option>';
  const existingIds = new Set(candidateEditTags.map(t => Number(t.tag_id)));

  state.systemTags.forEach(t => {
    if (!existingIds.has(Number(t.tag_id))) {
      const opt = document.createElement('option');
      opt.value = t.tag_id;
      opt.textContent = `[${t.category}] ${t.tag_name}`;
      el.profileAddTagSelect.appendChild(opt);
    }
  });
}

function addTagToProfileEdit() {
  const selectedTagId = el.profileAddTagSelect.value;
  if (!selectedTagId) return;

  const foundTag = state.systemTags.find(t => t.tag_id === Number(selectedTagId));
  if (!foundTag) return;

  candidateEditTags.push({
    tag_id: foundTag.tag_id,
    tag_name: foundTag.tag_name,
    category: foundTag.category,
    weight: 0.80
  });

  renderProfileTagSliders();
  populateProfileAddTagDropdown();
}

window.removeTagFromProfileEdit = function(idx) {
  candidateEditTags.splice(idx, 1);
  renderProfileTagSliders();
  populateProfileAddTagDropdown();
};

async function saveCandidateProfileTags() {
  const candidateId = state.currentUser?.candidate_id || state.activePersonaId || 'cand_1';
  const info = readProfileForm();

  if (!info.full_name) {
    showToast('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อ-นามสกุล', 'error');
    document.getElementById('profFullName')?.focus();
    return;
  }
  if (!Number.isFinite(info.experience_years) || info.experience_years < 0 || info.experience_years > 60) {
    showToast('ข้อมูลไม่ถูกต้อง', 'ประสบการณ์ต้องอยู่ระหว่าง 0 – 60 ปี', 'error');
    document.getElementById('profExperience')?.focus();
    return;
  }
  if (!Number.isFinite(info.expected_salary) || info.expected_salary < 0) {
    showToast('ข้อมูลไม่ถูกต้อง', 'เงินเดือนที่คาดหวังต้องเป็นตัวเลขที่ไม่ติดลบ', 'error');
    document.getElementById('profSalary')?.focus();
    return;
  }
  if (candidateEditTags.length === 0) {
    showToast('ยังไม่มีแท็กสกิล', 'เลือกอย่างน้อย 1 แท็กเพื่อให้ระบบจับคู่งานได้', 'error');
    return;
  }

  const btn = document.getElementById('btnSaveProfileTags');
  if (btn) btn.disabled = true;

  try {
    // 1) Profile info -> POST /api/v1/seekers/profile
    const profileRes = await authFetch('/api/v1/seekers/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, ...info })
    });
    const profileJson = await profileRes.json();
    if (!profileJson.success) {
      showToast('บันทึกโปรไฟล์ไม่สำเร็จ', profileJson.message || 'กรุณาตรวจสอบข้อมูล', 'error');
      return;
    }
    const savedProfile = profileJson.data.profile;

    // 2) Tag weights -> PUT /api/v1/seekers/preferences/weights
    const weightsRes = await authFetch('/api/v1/seekers/preferences/weights', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: savedProfile.candidate_id,
        weights: candidateEditTags.map(t => ({
          tag_id: Number(t.tag_id),
          weight: Math.round(Number(t.weight) * 100) / 100
        }))
      })
    });
    const weightsJson = await weightsRes.json();
    if (!(weightsRes.status === 200 || weightsJson.success)) {
      showToast('Error', weightsJson.message || 'ไม่สามารถบันทึกค่าน้ำหนักได้', 'error');
      return;
    }

    // Keep navbar / persona badge in sync with the edited profile
    if (state.currentUser && state.currentUser.role === 'candidate') {
      state.currentUser.candidate_id = savedProfile.candidate_id;
      state.currentUser.name = savedProfile.full_name;
      state.currentUser.email = savedProfile.email || state.currentUser.email;
      state.currentUser.title = savedProfile.title;
      state.currentUser.expected_salary = savedProfile.expected_salary;
      state.currentUser.avatar = savedProfile.avatar || state.currentUser.avatar;
      saveSession(state.token, state.currentUser);
      updateNavbarUserUI();
      state.activePersonaId = savedProfile.candidate_id;
    }

    showToast('สำเร็จ', `${profileJson.message} — คำนวณฟีดใหม่เรียบร้อยแล้ว`, 'success');
    el.modalProfile.classList.add('hidden');
    document.getElementById('profileOnboardingNote')?.classList.add('hidden');
    await loadPersonas();
    populatePersonaDropdown();
    updatePersonaBadge();
    await refreshFeed();
  } catch (err) {
    console.error('Save profile error:', err);
    showToast('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ==========================================
// Recruiter Create Job Modal
// ==========================================
let recruiterJobTags = [
  { tag_id: 1, tag_name: 'Node.js', category: 'Backend', weight: 0.90 },
  { tag_id: 2, tag_name: 'TypeScript', category: 'Programming Languages', weight: 0.85 },
  { tag_id: 7, tag_name: 'PostgreSQL', category: 'Database', weight: 0.80 },
  { tag_id: 9, tag_name: 'Docker', category: 'DevOps & Cloud', weight: 0.75 }
];

function openCreateJobModal() {
  const companyInput = document.getElementById('jobCompany');
  if (companyInput && state.currentUser && state.currentUser.company_name) {
    companyInput.value = state.currentUser.company_name;
  }
  populateJobAddTagDropdown();
  renderJobTagWeightInputs();
  el.modalCreateJob.classList.remove('hidden');
}

function populateJobAddTagDropdown() {
  if (!el.jobAddTagSelect) return;
  el.jobAddTagSelect.innerHTML = '<option value="">-- เลือกแท็กสกิลเพื่อเพิ่มในประกาศงาน --</option>';
  const existingIds = new Set(recruiterJobTags.map(t => Number(t.tag_id)));

  state.systemTags.forEach(t => {
    if (!existingIds.has(Number(t.tag_id))) {
      const opt = document.createElement('option');
      opt.value = t.tag_id;
      opt.textContent = `[${t.category}] ${t.tag_name}`;
      el.jobAddTagSelect.appendChild(opt);
    }
  });
}

function addTagToJobCreate() {
  if (!el.jobAddTagSelect || !el.jobAddTagSelect.value) return;

  const foundTag = state.systemTags.find(t => t.tag_id === Number(el.jobAddTagSelect.value));
  if (!foundTag) return;

  recruiterJobTags.push({
    tag_id: foundTag.tag_id,
    tag_name: foundTag.tag_name,
    category: foundTag.category,
    weight: 0.80
  });

  renderJobTagWeightInputs();
  populateJobAddTagDropdown();
}

window.removeTagFromJobCreate = function(idx) {
  recruiterJobTags.splice(idx, 1);
  renderJobTagWeightInputs();
  populateJobAddTagDropdown();
};

function renderJobTagWeightInputs() {
  el.jobTagsSelectorContainer.innerHTML = '';

  if (recruiterJobTags.length === 0) {
    el.jobTagsSelectorContainer.innerHTML = `
      <div class="text-center py-4 text-slate-500 text-xs">ยังไม่มีแท็กสกิลที่เลือก กรุณาเลือกแท็กจากเมนูด้านบน</div>
    `;
    return;
  }

  recruiterJobTags.forEach((t, idx) => {
    const weightVal = typeof t.weight === 'number' ? Math.max(0, Math.min(1, t.weight)) : 0.80;
    const pct = Math.round(weightVal * 100);

    const row = document.createElement('div');
    row.className = 'p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs';
    row.innerHTML = `
      <div class="w-32 sm:w-36 shrink-0">
        <div class="font-bold text-slate-200 truncate">${t.tag_name}</div>
        <div class="text-[10px] text-emerald-400/80 truncate">${t.category}</div>
      </div>

      <div class="flex-1 flex items-center gap-2 sm:gap-3">
        <input type="range" min="0.00" max="1.00" step="0.05" value="${weightVal}" data-index="${idx}" class="job-tag-slider w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer">
        <span class="font-mono font-bold text-emerald-400 text-xs w-16 text-right" id="jobTagPct_${idx}">${weightVal.toFixed(2)} (${pct}%)</span>
      </div>

      <button type="button" onclick="removeTagFromJobCreate(${idx})" class="text-slate-500 hover:text-rose-400 p-1.5 transition" title="ลบแท็กนี้">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    const slider = row.querySelector('.job-tag-slider');
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      recruiterJobTags[idx].weight = val;
      const lbl = document.getElementById(`jobTagPct_${idx}`);
      if (lbl) lbl.innerText = `${val.toFixed(2)} (${Math.round(val * 100)}%)`;
    });

    el.jobTagsSelectorContainer.appendChild(row);
  });
}

async function handleCreateJobSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('jobTitle').value.trim();
  const company_name = document.getElementById('jobCompany').value.trim();
  const min_salary = Number(document.getElementById('jobMinSalary').value) || 0;
  const max_salary = Number(document.getElementById('jobMaxSalary').value) || 0;
  const experience_years_requirement = Number(document.getElementById('jobExpReq').value) || 0;
  const work_style = document.getElementById('jobWorkStyle').value || 'hybrid';
  const location = document.getElementById('jobLocation').value.trim() || 'Bangkok, Thailand';
  const description = document.getElementById('jobDesc').value.trim() || `เปิดรับสมัครตำแหน่ง ${title} ร่วมงานกับ ${company_name}`;

  if (!title) {
    showToast('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อตำแหน่งงาน (Job Title)', 'error');
    return;
  }
  if (!company_name) {
    showToast('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อบริษัท (Company Name)', 'error');
    return;
  }

  // Format tags
  const tags = recruiterJobTags.map(t => ({
    tag_id: Number(t.tag_id),
    weight: Math.round(Number(t.weight) * 100) / 100
  }));

  const payload = {
    company_name,
    title,
    experience_years_requirement,
    min_salary,
    max_salary,
    tags,
    work_style,
    location,
    description,
    contact_email: state.currentUser?.email || 'careers@example.com',
    contact_phone: '+66 2 987 6543'
  };

  try {
    const res = await authFetch('/api/v1/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (res.status === 201 || json.success) {
      showToast('สำเร็จ', 'สร้างประกาศงานสำเร็จ (Status 201 Created)', 'success');
      el.modalCreateJob.classList.add('hidden');
      await loadPersonas();
      populatePersonaDropdown();
      if (state.currentRole === 'recruiter') {
        state.activePersonaId = json.data.job_id;
        updatePersonaBadge();
        await refreshFeed();
      }
    } else {
      showToast('Error', json.message || 'ไม่สามารถสร้างงานได้', 'error');
    }
  } catch (err) {
    console.error('Job creation failed:', err);
    showToast('Error', 'ไม่สามารถบันทึกตำแหน่งงานได้', 'error');
  }
}

// ==========================================
// Admin Panel Functions
// ==========================================
async function openAdminPanelModal() {
  if (!el.modalAdminPanel) return;
  el.modalAdminPanel.classList.remove('hidden');
  switchAdminTab('tags');
  await loadSystemTags();
  renderAdminTags();
}

function switchAdminTab(tab) {
  const activeClass = 'flex-1 min-w-[200px] py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2';
  const inactiveClass = 'flex-1 min-w-[200px] py-2 px-3 rounded-xl text-slate-400 hover:text-slate-200 font-semibold transition flex items-center justify-center gap-2';

  if (el.tabAdminTags) el.tabAdminTags.className = inactiveClass;
  if (el.tabAdminJobs) el.tabAdminJobs.className = inactiveClass;
  if (el.tabAdminLogs) el.tabAdminLogs.className = 'py-2 px-3 rounded-xl text-slate-400 hover:text-slate-200 font-semibold transition hidden md:flex items-center gap-1.5';
  if (el.tabAdminStats) el.tabAdminStats.className = 'py-2 px-3 rounded-xl text-slate-400 hover:text-slate-200 font-semibold transition hidden md:flex items-center gap-1.5';

  if (el.adminTabContentTags) el.adminTabContentTags.classList.add('hidden');
  if (el.adminTabContentJobs) el.adminTabContentJobs.classList.add('hidden');
  if (el.adminTabContentLogs) el.adminTabContentLogs.classList.add('hidden');
  if (el.adminTabContentStats) el.adminTabContentStats.classList.add('hidden');

  if (tab === 'tags') {
    if (el.tabAdminTags) el.tabAdminTags.className = activeClass;
    if (el.adminTabContentTags) el.adminTabContentTags.classList.remove('hidden');
    renderAdminTags();
  } else if (tab === 'jobs') {
    if (el.tabAdminJobs) el.tabAdminJobs.className = activeClass;
    if (el.adminTabContentJobs) el.adminTabContentJobs.classList.remove('hidden');
    loadAdminJobs();
  } else if (tab === 'logs') {
    if (el.tabAdminLogs) el.tabAdminLogs.className = 'py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition hidden md:flex items-center gap-1.5';
    if (el.adminTabContentLogs) el.adminTabContentLogs.classList.remove('hidden');
    loadAdminLogs();
  } else if (tab === 'stats') {
    if (el.tabAdminStats) el.tabAdminStats.className = 'py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition hidden md:flex items-center gap-1.5';
    if (el.adminTabContentStats) el.adminTabContentStats.classList.remove('hidden');
    loadAdminStats();
  }
}

function getCategoryBadgeClass(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('technical') || cat === 'backend' || cat === 'frontend' || cat === 'language' || cat === 'devops' || cat === 'cloud' || cat === 'database') {
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  } else if (cat.includes('soft') || cat === 'design') {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  } else if (cat.includes('preference')) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (cat.includes('culture')) {
    return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  }
  return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
}

function renderAdminTags(filterQuery = '') {
  const tags = state.systemTags || [];
  if (el.adminTagCount) el.adminTagCount.innerText = tags.length;

  const query = filterQuery.trim().toLowerCase();
  const filteredTags = query
    ? tags.filter(t => t.tag_name.toLowerCase().includes(query) || (t.category && t.category.toLowerCase().includes(query)))
    : tags;

  if (el.adminTagsTableBody) {
    if (filteredTags.length === 0) {
      el.adminTagsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="p-6 text-center text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 block"></i>
            ไม่พบแท็กที่ตรงกับการค้นหา
          </td>
        </tr>
      `;
    } else {
      el.adminTagsTableBody.innerHTML = filteredTags.map(t => {
        const badgeClass = getCategoryBadgeClass(t.category);
        const descText = t.description || '<span class="text-slate-600 italic">ไม่มีคำอธิบาย</span>';
        return `
          <tr class="hover:bg-slate-800/40 transition">
            <td class="p-2.5 text-center font-mono text-slate-500 text-[11px]">#${t.tag_id}</td>
            <td class="p-2.5">
              <span class="font-bold text-white text-xs">${escapeHtml(t.tag_name)}</span>
            </td>
            <td class="p-2.5">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeClass}">
                ${escapeHtml(t.category)}
              </span>
            </td>
            <td class="p-2.5 text-slate-300 text-[11px] max-w-xs truncate" title="${escapeHtml(t.description || '')}">
              ${descText}
            </td>
            <td class="p-2.5 text-center">
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Also update legacy badge list for backward compatibility
  if (el.adminTagsList) {
    el.adminTagsList.innerHTML = '';
    tags.forEach(t => {
      const badge = document.createElement('div');
      badge.className = 'px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs flex items-center gap-1.5';
      badge.innerHTML = `
        <span class="font-bold text-slate-200">${escapeHtml(t.tag_name)}</span>
        <span class="text-[10px] text-amber-400 px-1.5 py-0.2 bg-amber-500/10 rounded font-semibold">${escapeHtml(t.category)}</span>
      `;
      el.adminTagsList.appendChild(badge);
    });
  }
}

function filterAdminTagsTable(e) {
  const query = e.target.value;
  renderAdminTags(query);
}

/**
 * Handle Add New Standard Tag: POST /api/v1/admin/tags
 */
async function handleAdminAddTag(e) {
  e.preventDefault();
  const nameInput = document.getElementById('newTagName');
  const catInput = document.getElementById('newTagCategory');
  const descInput = document.getElementById('newTagDescription');

  const tag_name = nameInput ? nameInput.value.trim() : '';
  const category = catInput ? catInput.value : 'technical_skill';
  const description = descInput ? descInput.value.trim() : '';

  if (!tag_name) {
    showToast('กรุณาระบุชื่อแท็ก', 'ชื่อแท็ก (Tag Name) ห้ามเป็นค่าว่าง', 'error');
    return;
  }

  try {
    const res = await authFetch('/api/v1/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag_name, category, description })
    });
    const json = await res.json();

    if (res.status === 201 || json.success) {
      showToast('เพิ่มแท็กสำเร็จ (201 Created)', `เพิ่มแท็ก "${tag_name}" ในหมวดหมู่ ${category} เข้าสู่คลังแท็กกลางแล้ว`, 'success');
      if (nameInput) nameInput.value = '';
      if (descInput) descInput.value = '';

      // Reload central tags and refresh all selector UI
      await loadSystemTags();
      renderAdminTags();

      // Refresh candidate tag edit selectors & recruiter job post selectors if present
      if (typeof renderCandidateTagSelect === 'function') renderCandidateTagSelect();
      if (typeof renderJobTagSelect === 'function') renderJobTagSelect();
    } else if (res.status === 409) {
      showToast('แท็กซ้ำในระบบ (409 Conflict)', json.message || `แท็ก "${tag_name}" มีอยู่ในระบบแล้ว`, 'warning');
    } else if (res.status === 403) {
      showToast('ไม่มีสิทธิ์เข้าถึง (403 Forbidden)', json.message || 'ต้องเป็นผู้ใช้สิทธิ์ Admin เท่านั้น', 'error');
    } else {
      showToast('เกิดข้อผิดพลาด', json.message || 'ไม่สามารถเพิ่มแท็กได้', 'error');
    }
  } catch (err) {
    console.error('Failed to add tag:', err);
    showToast('Network Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อเพิ่มแท็กได้', 'error');
  }
}

/**
 * Load and render all job postings for Job Moderation Console
 */
async function loadAdminJobs() {
  if (el.adminJobsTableBody) {
    el.adminJobsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-6 text-center text-slate-400">
          <i class="fa-solid fa-spinner fa-spin text-amber-400 text-xl mr-2"></i>
          กำลังโหลดรายการประกาศงานทั้งหมด...
        </td>
      </tr>
    `;
  }

  try {
    const res = await authFetch('/api/v1/admin/jobs');
    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      const jobs = json.data;
      if (el.adminJobCount) el.adminJobCount.innerText = jobs.length;

      if (jobs.length === 0) {
        el.adminJobsTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="p-6 text-center text-slate-500">
              ไม่มีประกาศงานในระบบ
            </td>
          </tr>
        `;
        return;
      }

      el.adminJobsTableBody.innerHTML = jobs.map(job => {
        const isSuspended = job.status === 'suspended';
        const statusBadge = isSuspended
          ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
               <i class="fa-solid fa-ban text-rose-400"></i> Suspended
             </span>`
          : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Active
             </span>`;

        const actionButton = isSuspended
          ? `<button data-action="change-job-status" data-job-id="${escapeHtml(job.job_id)}" data-status="active" onclick="handleJobStatusChange('${escapeHtml(job.job_id)}', 'active')" class="w-full px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer">
               <i class="fa-solid fa-rotate-left"></i>
               <span>เปิดใช้งานใหม่ (Reactivate)</span>
             </button>`
          : `<button data-action="change-job-status" data-job-id="${escapeHtml(job.job_id)}" data-status="suspended" onclick="handleJobStatusChange('${escapeHtml(job.job_id)}', 'suspended')" class="w-full px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer">
               <i class="fa-solid fa-ban"></i>
               <span>ระงับประกาศงาน (Suspend)</span>
             </button>`;

        const tagsHtml = (job.tags || []).slice(0, 3).map(t => `
          <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
            ${escapeHtml(t.tag_name)}
          </span>
        `).join('') + ((job.tags || []).length > 3 ? `<span class="text-[10px] text-slate-500">+${job.tags.length - 3}</span>` : '');

        return `
          <tr class="hover:bg-slate-800/40 transition">
            <td class="p-2.5 text-center font-mono text-slate-400 text-xs font-bold">
              ${escapeHtml(job.job_id)}
            </td>
            <td class="p-2.5">
              <div class="flex items-center gap-2.5">
                <img src="${escapeHtml(job.company_logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80')}" alt="Logo" class="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700">
                <div>
                  <div class="font-bold text-white text-xs">${escapeHtml(job.company_name)}</div>
                  <div class="text-[10px] text-slate-400">${escapeHtml(job.location || 'Bangkok')}</div>
                </div>
              </div>
            </td>
            <td class="p-2.5">
              <div class="font-semibold text-slate-100 text-xs">${escapeHtml(job.title)}</div>
              <div class="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span class="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">${escapeHtml(job.work_style || 'hybrid')}</span>
                <span>•</span>
                <span>฿${(job.min_salary || 0).toLocaleString()} - ฿${(job.max_salary || 0).toLocaleString()}</span>
              </div>
            </td>
            <td class="p-2.5">
              <div class="flex flex-wrap items-center gap-1 max-w-[180px]">
                ${tagsHtml || '<span class="text-[10px] text-slate-500">-</span>'}
              </div>
            </td>
            <td class="p-2.5 text-center">
              ${statusBadge}
            </td>
            <td class="p-2.5 text-center">
              ${actionButton}
            </td>
          </tr>
        `;
      }).join('');
    } else {
      showToast('Error', json.message || 'ไม่สามารถดึงข้อมูลประกาศงานได้', 'error');
    }
  } catch (err) {
    console.error('Failed to load admin jobs:', err);
    if (el.adminJobsTableBody) {
      el.adminJobsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-6 text-center text-rose-400">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i> เกิดข้อผิดพลาดในการโหลดประกาศงาน
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Update Job Status via PATCH /api/v1/admin/jobs/:id/status
 */
async function handleJobStatusChange(jobId, newStatus) {
  try {
    const res = await authFetch(`/api/v1/admin/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const json = await res.json();

    if (res.status === 200 || json.success) {
      if (newStatus === 'suspended') {
        showToast('ระงับประกาศงานแล้ว (Status 200)', `ตำแหน่งงาน ${jobId} ถูกระงับแล้ว และจะไม่ถูกนำไปแสดงในการ์ด Feed ของผู้หางาน`, 'warning');
      } else {
        showToast('เปิดใช้งานใหม่สำเร็จ (Status 200)', `ตำแหน่งงาน ${jobId} กลับสู่สถานะ Active และพร้อมแสดงในการ์ด Feed แล้ว`, 'success');
      }

      // Refresh admin jobs table immediately
      await loadAdminJobs();

      // Refresh candidate feed so suspended jobs disappear or reactivated reappear
      if (typeof refreshFeed === 'function') {
        await refreshFeed();
      }
    } else if (res.status === 403) {
      showToast('ไม่มีสิทธิ์เข้าถึง (403 Forbidden)', json.message || 'ต้องใช้สิทธิ์แอดมินเท่านั้น', 'error');
    } else {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', json.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } catch (err) {
    console.error(`Failed to update job status for ${jobId}:`, err);
    showToast('Network Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่ออัปเดตสถานะงานได้', 'error');
  }
}

// Make handleJobStatusChange globally available for inline onclick
window.handleJobStatusChange = handleJobStatusChange;

async function loadAdminLogs() {
  el.adminLogsTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500">กำลังโหลด logs...</td></tr>`;
  try {
    const res = await authFetch('/api/v1/admin/logs');
    const json = await res.json();
    if (json.success) {
      el.adminLogCount.innerText = json.count;
      el.adminLogsTableBody.innerHTML = '';
      json.data.slice().reverse().forEach(log => {
        const tr = document.createElement('tr');
        const isMatched = log.is_matched;
        const actionBadgeClass = log.action === 'express_interest' ? 'text-emerald-400 font-bold' : (log.action === 'skip' ? 'text-rose-400' : 'text-sky-400');
        tr.innerHTML = `
          <td class="p-2 text-slate-500 text-center">#${log.interaction_id}</td>
          <td class="p-2"><span class="text-white">${escapeHtml(log.candidate_name)}</span> <span class="text-[10px] text-slate-500">(${escapeHtml(log.initiator_role)})</span></td>
          <td class="p-2">${escapeHtml(log.job_title)} @ ${escapeHtml(log.company_name)}</td>
          <td class="p-2 ${actionBadgeClass}">${escapeHtml(log.action)}</td>
          <td class="p-2">${isMatched ? '<span class="text-emerald-400 font-bold">YES (Match)</span>' : '<span class="text-slate-500">Pending</span>'}</td>
          <td class="p-2 text-slate-400">${new Date(log.created_at).toLocaleTimeString('th-TH')}</td>
        `;
        el.adminLogsTableBody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to load admin logs:', err);
  }
}

async function loadAdminStats() {
  el.adminStatsGrid.innerHTML = `
    <div class="col-span-3 text-center py-6 text-slate-500">กำลังดึงข้อมูลสถิติ...</div>
  `;
  try {
    const res = await authFetch('/api/v1/admin/stats');
    const json = await res.json();
    if (json.success) {
      const s = json.data;
      el.adminStatsGrid.innerHTML = `
        <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center">
          <div class="text-[11px] text-slate-400">Total Users</div>
          <div class="text-2xl font-extrabold text-white mt-1">${s.totalUsers}</div>
        </div>
        <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center">
          <div class="text-[11px] text-slate-400">Candidates</div>
          <div class="text-2xl font-extrabold text-pink-400 mt-1">${s.totalCandidates}</div>
        </div>
        <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center">
          <div class="text-[11px] text-slate-400">Job Postings</div>
          <div class="text-2xl font-extrabold text-emerald-400 mt-1">${s.totalJobs}</div>
        </div>
        <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center">
          <div class="text-[11px] text-slate-400">Standard Tags</div>
          <div class="text-2xl font-extrabold text-amber-400 mt-1">${s.totalTags}</div>
        </div>
        <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center">
          <div class="text-[11px] text-slate-400">Total Interactions</div>
          <div class="text-2xl font-extrabold text-purple-400 mt-1">${s.totalInteractions}</div>
        </div>
        <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center">
          <div class="text-[11px] text-slate-400">Double Opt-in Matches</div>
          <div class="text-2xl font-extrabold text-rose-400 mt-1">${s.totalMatches}</div>
        </div>
      `;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// ==========================================
// Test Results Dashboard Modal
// ==========================================
async function openTestDashboard() {
  el.modalTests.classList.remove('hidden');
  await runAndRenderTests();
}

async function runAndRenderTests() {
  el.testSuitesContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center p-8">
      <div class="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p class="text-xs text-slate-400 mt-3 font-medium">กำลังรันชุดทดสอบทั้ง 5 รายการ...</p>
    </div>
  `;

  try {
    const res = await authFetch('/api/v1/test-results');
    const json = await res.json();

    if (json.success) {
      renderTestDashboard(json.data);
    } else {
      showToast('Error', 'ไม่สามารถรันการทดสอบได้', 'error');
    }
  } catch (err) {
    console.error('Failed to run tests:', err);
    showToast('Error', 'ไม่สามารถเชื่อมต่อ Server เพื่อรันการทดสอบได้', 'error');
  }
}

function renderTestDashboard(testReport) {
  el.metricTotalSuites.innerText = testReport.total_suites;
  el.metricPassedSuites.innerText = testReport.passed_suites;
  el.metricTotalTests.innerText = testReport.total_tests;

  const rate = Math.round((testReport.passed_tests / testReport.total_tests) * 100);
  el.metricSuccessRate.innerText = `${rate}%`;

  if (testReport.all_passed) {
    el.testOverallBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-1.5';
    el.testOverallBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span><span>ALL 5 FUNCTIONS PASSED (100%)</span>';
  } else {
    el.testOverallBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200';
    el.testOverallBadge.innerText = 'FAILURES DETECTED';
  }

  el.testSuitesContainer.innerHTML = '';

  const thaiSuiteTitles = {
    'validateCandidateProfile()': 'ฟังก์ชันตรวจสอบโปรไฟล์ผู้สมัคร (Candidate Profile Validation)',
    'validateTagWeight()': 'ฟังก์ชันตรวจสอบค่าน้ำหนักแท็ก (Tag Weight Range & Types)',
    'calculateMatchingScore()': 'ฟังก์ชันคำนวณ Compatibility Score ตามน้ำหนักแท็ก & ป้องกัน NaN',
    'processMatchInteraction()': 'ฟังก์ชันบันทึกการปัดการ์ด & ปลดล็อก Double Opt-in',
    'authorizeEndpointAccess()': 'ฟังก์ชันควบคุมสิทธิ์การเข้าถึงระบบตาม Role (RBAC)'
  };

  testReport.suites.forEach((suite, idx) => {
    const suiteEl = document.createElement('div');
    suiteEl.className = 'bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm';

    const testItemsHtml = suite.tests.map((t, tIdx) => `
      <div class="py-2.5 px-3.5 border-b border-slate-100 last:border-0 flex items-start justify-between gap-3 text-xs hover:bg-slate-50 transition">
        <div class="flex items-start gap-2.5 flex-1 min-w-0">
          <span class="w-5 h-5 rounded-full ${t.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center text-[10px] shrink-0 mt-0.5">
            <i class="fa-solid ${t.passed ? 'fa-check' : 'fa-xmark'}"></i>
          </span>
          <span class="text-[#0F172A] leading-relaxed">${t.name}</span>
        </div>
        <span class="font-mono text-[10px] px-2 py-0.5 rounded-full ${t.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'} font-bold shrink-0">
          ${t.passed ? 'PASSED' : 'FAILED'}
        </span>
      </div>
    `).join('');

    const thaiTitle = thaiSuiteTitles[suite.suite_name] || suite.suite_name;

    suiteEl.innerHTML = `
      <div class="p-3.5 bg-slate-50 flex items-center justify-between border-b border-slate-200">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-xl ${suite.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'} flex items-center justify-center text-xs font-bold font-mono">
            ${idx + 1}
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-[#0F172A] text-xs sm:text-sm font-mono">${suite.suite_name}</h4>
              <span class="px-2 py-0.2 rounded-full text-[10px] font-bold ${suite.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                ${suite.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            <p class="text-[11px] text-[#2563EB] font-medium mt-0.5">${thaiTitle}</p>
            <p class="text-[11px] text-slate-500 mt-0.5">${suite.description}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[11px] text-slate-500 font-mono"><i class="fa-regular fa-clock mr-1 text-slate-400"></i>${suite.duration_ms}ms</span>
          <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${suite.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
            ${suite.tests.filter(t => t.passed).length}/${suite.tests.length}
          </span>
        </div>
      </div>
      <div class="p-2.5 bg-white divide-y divide-slate-100">
        ${testItemsHtml}
      </div>
    `;

    el.testSuitesContainer.appendChild(suiteEl);
  });
}

// ==========================================
// Matches & Favourites Drawer / History
// ==========================================
let currentDrawerTab = 'matches';

function switchDrawerTab(tab) {
  currentDrawerTab = tab;
  if (tab === 'matches') {
    if (el.matchesContainer) el.matchesContainer.classList.remove('hidden');
    if (el.favouritesContainer) el.favouritesContainer.classList.add('hidden');
    if (el.tabDrawerMatches) {
      el.tabDrawerMatches.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-blue-50 text-[#2563EB] border border-blue-200 shadow-2xs';
    }
    if (el.tabDrawerFavourites) {
      el.tabDrawerFavourites.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-sky-50 hover:text-sky-600';
    }
    renderMatchesList();
  } else {
    if (el.matchesContainer) el.matchesContainer.classList.add('hidden');
    if (el.favouritesContainer) el.favouritesContainer.classList.remove('hidden');
    if (el.tabDrawerFavourites) {
      el.tabDrawerFavourites.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-sky-50 text-sky-600 border border-sky-300 shadow-2xs';
    }
    if (el.tabDrawerMatches) {
      el.tabDrawerMatches.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600';
    }
    renderFavouritesList();
  }
}
window.switchDrawerTab = switchDrawerTab;

function openMatchesDrawer() {
  if (el.drawerMatchesBackdrop && el.drawerMatches) {
    el.drawerMatchesBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    el.drawerMatchesBackdrop.classList.add('opacity-100', 'pointer-events-auto');
    el.drawerMatches.classList.remove('translate-x-full');
    el.drawerMatches.classList.add('translate-x-0');
  }
  switchDrawerTab('matches');
}
window.openMatchesDrawer = openMatchesDrawer;

function openFavouritesDrawer() {
  if (el.drawerMatchesBackdrop && el.drawerMatches) {
    el.drawerMatchesBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    el.drawerMatchesBackdrop.classList.add('opacity-100', 'pointer-events-auto');
    el.drawerMatches.classList.remove('translate-x-full');
    el.drawerMatches.classList.add('translate-x-0');
  }
  switchDrawerTab('favourites');
}
window.openFavouritesDrawer = openFavouritesDrawer;

function closeMatchesDrawer() {
  if (el.drawerMatchesBackdrop && el.drawerMatches) {
    el.drawerMatchesBackdrop.classList.add('opacity-0', 'pointer-events-none');
    el.drawerMatchesBackdrop.classList.remove('opacity-100', 'pointer-events-auto');
    el.drawerMatches.classList.add('translate-x-full');
    el.drawerMatches.classList.remove('translate-x-0');
  }
}
window.closeMatchesDrawer = closeMatchesDrawer;

// Legacy alias
const openMatchesListModal = openMatchesDrawer;

function setMatchBadgeCount(count) {
  const safeCount = Number(count) || 0;
  if (el.badgeMatchCount) {
    el.badgeMatchCount.innerText = safeCount > 0 ? String(safeCount) : '0';
    el.badgeMatchCount.classList.toggle('hidden', safeCount === 0);
    el.badgeMatchCount.classList.toggle('flex', safeCount > 0);
  }
  if (el.drawerMatchBadgeCount) {
    el.drawerMatchBadgeCount.innerText = `${safeCount} คู่`;
  }
  if (el.tabBadgeMatches) {
    el.tabBadgeMatches.innerText = String(safeCount);
  }
}

function setFavouriteBadgeCount(count) {
  const safeCount = Number(count) || 0;
  if (el.badgeFavouriteCount) {
    el.badgeFavouriteCount.innerText = safeCount > 0 ? String(safeCount) : '0';
    el.badgeFavouriteCount.classList.toggle('hidden', safeCount === 0);
    el.badgeFavouriteCount.classList.toggle('flex', safeCount > 0);
  }
  if (el.tabBadgeFavourites) {
    el.tabBadgeFavourites.innerText = String(safeCount);
  }
}

async function updateFavouritesBadge() {
  try {
    let url = '/api/v1/interactions?action=save';
    if (state.currentRole === 'candidate' || state.currentRole === 'recruiter') {
      url += `&role=${encodeURIComponent(state.currentRole)}&id=${encodeURIComponent(state.activePersonaId)}`;
    }
    const res = await authFetch(url);
    const json = await res.json();
    if (json.success) {
      const count = json.count !== undefined ? json.count : (json.data ? json.data.length : 0);
      setFavouriteBadgeCount(count);
      return count;
    }
  } catch (err) {
    console.error('Failed to update favourites badge:', err);
  }
  return 0;
}

async function updateMatchBadge() {
  try {
    // Keep favourites badge in sync at the same time
    updateFavouritesBadge();

    let url = '/api/v1/matches';
    if (state.currentRole === 'candidate' || state.currentRole === 'recruiter') {
      url += `?role=${encodeURIComponent(state.currentRole)}&id=${encodeURIComponent(state.activePersonaId)}`;
    }
    const res = await authFetch(url);
    const json = await res.json();
    if (json.success) {
      const count = json.count !== undefined ? json.count : (json.data ? json.data.length : 0);
      setMatchBadgeCount(count);
      return count;
    }
  } catch (err) {
    console.error('Failed to update match badge:', err);
  }
  return 0;
}

/**
 * Connect action for Matched Cards
 * Calls POST /api/v1/matches/:id/connect and unlocks real contact + interview room
 */
async function handleConnectMatch(matchId) {
  const btn = document.getElementById(`btnConnect_${matchId}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-sm"></i> <span>กำลังเชื่อมต่อ...</span>`;
  }

  try {
    const res = await authFetch(`/api/v1/matches/${matchId}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interview_channel: 'Google Meet',
        notes: 'คำขอนัดสัมภาษณ์ส่งเรียบร้อยแล้ว'
      })
    });
    const json = await res.json();

    if (json.success) {
      showToast('เชื่อมต่อสำเร็จ! 🎉', 'เปลี่ยนสถานะเป็น Connected และปลดล็อกข้อมูลติดต่อเรียบร้อยแล้ว', 'success');
      triggerConfettiCelebration();
      await renderMatchesList();
      await updateMatchBadge();
    } else {
      showToast('เกิดข้อผิดพลาด', json.message || 'ไม่สามารถเชื่อมต่อได้', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-handshake text-sm"></i> <span>เชื่อมต่อ / นัดสัมภาษณ์ (Connect)</span>`;
      }
    }
  } catch (err) {
    console.error('Failed to connect match:', err);
    showToast('เกิดข้อผิดพลาด', 'เชื่อมต่อล้มเหลว กรุณาลองใหม่อีกครั้ง', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-handshake text-sm"></i> <span>เชื่อมต่อ / นัดสัมภาษณ์ (Connect)</span>`;
    }
  }
}
window.handleConnectMatch = handleConnectMatch;

async function renderMatchesList() {
  if (!el.matchesContainer) return;

  el.matchesContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center p-8 text-center">
      <div class="w-8 h-8 border-3 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
      <p class="text-xs text-slate-400 mt-3 font-medium">กำลังโหลดรายการ Matches ของคุณ...</p>
    </div>
  `;

  try {
    let url = '/api/v1/matches';
    if (state.currentRole === 'candidate' || state.currentRole === 'recruiter') {
      url += `?role=${encodeURIComponent(state.currentRole)}&id=${encodeURIComponent(state.activePersonaId)}`;
    }
    const res = await authFetch(url);
    const json = await res.json();

    if (json.success) {
      const matches = json.data || [];

      // Update drawer & navbar badge counts
      setMatchBadgeCount(matches.length);

      if (matches.length === 0) {
        el.matchesContainer.innerHTML = `
          <div class="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 text-xs">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl text-slate-400 mx-auto mb-3">
              <i class="fa-solid fa-heart-crack"></i>
            </div>
            <h4 class="font-bold text-slate-800 text-sm mb-1">ยังไม่มีรายการที่ Match สำเร็จ</h4>
            <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed mb-4">
              เมื่อคุณและอีกฝ่ายกด Express Interest ให้แก่กัน ระบบจะสร้าง Mutual Match และแสดงในหน้านี้ทันที
            </p>
            <button onclick="triggerSimulateMatch()" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1.5 active:scale-95">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>จำลองการ Match ทันที (Simulate Match)</span>
            </button>
          </div>
        `;
        return;
      }

      el.matchesContainer.innerHTML = '';
      matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'p-3.5 bg-white rounded-2xl border ' +
          (m.is_connected ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-slate-300') +
          ' shadow-sm space-y-2.5 transition-all duration-200';

        const isCandidateView = state.currentRole === 'candidate';

        // Person & Company Information
        const personAvatar = isCandidateView ? (m.company_logo || m.candidate_avatar) : m.candidate_avatar;
        const subAvatar = isCandidateView ? m.candidate_avatar : m.company_logo;
        const personName = isCandidateView ? m.company_name : m.candidate_name;
        const personTitle = isCandidateView ? m.job_title : m.candidate_title;
        const companyInfo = isCandidateView ? `${m.company_name} • ${m.location || 'Bangkok'}` : `${m.company_name} (ตำแหน่ง: ${m.job_title})`;

        // Contact info
        const displayEmail = isCandidateView ? (m.contact_email || m.candidate_email) : (m.candidate_email || m.contact_email);
        const displayPhone = isCandidateView ? (m.contact_phone || m.candidate_phone) : (m.candidate_phone || m.contact_phone);

        // Tags to display
        const skillList = isCandidateView
          ? ((m.job_tags && m.job_tags.length > 0) ? m.job_tags : (m.primary_skills || ['Full-Stack', 'Cloud']))
          : ((m.candidate_tags && m.candidate_tags.length > 0) ? m.candidate_tags : (m.primary_skills || ['Node.js', 'React.js', 'TypeScript']));

        const matchPercent = m.match_percentage || m.compatibility_score || 92;

        item.innerHTML = `
          <!-- แถวบนสุด: Badge สถานะ + คะแนน Match % และวันที่ -->
          <div class="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
            <div class="flex items-center gap-1.5">
              ${m.is_connected ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <i class="fa-solid fa-circle-check text-emerald-500"></i> Connected
                </span>
              ` : `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <i class="fa-solid fa-handshake text-amber-500"></i> Mutual Match
                </span>
              `}
            </div>
            <div class="flex items-center gap-2 shrink-0 text-xs">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 font-bold">
                <i class="fa-solid fa-bolt text-amber-500 text-[10px]"></i> ${matchPercent}% Match
              </span>
              <span class="text-slate-400 font-mono">
                ${m.matched_at ? new Date(m.matched_at).toLocaleDateString('th-TH') : 'วันนี้'}
              </span>
            </div>
          </div>

          <!-- แถวกลาง (โปรไฟล์): รูปวงกลมด้านซ้าย + ชื่อเต็ม + ตำแหน่งงานและบริษัท -->
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <img src="${personAvatar}" alt="${personName}" class="w-14 h-14 rounded-full object-cover ring-2 ${m.is_connected ? 'ring-emerald-200' : 'ring-slate-200'} bg-slate-100">
              <img src="${subAvatar}" alt="Secondary" class="w-5 h-5 rounded-full object-cover absolute -bottom-0.5 -right-0.5 ring-2 ring-white bg-slate-100">
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-base font-bold text-[#0F172A] leading-snug truncate">${personName}</h4>
              <p class="text-xs text-slate-600 font-medium truncate mt-0.5">${personTitle}</p>
              <p class="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <i class="fa-solid fa-building text-slate-400 text-[10px] shrink-0"></i>
                <span class="truncate">${companyInfo}</span>
              </p>
              ${isCandidateView ? `
                <div class="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
                  <i class="fa-solid fa-money-bill-wave text-emerald-600 shrink-0"></i>
                  <span>งบงาน: <strong>${m.salary_range}</strong></span>
                  ${m.candidate_expected_salary ? `<span class="text-slate-400 text-[11px] font-mono">(คุณคาดหวัง: ${m.candidate_expected_salary})</span>` : ''}
                </div>
              ` : `
                <div class="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
                  <i class="fa-solid fa-money-bill-wave text-emerald-600 shrink-0"></i>
                  <span>ผู้สมัครคาดหวัง: <strong class="text-emerald-800">${m.candidate_expected_salary || 'ตามตกลง'}</strong></span>
                  <span class="text-slate-400 text-[11px]">(งบงาน: ${m.salary_range})</span>
                </div>
              `}
            </div>
          </div>

          <!-- แถวสกิล: แท็กสกิลหลักแบบกะทัดรัด -->
          <div class="flex flex-wrap gap-1.5">
            ${skillList.slice(0, 5).map(skill => `
              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-medium inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                ${skill}
              </span>
            `).join('')}
          </div>

          <!-- ข้อมูลติดต่อ / ปุ่ม Connect -->
          ${m.is_connected ? `
            <!-- CONNECTED STATE: แสดงข้อมูลติดต่อจริง (อีเมล และช่องทางสัมภาษณ์) -->
            <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5 text-xs space-y-1.5">
              <div class="text-[11px] font-bold text-emerald-700 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-lock-open text-emerald-600"></i> ข้อมูลติดต่อ (ปลดล็อกแล้ว)
                </span>
                <span class="text-emerald-700 font-mono text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded-full">CONNECTED</span>
              </div>

              <!-- อีเมลจริง -->
              <div class="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                <div class="flex items-center gap-2 text-slate-700 truncate min-w-0">
                  <i class="fa-solid fa-envelope text-blue-500 w-3.5 text-center shrink-0"></i>
                  <a href="mailto:${displayEmail}" class="font-mono text-xs text-slate-800 hover:text-blue-600 hover:underline truncate">${displayEmail}</a>
                </div>
                <button onclick="navigator.clipboard.writeText('${displayEmail}'); showToast('คัดลอกแล้ว', 'คัดลอกอีเมลเรียบร้อย', 'info');" title="คัดลอกอีเมล" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs shrink-0 transition">
                  <i class="fa-regular fa-copy"></i>
                </button>
              </div>

              <!-- ช่องทางสัมภาษณ์ -->
              <div class="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                <div class="flex items-center gap-2 text-slate-700 truncate min-w-0">
                  <i class="fa-solid fa-video text-emerald-600 w-3.5 text-center shrink-0"></i>
                  <span class="font-medium text-xs text-slate-800 truncate">${m.interview_channel || 'Google Meet'}</span>
                </div>
                <a href="${m.interview_link || 'https://meet.google.com'}" target="_blank" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shrink-0 flex items-center gap-1 transition">
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                  <span>เข้าห้องสัมภาษณ์</span>
                </a>
              </div>

              <!-- เบอร์โทรศัพท์ (ถ้ามี) -->
              ${displayPhone && displayPhone !== 'N/A' ? `
                <div class="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                  <div class="flex items-center gap-2 text-slate-700 truncate min-w-0">
                    <i class="fa-solid fa-phone text-cyan-600 w-3.5 text-center shrink-0"></i>
                    <a href="tel:${displayPhone}" class="font-mono text-xs text-slate-800 hover:underline truncate">${displayPhone}</a>
                  </div>
                  <button onclick="navigator.clipboard.writeText('${displayPhone}'); showToast('คัดลอกแล้ว', 'คัดลอกเบอร์โทรเรียบร้อย', 'info');" title="คัดลอกเบอร์โทร" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs shrink-0 transition">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                </div>
              ` : ''}
            </div>

            <!-- Card Bottom Actions for Connected State -->
            <div class="flex items-center gap-2">
              <button onclick="closeMatchesDrawer(); openBreakdownModal('${m.candidate_id}_${m.job_id}');" class="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-chart-pie text-xs text-indigo-500"></i>
                <span>ดู Tag Breakdown</span>
              </button>
              <a href="mailto:${displayEmail}" class="py-1.5 px-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                <i class="fa-solid fa-paper-plane text-xs"></i>
                <span>ส่งอีเมล</span>
              </a>
            </div>
          ` : `
            <!-- LOCKED STATE: มีปุ่ม "เชื่อมต่อ / นัดสัมภาษณ์" (Connect) -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <i class="fa-solid fa-lock text-amber-500 shrink-0"></i>
                <span class="text-[11px] text-slate-500 truncate">กด <strong class="text-slate-700">Connect</strong> เพื่อปลดล็อกอีเมลและห้องสัมภาษณ์</span>
              </div>
              <span class="text-amber-700 font-mono text-[10px] bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0">LOCKED</span>
            </div>

            <button onclick="handleConnectMatch('${m.match_id}')" id="btnConnect_${m.match_id}" class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-sm active:scale-[0.99] transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-handshake text-sm"></i>
              <span>เชื่อมต่อ / นัดสัมภาษณ์ (Connect)</span>
            </button>
          `}
        `;
        el.matchesContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error('Failed to load matches list:', err);
    el.matchesContainer.innerHTML = `
      <div class="p-5 text-center text-rose-600 text-xs bg-rose-50 rounded-2xl border border-rose-200 shadow-sm">
        <i class="fa-solid fa-triangle-exclamation text-lg mb-2"></i>
        <p>ไม่สามารถโหลดรายการ Matches ได้ กรุณาลองใหม่อีกครั้ง</p>
      </div>
    `;
  }
}

// ==========================================
// Favourites (Saved Cards) Drawer & Actions
// ==========================================
async function renderFavouritesList() {
  if (!el.favouritesContainer) return;

  el.favouritesContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center p-8 text-center">
      <div class="w-8 h-8 border-3 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
      <p class="text-xs text-slate-400 mt-3 font-medium">กำลังโหลดรายการโปรดของคุณ...</p>
    </div>
  `;

  try {
    let url = '/api/v1/interactions?action=save';
    if (state.currentRole === 'candidate' || state.currentRole === 'recruiter') {
      url += `&role=${encodeURIComponent(state.currentRole)}&id=${encodeURIComponent(state.activePersonaId)}`;
    }
    const res = await authFetch(url);
    const json = await res.json();

    if (json.success) {
      const favourites = json.data || [];
      setFavouriteBadgeCount(favourites.length);

      if (favourites.length === 0) {
        el.favouritesContainer.innerHTML = `
          <div class="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 text-xs">
            <div class="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center text-xl mx-auto mb-3">
              <i class="fa-solid fa-bookmark"></i>
            </div>
            <h4 class="font-bold text-slate-800 text-sm mb-1">ยังไม่มีรายการที่บันทึกไว้</h4>
            <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              เมื่อคุณกดปุ่มบันทึก (Bookmark / Save) บนการ์ดงานหรือการ์ดผู้สมัคร รายการจะถูกเก็บไว้ที่นี่ เพื่อให้คุณกลับมาดูและส่งความสนใจ (Express Interest) ได้ในภายหลัง
            </p>
          </div>
        `;
        return;
      }

      el.favouritesContainer.innerHTML = '';
      const isCandidateView = state.currentRole === 'candidate';

      favourites.forEach(fav => {
        const item = document.createElement('div');
        item.className = 'p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm space-y-2.5 transition-all';

        const personAvatar = isCandidateView ? (fav.company_logo || fav.candidate_avatar) : fav.candidate_avatar;
        const personName = isCandidateView ? fav.company_name : fav.candidate_name;
        const personTitle = isCandidateView ? fav.job_title : fav.candidate_title;
        const salaryText = isCandidateView 
          ? `งบงาน: <strong>${fav.salary_range}</strong>` 
          : `ผู้สมัครคาดหวัง: <strong>${fav.candidate_expected_salary || 'ตามตกลง'}</strong>`;

        const skills = isCandidateView ? (fav.job_tags || []) : (fav.candidate_tags || []);

        item.innerHTML = `
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
              <i class="fa-solid fa-bookmark text-sky-500"></i> บันทึกไว้แล้ว
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 font-bold">
              <i class="fa-solid fa-bolt text-amber-500 text-[10px]"></i> ${fav.match_score || 85}% Match
            </span>
          </div>

          <div class="flex items-center gap-3">
            <img src="${personAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" alt="" class="w-12 h-12 rounded-full object-cover ring-2 ring-sky-200 bg-slate-100 shrink-0">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-[#0F172A] leading-snug truncate">${personName}</h4>
              <p class="text-xs text-slate-600 font-medium truncate mt-0.5">${personTitle}</p>
              <div class="flex items-center gap-2 text-xs text-emerald-700 mt-1">
                <i class="fa-solid fa-money-bill-wave text-emerald-600 shrink-0"></i>
                <span class="truncate">${salaryText}</span>
              </div>
            </div>
          </div>

          ${skills && skills.length > 0 ? `
            <div class="flex flex-wrap gap-1">
              ${skills.slice(0, 4).map(s => `
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium inline-flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>${s}
                </span>
              `).join('')}
            </div>
          ` : ''}

          <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button onclick="expressInterestFromFavourite('${fav.candidate_id}', '${fav.job_id}')" class="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 active:scale-95">
              <i class="fa-solid fa-star text-amber-300"></i>
              <span>Express Interest</span>
            </button>
            <button onclick="removeFavouriteItem('${fav.candidate_id}', '${fav.job_id}')" class="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs transition" title="ลบออกจากรายการบันทึก">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;

        el.favouritesContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error('Failed to render favourites:', err);
    el.favouritesContainer.innerHTML = `
      <div class="p-5 text-center text-rose-600 text-xs bg-rose-50 rounded-2xl border border-rose-200 shadow-sm">
        <i class="fa-solid fa-triangle-exclamation text-lg mb-2"></i>
        <p>ไม่สามารถโหลดรายการที่บันทึกไว้ได้</p>
      </div>
    `;
  }
}
window.renderFavouritesList = renderFavouritesList;

async function expressInterestFromFavourite(candidateId, jobId) {
  try {
    const res = await authFetch('/api/v1/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId,
        initiator_role: state.currentRole,
        action: 'express_interest'
      })
    });
    const json = await res.json();
    if (json.success) {
      if (json.match_event) {
        triggerConfettiCelebration();
        openMatchModal(json.match_details);
        await updateMatchBadge();
      } else {
        showToast('ส่งความสนใจแล้ว', json.message || 'ส่งความสนใจเรียบร้อยแล้ว รออีกฝ่ายตอบรับ', 'success');
      }
      await renderFavouritesList();
      await updateFavouritesBadge();
      await updateMatchBadge();
    } else {
      showToast('Error', json.message || 'ไม่สามารถส่งความสนใจได้', 'error');
    }
  } catch (err) {
    console.error('Express interest from fav error:', err);
    showToast('Error', 'เกิดข้อผิดพลาดในการส่งความสนใจ', 'error');
  }
}
window.expressInterestFromFavourite = expressInterestFromFavourite;

async function removeFavouriteItem(candidateId, jobId) {
  try {
    const res = await authFetch('/api/v1/interactions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId,
        initiator_role: state.currentRole
      })
    });
    const json = await res.json();
    if (json.success) {
      showToast('ลบแล้ว', 'นำออกจากรายการบันทึกเรียบร้อย', 'info');
      await renderFavouritesList();
      await updateFavouritesBadge();
    }
  } catch (err) {
    console.error('Remove fav error:', err);
  }
}
window.removeFavouriteItem = removeFavouriteItem;
async function triggerSimulateMatch() {
  // 1. Get current visible card on screen
  const currentVisibleCard = (state.feedCards && state.feedCards.length > state.currentIndex)
    ? state.feedCards[state.currentIndex]
    : null;

  if (!currentVisibleCard) {
    showToast('ไม่พบการ์ดบนหน้าจอ', 'ไม่มีการ์ดกำลังแสดงอยู่ตรงกลางจอในขณะนี้ กรุณากดปุ่ม "รีเซ็ตการ์ด" เพื่อนำการ์ดกลับมาในฟีดก่อนจำลอง Match', 'warning');
    return;
  }

  // 2. Build dynamic payload from currently logged in persona & card on screen
  const payload = buildDynamicMatchPayload(currentVisibleCard);
  if (!payload) return;

  const cardName = currentVisibleCard.company_name || currentVisibleCard.full_name || currentVisibleCard.title || 'การ์ดบนหน้าจอ';
  showToast('กำลังจำลอง Match...', `กำลังจำลองการแมตช์ระหว่างคุณกับ "${cardName}"...`, 'info');

  try {
    const res = await authFetch('/api/v1/simulate-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success && json.is_matched) {
      triggerConfettiCelebration();
      openMatchModal(json.match_details);

      // Advance deck past the matched card
      state.currentIndex++;
      renderCards();

      await updateMatchBadge();

      // If Matches drawer is currently open, re-render it immediately!
      const isDrawerOpen = el.drawerMatches && !el.drawerMatches.classList.contains('translate-x-full');
      if (isDrawerOpen) {
        await renderMatchesList();
      }

      const counterpartTitle = state.currentRole === 'candidate'
        ? `${json.match_details.company_name} (${json.match_details.job_title})`
        : json.match_details.candidate_name;

      showToast('Mutual Match สำเร็จ! 🎉', `คุณได้แมตช์กับ ${counterpartTitle} เรียบร้อยแล้ว`, 'success');
    } else {
      showToast('ผลการจำลอง', json.message || 'จำลองเสร็จสิ้น', 'info');
      await updateMatchBadge();
    }
  } catch (err) {
    console.error('Simulate match failed:', err);
    showToast('Error', 'ไม่สามารถจำลองการแมตช์ได้', 'error');
  }
}

async function resetDatabase() {
  if (!confirm('ต้องการรีเซ็ต Mock Database กลับสู่ค่าเริ่มต้นหรือไม่?')) return;

  try {
    const res = await authFetch('/api/v1/reset', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('สำเร็จ', 'รีเซ็ตข้อมูล Mock Database เรียบร้อยแล้ว', 'success');
      await refreshFeed();
      await updateMatchBadge();
    }
  } catch (err) {
    console.error('Reset failed:', err);
  }
}

// ==========================================
// Toast Helpers
// ==========================================
let toastTimeout;
function showToast(title, message, type = 'info') {
  clearTimeout(toastTimeout);

  el.toastTitle.innerText = title;
  el.toastMessage.innerText = message;

  if (type === 'success') {
    el.toastIcon.className = 'w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400';
    el.toastIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
  } else if (type === 'error') {
    el.toastIcon.className = 'w-7 h-7 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-400';
    el.toastIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  } else {
    el.toastIcon.className = 'w-7 h-7 rounded-full flex items-center justify-center bg-pink-500/20 text-pink-400';
    el.toastIcon.innerHTML = '<i class="fa-solid fa-info"></i>';
  }

  el.toast.classList.remove('translate-y-24', 'opacity-0');

  toastTimeout = setTimeout(() => {
    el.toast.classList.add('translate-y-24', 'opacity-0');
  }, 3500);
}
