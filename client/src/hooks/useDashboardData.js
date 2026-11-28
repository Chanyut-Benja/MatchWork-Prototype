import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi, matchingApi, profileApi } from '../services/api';

export const DEFAULT_FILTERS = {
  min_salary: '',
  max_salary: '',
  work_style: '',
  location: '',
  max_distance_km: '',
  min_exp: '',
  max_exp: '',
  employment_type: '',
};

export function useDashboardData({ effectiveRole, activePersonaId, showToast }) {
  const [personas, setPersonas] = useState({ candidates: [], jobs: [] });
  const [cards, setCards] = useState([]);
  const [matchedTagIds, setMatchedTagIds] = useState(() => new Set());
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [isActing, setIsActing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [matches, setMatches] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [matchCelebration, setMatchCelebration] = useState(null);

  const savedItems = useMemo(
    () => historyItems.filter((item) => item.action === 'save'),
    [historyItems]
  );

  const closingSoonCount = useMemo(
    () => savedItems.filter((item) => item.is_closing_soon).length,
    [savedItems]
  );

  const canUndo = historyItems.length > 0;

  useEffect(() => {
    let active = true;
    authApi
      .getPersonas()
      .then((res) => {
        if (active && res?.success && res?.data) {
          setPersonas(res.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoadingFeed(true);
    setFeedError('');
    try {
      const [feedRes, matchesRes, interactionsRes] = await Promise.all([
        matchingApi.getFeed(effectiveRole, activePersonaId, filters),
        matchingApi.getMatches(effectiveRole, activePersonaId),
        matchingApi.getInteractions({
          role: effectiveRole,
          id: activePersonaId,
        }),
      ]);
      setCards(feedRes?.data || []);
      setMatches(matchesRes?.data || []);
      setHistoryItems(interactionsRes?.data || []);
    } catch (err) {
      setFeedError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูล Feed ได้');
    } finally {
      setIsLoadingFeed(false);
    }
  }, [effectiveRole, activePersonaId, filters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const topCardId = cards[0]?.card_id;
  useEffect(() => {
    let active = true;
    async function loadMatchedTags() {
      if (!topCardId) {
        if (active) setMatchedTagIds(new Set());
        return;
      }
      try {
        if (effectiveRole === 'candidate') {
          const res = await profileApi.getCandidateTags(activePersonaId);
          if (active) {
            setMatchedTagIds(new Set((res?.tags || []).map((t) => t.tag_id)));
          }
        } else {
          const compositeId = `${topCardId}_${activePersonaId}`;
          const res = await matchingApi.getBreakdown(compositeId, {
            candidate_id: topCardId,
            job_id: activePersonaId,
          });
          if (active) {
            const breakdown = res?.data?.technical_breakdown || res?.breakdown || [];
            const ids = breakdown.filter((b) => b.status === 'matched').map((b) => b.tag_id);
            setMatchedTagIds(new Set(ids));
          }
        }
      } catch {
        if (active) setMatchedTagIds(new Set());
      }
    }
    loadMatchedTags();
    return () => {
      active = false;
    };
  }, [effectiveRole, activePersonaId, topCardId]);

  const refreshLists = useCallback(async () => {
    const [matchesRes, interactionsRes] = await Promise.all([
      matchingApi.getMatches(effectiveRole, activePersonaId),
      matchingApi.getInteractions({
        role: effectiveRole,
        id: activePersonaId,
      }),
    ]);
    setMatches(matchesRes?.data || []);
    setHistoryItems(interactionsRes?.data || []);
  }, [effectiveRole, activePersonaId]);

  const handleCardSwipe = useCallback(
    async (action, card) => {
      if (!card || isActing) return;
      setIsActing(true);

      const candidateId = effectiveRole === 'candidate' ? activePersonaId : card.card_id;
      const jobId = effectiveRole === 'recruiter' ? activePersonaId : card.card_id;

      try {
        const res = await matchingApi.createInteraction({
          candidate_id: candidateId,
          job_id: jobId,
          initiator_role: effectiveRole,
          action,
        });

        setCards((prev) => prev.slice(1));

        if (res?.is_matched) {
          setMatchCelebration({
            title: effectiveRole === 'candidate' ? card.title : card.full_name || card.name,
            subtitle: effectiveRole === 'candidate' ? card.company_name : card.title,
          });
          showToast('จับคู่สำเร็จ!', 'ทั้งสองฝ่ายกดสนใจตรงกันแล้ว', 'success');
        } else if (action === 'save') {
          showToast('บันทึกการ์ดแล้ว', 'เพิ่มลงในรายการที่บันทึกไว้เรียบร้อย', 'info');
        } else if (action === 'express_interest') {
          showToast('ส่งความสนใจแล้ว', 'ระบบบันทึกความสนใจของคุณเรียบร้อย', 'success');
        }

        await refreshLists();
      } catch (err) {
        showToast(
          'เกิดข้อผิดพลาด',
          err?.response?.data?.message || 'ไม่สามารถบันทึกการปัดการ์ดได้',
          'error'
        );
      } finally {
        setIsActing(false);
      }
    },
    [isActing, effectiveRole, activePersonaId, showToast, refreshLists]
  );

  const handleUndoLast = useCallback(async () => {
    if (isActing || !canUndo) return;
    setIsActing(true);
    try {
      const res = await matchingApi.undoLastInteraction(effectiveRole, activePersonaId);
      if (res?.success) {
        await loadDashboardData();
        showToast('ย้อนกลับสำเร็จ', 'นำการ์ดล่าสุดกลับเข้าคิวเรียบร้อยแล้ว', 'info');
      }
    } catch (err) {
      showToast(
        'ย้อนกลับไม่สำเร็จ',
        err?.response?.data?.message || 'ไม่มีรายการล่าสุดให้ย้อนกลับ',
        'error'
      );
    } finally {
      setIsActing(false);
    }
  }, [isActing, canUndo, effectiveRole, activePersonaId, loadDashboardData, showToast]);

  const handleRestoreInteraction = useCallback(
    async (item) => {
      if (!item || isActing) return;
      setIsActing(true);
      try {
        await matchingApi.deleteInteraction({
          candidate_id: item.candidate_id,
          job_id: item.job_id,
          initiator_role: item.initiator_role || effectiveRole,
        });
        await loadDashboardData();
        showToast('นำกลับเข้าคิวแล้ว', 'คุณสามารถพิจารณาการ์ดนี้ในคิวได้อีกครั้ง', 'info');
      } catch {
        showToast('ผิดพลาด', 'ไม่สามารถนำรายการกลับเข้าคิวได้', 'error');
      } finally {
        setIsActing(false);
      }
    },
    [isActing, effectiveRole, loadDashboardData, showToast]
  );

  const handleUpdateInteractionAction = useCallback(
    async (item, nextAction) => {
      if (!item || isActing) return;
      setIsActing(true);
      try {
        const res = await matchingApi.createInteraction({
          candidate_id: item.candidate_id,
          job_id: item.job_id,
          initiator_role: item.initiator_role || effectiveRole,
          action: nextAction,
        });
        await loadDashboardData();
        if (res?.is_matched) {
          setMatchCelebration({
            title: effectiveRole === 'candidate' ? item.job_title : item.candidate_name,
            subtitle: effectiveRole === 'candidate' ? item.company_name : item.candidate_title,
          });
          showToast('จับคู่สำเร็จ!', 'ทั้งสองฝ่ายกดสนใจตรงกันแล้ว', 'success');
        } else if (nextAction === 'express_interest') {
          showToast('ส่งความสนใจแล้ว', 'เปลี่ยนสถานะเป็นสนใจเรียบร้อย', 'success');
        }
      } catch {
        showToast('ผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้', 'error');
      } finally {
        setIsActing(false);
      }
    },
    [isActing, effectiveRole, loadDashboardData, showToast]
  );

  const handleSimulateMatch = useCallback(async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      const targetCard = cards[0];
      const candidateId =
        effectiveRole === 'candidate'
          ? activePersonaId
          : targetCard?.card_id || personas.candidates?.[0]?.id || 'cand_1';
      const jobId =
        effectiveRole === 'recruiter'
          ? activePersonaId
          : targetCard?.card_id || personas.jobs?.[0]?.id || 'job_101';

      await matchingApi.simulateMatch({
        candidate_id: candidateId,
        job_id: jobId,
        initiator_role: effectiveRole,
      });

      const [matchesRes, feedRes, interactionsRes] = await Promise.all([
        matchingApi.getMatches(effectiveRole, activePersonaId),
        matchingApi.getFeed(effectiveRole, activePersonaId, filters),
        matchingApi.getInteractions({ role: effectiveRole, id: activePersonaId }),
      ]);

      const updatedMatches = matchesRes?.data || [];
      setMatches(updatedMatches);
      setCards(feedRes?.data || []);
      setHistoryItems(interactionsRes?.data || []);

      const createdMatch = updatedMatches.find(
        (m) => m.candidate_id === candidateId && m.job_id === jobId
      );
      if (createdMatch) {
        const isCandView = effectiveRole === 'candidate';
        setMatchCelebration({
          title: isCandView ? createdMatch.job_title : createdMatch.candidate_name,
          subtitle: isCandView ? createdMatch.company_name : createdMatch.candidate_title,
        });
      }
      showToast('จำลอง Match สำเร็จ', 'อัปเดตคู่ Match ใหม่เรียบร้อยแล้ว', 'success');
    } catch (err) {
      showToast(
        'จำลอง Match ไม่สำเร็จ',
        err?.response?.data?.message || 'เกิดข้อผิดพลาดในการจำลอง Match',
        'error'
      );
    } finally {
      setIsSimulating(false);
    }
  }, [isSimulating, cards, effectiveRole, activePersonaId, personas, filters, showToast]);

  const handleConnectMatch = useCallback(
    async (match) => {
      const matchId = match.match_id || `${match.candidate_id}_${match.job_id}`;
      try {
        await matchingApi.connectMatch(matchId, {
          candidate_id: match.candidate_id,
          job_id: match.job_id,
        });
        const matchesRes = await matchingApi.getMatches(effectiveRole, activePersonaId);
        setMatches(matchesRes?.data || []);
        showToast('เชื่อมต่อสำเร็จ', 'ปลดล็อกช่องทางแชทและลิงก์สัมภาษณ์แล้ว', 'success');
      } catch (err) {
        showToast(
          'เชื่อมต่อไม่สำเร็จ',
          err?.response?.data?.message || 'ไม่สามารถเชื่อมต่อได้',
          'error'
        );
      }
    },
    [effectiveRole, activePersonaId, showToast]
  );

  const handleResetFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      await matchingApi.resetFeed(effectiveRole, activePersonaId);
      await loadDashboardData();
      showToast('รีเซ็ตคิวสำเร็จ', 'โหลดรายการทั้งหมดกลับมาใหม่แล้ว', 'info');
    } catch {
      showToast('ผิดพลาด', 'ไม่สามารถรีเซ็ตคิวได้', 'error');
      setIsLoadingFeed(false);
    }
  }, [effectiveRole, activePersonaId, loadDashboardData, showToast]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    personas,
    cards,
    matchedTagIds,
    isLoadingFeed,
    feedError,
    isActing,
    isSimulating,
    matches,
    savedItems,
    historyItems,
    closingSoonCount,
    canUndo,
    filters,
    setFilters,
    resetFilters,
    matchCelebration,
    setMatchCelebration,
    loadDashboardData,
    handleCardSwipe,
    handleUndoLast,
    handleRestoreInteraction,
    handleUpdateInteractionAction,
    handleSimulateMatch,
    handleConnectMatch,
    handleResetFeed,
  };
}
