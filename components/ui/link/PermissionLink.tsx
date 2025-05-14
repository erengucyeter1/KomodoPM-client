import React from 'react';
import Link from 'next/link';
import { PermissionProps } from '@/lib/permissions/types';
import { hasRequiredPermissions } from '@/lib/permissions/utils';

// Extend LinkProps with our permission properties
interface PermissionLinkProps extends React.ComponentPropsWithoutRef<typeof Link>, PermissionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional element to show when permission is denied
}

export default function PermissionLink({
  children,
  permissionsRequired,
  fallback = null,
  ...props
}: PermissionLinkProps) {
  // Check if user has required permissions
  if (!hasRequiredPermissions(permissionsRequired)) {
    return <>{fallback}</>;
  }

  // User has permissions, render the link
  return (
    <Link {...props}>
      {children}
    </Link>
  );
}