export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          professionnel_id: string;
          date_rendez_vous: string;
          statut: 'planifie' | 'confirme' | 'annule' | 'termine';
          motif: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          professionnel_id: string;
          date_rendez_vous: string;
          statut?: 'planifie' | 'confirme' | 'annule' | 'termine';
          motif?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          professionnel_id?: string;
          date_rendez_vous?: string;
          statut?: 'planifie' | 'confirme' | 'annule' | 'termine';
          motif?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          appointment_id: string | null;
          montant: number;
          devise: string;
          statut: 'pending' | 'paid' | 'failed' | 'refunded';
          methode_paiement: string | null;
          transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          appointment_id?: string | null;
          montant: number;
          devise?: string;
          statut?: 'pending' | 'paid' | 'failed' | 'refunded';
          methode_paiement?: string | null;
          transaction_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          appointment_id?: string | null;
          montant?: number;
          devise?: string;
          statut?: 'pending' | 'paid' | 'failed' | 'refunded';
          methode_paiement?: string | null;
          transaction_id?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: any | null;
          new_values: any | null;
          metadata: any | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          metadata?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          metadata?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          prenom: string;
          nom: string;
          sexe: 'homme' | 'femme' | 'autre';
          date_naissance: string;
          adresse: string;
          telephone: string;
          email: string;
          role: 'patient' | 'professionnel' | 'admin';
          qualification: string | null;
          statut_approbation: 'en_attente' | 'approuve' | 'rejete';
          document_autorisation_url: string | null;
          titre_academique: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          prenom: string;
          nom: string;
          sexe: 'homme' | 'femme' | 'autre';
          date_naissance: string;
          adresse: string;
          telephone: string;
          email: string;
          role: 'patient' | 'professionnel' | 'admin';
          qualification?: string | null;
          statut_approbation?: 'en_attente' | 'approuve' | 'rejete';
          document_autorisation_url?: string | null;
          titre_academique?: string | null;
        };
        Update: {
          id?: string;
          prenom?: string;
          nom?: string;
          sexe?: 'homme' | 'femme' | 'autre';
          date_naissance?: string;
          adresse?: string;
          telephone?: string;
          email?: string;
          role?: 'patient' | 'professionnel' | 'admin';
          qualification?: string | null;
          statut_approbation?: 'en_attente' | 'approuve' | 'rejete';
          document_autorisation_url?: string | null;
          titre_academique?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}