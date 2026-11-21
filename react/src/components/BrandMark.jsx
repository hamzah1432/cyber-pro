// DOMino mark: a domino tile caught mid-scan. The solid upper half is the
// surface; the hollow lower half is the X-ray view, where the domino's three
// pips are wired as a DOM tree. The bar through the middle is the scan plane.
// Drawn on a 32-unit grid so it renders crisply at 16/32px.
// Geometry must stay identical to public/favicon.svg.
export default function BrandMark({ className = "" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect x="8" y="2" width="16" height="28" rx="3.5" fill="#FFFFFF" />
      <rect x="10" y="18" width="12" height="10" rx="1.5" fill="#050505" />
      <rect x="4" y="16" width="24" height="2" fill="#FFFFFF" />
      <circle cx="16" cy="9" r="3" fill="#050505" />
      <path d="M16 21 13 25M16 21 19 25" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
      <circle cx="16" cy="21" r="2" fill="#FFFFFF" />
      <circle cx="13" cy="25" r="2" fill="#FFFFFF" />
      <circle cx="19" cy="25" r="2" fill="#FFFFFF" />
    </svg>
  );
}
