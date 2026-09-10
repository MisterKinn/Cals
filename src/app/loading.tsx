export default function Loading() {
  return (
    <main className="loading-shell" aria-label="계산기 불러오는 중">
      <div className="skeleton skeleton-kicker" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skeleton skeleton-card" key={index} />
        ))}
      </div>
    </main>
  );
}
