'use client'

import { useAuth } from "@/hooks/useAuth";

import { SocketProvider } from "@/context/SocketContext";
import { hasRequiredPermissions } from "@/lib/permissions/utils";


export default function SocketAuthWrapper({ children } :any) {

    const { user, isLoading } = useAuth(); // Assuming useAuth has loading and user state
 
    if (isLoading) return <div>Loading...</div>; // Or your app's loading component
 
    if (!user) return <>{children}</>; // e.g. Login page, doesn't need SocketProvider

   // if(!hasRequiredPermissions(['see:chat'])) return <>{children}</>;  // If user doesn't have see:chat permission, return children

    // User is authenticated, provide the socket context
    return <SocketProvider>{children}</SocketProvider>;
  };            