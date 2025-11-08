interface RCRLogoProps {
  variant?: 'full' | 'simple';
  className?: string;
  width?: number;
  height?: number;
}

/**
 * RCR Logo component that displays either the full or simple version of the Rwanda Cancer Relief logo
 * @param variant - 'full' for the complete logo with text, 'simple' for just the icon
 * @param className - Additional CSS classes to apply
 * @param width - Width of the logo in pixels
 * @param height - Height of the logo in pixels
 */
export function RCRLogo({ 
  variant = 'simple', 
  className = '', 
  width = 32, 
  height = 32 
}: RCRLogoProps) {
  const logoSrc = variant === 'full' 
    ? '/images/RCR-Logo-Full.svg' 
    : '/images/RCR-Logo.svg';
  
  const altText = variant === 'full' 
    ? 'Rwanda Cancer Relief - Full Logo' 
    : 'Rwanda Cancer Relief - Logo';

  return (
    <img
      src={logoSrc}
      alt={altText}
      width={width}
      height={height}
      className={className}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        objectFit: 'contain'
      }}
    />
  );
}
