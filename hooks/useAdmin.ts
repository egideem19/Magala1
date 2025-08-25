import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];
type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export function useAdmin() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAdmin(profile?.role === 'admin');
    setLoading(false);
  }, [profile]);

  // Gestion des utilisateurs
  const getAllUsers = async (): Promise<Profile[]> => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const updateUserRole = async (userId: string, newRole: 'patient' | 'professionnel' | 'admin') => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateUserStatus = async (userId: string, status: 'en_attente' | 'approuve' | 'rejete') => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ statut_approbation: status, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Gestion des rendez-vous
  const getAllAppointments = async (): Promise<(Appointment & { 
    patient: Profile; 
    professionnel: Profile 
  })[]> => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id(id, prenom, nom, email),
        professionnel:professionnel_id(id, prenom, nom, email, qualification)
      `)
      .order('date_rendez_vous', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('appointments')
      .update({ statut: 'annule', updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Gestion des paiements
  const getAllPayments = async (): Promise<(Payment & { user: Profile })[]> => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        user:user_id(id, prenom, nom, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const refundPayment = async (paymentId: string) => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('payments')
      .update({ statut: 'refunded', updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Logs d'audit
  const getAuditLogs = async (): Promise<(AuditLog & { user: Profile | null })[]> => {
    if (!isAdmin) throw new Error('Accès non autorisé');
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:user_id(id, prenom, nom, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  };

  return {
    isAdmin,
    loading,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    getAllAppointments,
    cancelAppointment,
    getAllPayments,
    refundPayment,
    getAuditLogs,
  };
}