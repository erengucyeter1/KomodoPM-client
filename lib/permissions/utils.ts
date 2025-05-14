import { useAuth } from '@/hooks/useAuth';

export function hasRequiredPermissions(
  permissionsRequired?: string[],
  requirementType: "every" | "some" = "every"
): boolean {
  const { user } = useAuth();
  const userPermissions = user?.permissions;

  // İzin kontrolü yoksa herkes görebilir
  if (!permissionsRequired || permissionsRequired.length === 0) {
    return true;
  }
  // Kullanıcı izinleri yoksa erişim engellenir
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  if (userPermissions.includes('admin')) {
    return true;
  }
  // Tüm gerekli izinlere sahip mi?
  switch (requirementType) {
    case "every":
      return permissionsRequired.every(permission => 
        userPermissions.includes(permission)
      );
    case "some":
      return permissionsRequired.some(permission => 
        userPermissions.includes(permission)
      );
    default:
      return false;
}
}

