/*
  # Corriger les policies RLS pour éviter la récursion infinie

  1. Problème identifié
    - Les policies actuelles créent une récursion infinie
    - La policy admin vérifie le rôle dans la table profiles elle-même

  2. Solution
    - Supprimer toutes les policies existantes
    - Recréer des policies simples sans récursion
    - Utiliser auth.uid() directement sans référencer profiles dans les conditions
*/

-- Supprimer toutes les policies existantes sur profiles
DROP POLICY IF EXISTS "Admins peuvent tout voir sur profiles" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent créer leur profil" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leur propre profil" ON profiles;

-- Créer des policies simples sans récursion
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy spéciale pour les admins (utilise une approche différente)
-- On va créer une fonction qui vérifie le rôle admin sans récursion
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Policy admin pour voir tous les profils
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    is_admin(auth.uid())
  );

-- Policy admin pour modifier tous les profils
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    is_admin(auth.uid())
  );

-- Policy admin pour supprimer des profils
CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));