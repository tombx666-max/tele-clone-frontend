export function DateSeparator({ label }: { label: string }) {
  return (
    <li
      className="flex justify-center py-4 first:pt-2"
      role="separator"
      aria-label={`Messages from ${label}`}
    >
      <span className="text-xs font-medium text-telegram-text-muted bg-telegram-bg-secondary/90 backdrop-blur-sm px-4 py-2 rounded-full border border-telegram-border/50 select-none">
        {label}
      </span>
    </li>
  );
}
