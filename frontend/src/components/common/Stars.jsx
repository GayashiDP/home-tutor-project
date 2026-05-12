export default function Stars({ rating = 0, size = 14 }) {
  const n = Math.round(Number(rating));
  return (
    <span style={{ letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#F39C12' : '#DDD', fontSize: size }}>★</span>
      ))}
    </span>
  );
}
