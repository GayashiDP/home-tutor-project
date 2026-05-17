import logoUrl from '../assets/images/logo.png';

export default function BrandLogo({ className = '' }) {
  return <img src={logoUrl} alt="Home Tutor" className={className} />;
}
