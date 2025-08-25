import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1);

      if (error) {
        throw error;
      }

      setProfile(data && data.length > 0 ? data[0] : null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<ProfileInsert, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Tentative de création de profil pour user:', user.id);
      console.log('Données du profil:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          ...profileData,
          id: user.id,
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la création du profil:', error);
        throw error;
      }

      console.log('Profil créé avec succès:', data);
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Erreur dans createProfile:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) throw new Error('User or profile not found');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    fetchProfile,
  };
}