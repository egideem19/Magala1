export interface Database {
  public: {
    Tables: {
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
          role: 'patient' | 'professionnel';
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
          role: 'patient' | 'professionnel';
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
          role?: 'patient' | 'professionnel';
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