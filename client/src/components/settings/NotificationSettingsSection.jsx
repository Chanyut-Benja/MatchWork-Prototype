import { Bell, CheckCircle2, Heart, Mail, MessageSquare, Smartphone, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function NotificationSettingsSection({
  preferences,
  onChange,
  onSave,
  isSaving,
}) {
  const { t } = useLanguage();
  const channels = preferences?.channels || { email: true, push: true, in_app: true };
  const events = preferences?.events || {
    new_matching_job: true,
    new_match: true,
    hr_reply: true,
  };

  const toggleChannel = (key) => {
    onChange({
      ...preferences,
      channels: { ...channels, [key]: !channels[key] },
    });
  };

  const toggleEvent = (key) => {
    onChange({
      ...preferences,
      events: { ...events, [key]: !events[key] },
    });
  };

  const channelItems = [
    {
      key: 'email',
      icon: Mail,
      title: t('อีเมล (Email)', 'Email Notifications'),
      desc: t('ส่งสรุปงานที่ตรงใจและการแจ้งเตือนสำคัญไปยังอีเมลของคุณ', 'Receive job matches and important updates via email'),
    },
    {
      key: 'push',
      icon: Smartphone,
      title: t('Push Notification', 'Push Notifications'),
      desc: t('แจ้งเตือนแบบเรียลไทม์บนเบราว์เซอร์และมือถือ', 'Real-time alerts on your browser and mobile device'),
    },
    {
      key: 'in_app',
      icon: Bell,
      title: t('แจ้งเตือนในแอป (In-App)', 'In-App Notifications'),
      desc: t('แสดงจุดแจ้งเตือนและ Toast ภายในหน้าแดชบอร์ด MatchWork', 'Show badges and toast alerts inside MatchWork'),
    },
  ];

  const eventItems = [
    {
      key: 'new_matching_job',
      icon: Sparkles,
      title: t('มีงานใหม่ที่ตรงใจ', 'New Matching Jobs'),
      desc: t('แจ้งเตือนเมื่อมีตำแหน่งงานใหม่ที่ได้คะแนน Match สูง', 'Notify when new high-match jobs are posted'),
    },
    {
      key: 'new_match',
      icon: Heart,
      title: t('มีการ Match ใหม่', 'New Mutual Match'),
      desc: t('แจ้งเตือนทันทีเมื่อบริษัทและคุณกดสนใจตรงกัน', 'Notify immediately when you and a company match'),
    },
    {
      key: 'hr_reply',
      icon: MessageSquare,
      title: t('HR ตอบกลับข้อความ', 'HR Message Replies'),
      desc: t('แจ้งเตือนเมื่อ HR หรือผู้สมัครส่งข้อความตอบกลับในแชท', 'Notify when HR or candidates reply in chat'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-neutral-400">
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications · Preferences</span>
        </div>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
          {t('ตั้งค่าการแจ้งเตือน', 'Notification Preferences')}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t(
            'เลือกช่องทางและเหตุการณ์ที่คุณต้องการรับการแจ้งเตือน',
            'Choose how and when you want to receive notifications'
          )}
        </p>
      </div>

      {/* Channels */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t('ช่องทางรับแจ้งเตือน', 'Delivery Channels')}
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {channelItems.map((item) => {
            const Icon = item.icon;
            const enabled = Boolean(channels[item.key]);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleChannel(item.key)}
                className={`w-full flex items-center justify-between gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  enabled
                    ? 'border-[#111111] dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#111111] dark:text-neutral-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111111] dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    enabled
                      ? 'bg-[#111111] dark:bg-emerald-500 justify-end'
                      : 'bg-neutral-200 dark:bg-neutral-800 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t('เหตุการณ์ที่ต้องการรับแจ้งเตือน', 'Notify Me When')}
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {eventItems.map((item) => {
            const Icon = item.icon;
            const enabled = Boolean(events[item.key]);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleEvent(item.key)}
                className={`w-full flex items-center justify-between gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  enabled
                    ? 'border-[#111111] dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#111111] dark:text-neutral-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111111] dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    enabled
                      ? 'bg-[#111111] dark:bg-emerald-500 justify-end'
                      : 'bg-neutral-200 dark:bg-neutral-800 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isSaving ? t('กำลังบันทึก...', 'Saving...') : t('บันทึกการแจ้งเตือน', 'Save Preferences')}</span>
        </button>
      </div>
    </div>
  );
}
