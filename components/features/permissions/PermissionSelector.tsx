import React from "react";

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface PermissionSelectorProps {
  selectedPermissions: number[];
  availablePermissions: Permission[];
  onChange: (permissionId: number) => void;
  className?: string;
}

export default function PermissionSelector({
  selectedPermissions,
  availablePermissions,
  onChange,
  className = ""
}: PermissionSelectorProps) {
  return (
    <div className={`border border-gray-300 rounded-md p-2 ${className}`}>
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedPermissions.length > 0 ? (
          availablePermissions
            .filter(p => selectedPermissions.includes(p.id))
            .map(p => (
              <span
                key={`perm-${p.id}`}
                className="bg-[#447494] text-white px-2 py-1 rounded-full text-xs flex items-center"
              >
                {p.name}
                <button
                  type="button"
                  onClick={() => onChange(p.id)}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))
        ) : (
          <span className="text-gray-500 text-xs">İzin seçin...</span>
        )}
      </div>

      <div className="max-h-32 overflow-y-auto border-t border-gray-200 pt-2">
        {availablePermissions
          .filter(p => !selectedPermissions.includes(p.id))
          .map(p => (
            <div
              key={`perm-option-${p.id}`}
              onClick={() => onChange(p.id)}
              className="p-1 hover:bg-gray-100 cursor-pointer text-sm rounded-md"
              title={p.description}
            >
              {p.name}
            </div>
          ))
        }
      </div>
    </div>
  );
}