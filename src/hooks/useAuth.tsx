
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { UserService, type Profile } from '@/services/userService';

export const useAuth = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!isLoaded) return;
      
      setLoading(true);
      
      if (isSignedIn && user) {
        try {
          // Set up Supabase auth token
          const token = await getToken({ template: 'supabase' });
          
          if (token) {
            // Create or update user profile in Supabase
            const profileData = await UserService.createOrUpdateProfile(user.id, {
              email: user.emailAddresses[0]?.emailAddress,
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              avatarUrl: user.imageUrl || undefined,
            });
            
            setProfile(profileData);
          }
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    };

    syncUserProfile();
  }, [isSignedIn, user, isLoaded, getToken]);

  return {
    user,
    profile,
    isSignedIn: !!isSignedIn,
    isLoaded,
    loading,
  };
};
