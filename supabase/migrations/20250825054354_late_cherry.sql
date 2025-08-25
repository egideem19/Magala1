/*
  # Création du système de profils Magala

  1. Nouvelles Tables
    - `profiles`
      - `id` (uuid, lié à auth.users.id)
      - `prenom` (text)
      - `nom` (text) 
      - `sexe` (text)
      - `date_naissance` (date)
      - `adresse` (text)
      - `telephone` (text avec code pays)
      - `email` (text)
      - `role` (enum: patient, professionnel)
      - `qualification` (text, pour professionnels)
      - `statut_approbation` (enum: en_attente, approuve, rejete)
      - `document_autorisation_url` (text, pour professionnels)
      - `titre_academique` (text, pour professionnels)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `profiles`
    - Policy pour que les utilisateurs ne voient que leur propre profil
    - Policy pour les admins (si nécessaire plus tard)
*/

-- Création de la table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom text NOT NULL,
  nom text NOT NULL,
  sexe text NOT NULL CHECK (sexe IN ('homme', 'femme', 'autre')),
  date_naissance date NOT NULL,
  adresse text NOT NULL,
  telephone text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'professionnel')),
  qualification text,
  statut_approbation text DEFAULT 'en_attente' CHECK (statut_approbation IN ('en_attente', 'approuve', 'rejete')),
  document_autorisation_url text,
  titre_academique text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy pour que chaque utilisateur ne voie que son propre profil
CREATE POLICY "Utilisateurs peuvent voir leur propre profil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy pour que chaque utilisateur puisse modifier son propre profil
CREATE POLICY "Utilisateurs peuvent modifier leur propre profil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy pour que les utilisateurs puissent créer leur profil
CREATE POLICY "Utilisateurs peuvent créer leur profil"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();