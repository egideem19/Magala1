import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react-native';

interface LogoutButtonProps {
  style?: any;
  textStyle?: any;
  showIcon?: boolean;
}

export default function LogoutButton({ 
  style, 
  textStyle, 
  showIcon = true 
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: performLogout
        },
      ]
    );
  };

  const performLogout = async () => {
    setLoading(true);
    try {
      // Appel direct à supabase.auth.signOut()
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Redirection avec navigation.reset équivalent
      router.dismissAll();
      router.replace('/(auth)/sign-in');
      
    } catch (error: any) {
      // Gestion d'erreurs avec Alert
      Alert.alert(
        'Erreur de déconnexion', 
        `Impossible de se déconnecter: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.signOutButton, style]} 
      onPress={handleLogout}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#EF4444" />
      ) : (
        <>
          {showIcon && <LogOut size={20} color="#EF4444" />}
          <Text style={[styles.signOutButtonText, textStyle]}>
            Se déconnecter
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
});