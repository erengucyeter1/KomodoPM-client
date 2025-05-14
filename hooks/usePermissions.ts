'use client';

import {forbiddenWarning} from "@/lib/permissions/messageComponents";
import {hasRequiredPermissions} from "@/lib/permissions/utils";


export function usePermissions(permissionsRequired: string[]) {
  if (!hasRequiredPermissions(permissionsRequired)) {
    return forbiddenWarning();
  }
}
