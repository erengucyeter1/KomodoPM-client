import { usePermissions } from "@/hooks/usePermissions";
import React, { ComponentType } from "react";

export function withPermissions<P extends {}>(
  WrappedComponent: ComponentType<P>,
  requiredPermissions: string[]
) {
  const ComponentWithPermissions = (props: P) => {
    const permissionDeniedComponent = usePermissions(requiredPermissions);
    if (permissionDeniedComponent) {
      return permissionDeniedComponent;
    }

    return <WrappedComponent {...props} />;
  };

  // Display name eklemek debugging için faydalı
  ComponentWithPermissions.displayName = `withPermissions(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithPermissions;
}
