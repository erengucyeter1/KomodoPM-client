import React from "react";
import { PermissionProps } from "@/lib/permissions/types";
import { hasRequiredPermissions } from "@/lib/permissions/utils";
import { forbiddenWarning } from "@/lib/permissions/messageComponents";

interface CardProps extends PermissionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
}

export default function PermissionsCard({ 
  children, 
  title, 
  subtitle, 
  className = "", 
  actions,
  permissionsRequired,
}: CardProps) {
  if (!hasRequiredPermissions(permissionsRequired)) {
    return forbiddenWarning(); // İzin yoksa hiçbir şey gösterme
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-6">
          <div>
            {title && <h2 className="text-2xl font-bold text-[#063554]">{title}</h2>}
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}