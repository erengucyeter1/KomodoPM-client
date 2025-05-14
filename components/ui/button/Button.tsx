import React from "react";
import { PermissionProps } from '@/lib/permissions/types';
import { hasRequiredPermissions } from '@/lib/permissions/utils';
import { useAuth } from "@/hooks/useAuth";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, PermissionProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  requirementType?: "every" | "some"; // Yeni eklenen prop
}

const getVariantClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case "primary":
      return "bg-[#da8e0a] hover:bg-[#c07c09] text-white";
    case "secondary":
      return "bg-[#447494] hover:bg-[#336383] text-white";
    case "danger":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "success":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "ghost":
      return "bg-transparent hover:bg-transparent"; // Tamamen şeffaf olacak
    default:
      return "bg-[#da8e0a] hover:bg-[#c07c09] text-white";
  }
};

const getSizeClasses = (size: ButtonSize): string => {
  switch (size) {
    case "sm":
      return "py-1 px-3 text-sm";
    case "md":
      return "py-2 px-4";
    case "lg":
      return "py-3 px-5 text-lg";
    default:
      return "py-2 px-4";
  }
};

export default function PermissionButton({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  startIcon,
  endIcon,
  disabled,
  permissionsRequired,
  requirementType = "every",
  ...props
}: ButtonProps) {

  
  
  if (!hasRequiredPermissions(permissionsRequired, requirementType)) {
    return null;
  }

  return (
    <button
      className={`
        ${getVariantClasses(variant)} 
        ${getSizeClasses(size)} 
        rounded transition-colors flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
      )}
      {!isLoading && startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {!isLoading && endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
}