interface JDBLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}

export function JDBLogo({ size = "md", variant = "full", className = "" }: JDBLogoProps) {
  const iconSizes = { sm: 28, md: 36, lg: 52 };
  const textSizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
  const subSizes = { sm: "text-[7px]", md: "text-[9px]", lg: "text-xs" };
  const s = iconSizes[size];

  const icon = (
    <svg width={s} height={s} viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <rect width="180" height="180" rx="28" fill="#111111"/>
      <rect x="0" y="0" width="180" height="6" rx="3" fill="#FF3C00"/>
      <rect x="0" y="148" width="180" height="32" fill="#FF3C00"/>
      <rect x="0" y="172" width="180" height="8" rx="4" fill="#FF3C00"/>
      <text x="22" y="144" fontFamily="Georgia, serif" fontSize="108" fontWeight="900" fill="white">J</text>
      <text x="72" y="134" fontFamily="Georgia, serif" fontSize="72" fontWeight="900" fill="#FF3C00">&#38;</text>
      <text x="114" y="144" fontFamily="Georgia, serif" fontSize="108" fontWeight="900" fill="white">B</text>
      <text x="90" y="166" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="3">JUALDANBELI</text>
    </svg>
  );

  if (variant === "icon") return <span className={className}>{icon}</span>;

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {icon}
      <span className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight text-white ${textSizes[size]}`}>
          jualdanbeli<sup className="text-orange-400 font-bold" style={{fontSize:"0.45em",verticalAlign:"super"}}>™</sup>
        </span>
        <span className={`font-bold tracking-[0.2em] text-orange-300 uppercase ${subSizes[size]}`}>
          Jual &amp; Beli Aman
        </span>
      </span>
    </span>
  );
}
