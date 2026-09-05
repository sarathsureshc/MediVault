import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconSize?: number;
  textSize?: { width: number; height: number };
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  showText = true,
  textClassName = "",
  iconSize = 40,
  textSize = { width: 120, height: 40 },
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Image
          src="https://res.cloudinary.com/dugp5rkiq/image/upload/v1764397322/MediVault_logo_e9kiad.png"
          alt="MediVault Logo"
          width={iconSize}
          height={iconSize}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span
          className={`text-2xl text-zinc-900 dark:text-white ${textClassName}`}
        >
          <span className="font-bold">Medi</span>
          <span className="font-light tracking-tight">Vault</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
