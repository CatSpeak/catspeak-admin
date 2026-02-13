interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div
      className="flex h-64 items-center justify-center rounded-xl bg-white"
      style={{
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p style={{ color: "var(--color-text-secondary)" }}>{title}</p>
    </div>
  );
}
