/*
  # Création des tables d'administration

  1. Nouvelles tables
    - `appointments` - Gestion des rendez-vous
    - `payments` - Gestion des paiements
    - `audit_logs` - Logs d'audit et sécurité

  2. Modifications
    - Ajout du rôle 'admin' à la table profiles
    - Mise à jour des contraintes

  3. Sécurité
    - Policies RLS pour limiter l'accès aux admins
    - Triggers pour les logs d'audit
*/

-- Modifier la contrainte de rôle pour inclure 'admin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['patient'::text, 'professionnel'::text, 'admin'::text]));

-- Créer la table appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  professionnel_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date_rendez_vous timestamptz NOT NULL,
  statut text DEFAULT 'planifie' CHECK (statut = ANY (ARRAY['planifie'::text, 'confirme'::text, 'annule'::text, 'termine'::text])),
  motif text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  montant decimal(10,2) NOT NULL,
  devise text DEFAULT 'USD',
  statut text DEFAULT 'pending' CHECK (statut = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  methode_paiement text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour appointments
CREATE POLICY "Admins peuvent tout voir sur appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Patients peuvent voir leurs rendez-vous"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Professionnels peuvent voir leurs rendez-vous"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (professionnel_id = auth.uid());

-- Policies pour payments
CREATE POLICY "Admins peuvent tout voir sur payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Utilisateurs peuvent voir leurs paiements"
  ON payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policies pour audit_logs (lecture seule pour admins)
CREATE POLICY "Admins peuvent lire les audit_logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policies pour profiles (admins peuvent tout voir et modifier)
CREATE POLICY "Admins peuvent tout voir sur profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- Fonction pour créer des logs d'audit automatiquement
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour audit sur les tables importantes
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_appointments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Trigger pour updated_at sur appointments
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur payments
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();