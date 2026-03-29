import { PageContainer } from "@/components/layout/page-container";

export default function SettingsPage() {
  return (
    <PageContainer narrow>
      <p className="text-sm text-on-surface-variant">Account & app</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-on-surface">
        Settings
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        Theme, reminders, units, and notifications will live here.
      </p>
      <ul className="mt-8 space-y-2 rounded-2xl bg-surface-container-low p-2">
        {["Appearance", "Reminders", "Notifications", "Data & privacy"].map(
          (label) => (
            <li
              key={label}
              className="rounded-xl px-4 py-3 text-sm text-on-surface-variant"
            >
              {label}
              <span className="ml-2 text-xs opacity-60">· Soon</span>
            </li>
          ),
        )}
      </ul>
    </PageContainer>
  );
}
