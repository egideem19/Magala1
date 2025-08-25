import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { User, Mail, Phone, MapPin, Calendar, Shield, CreditCard as Edit, Badge } from 'lucide-react-native';
import LogoutButton from '@/components/LogoutButton';

export default function ProfileScreen() {
  const { profile } = useProfile();

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Force navigation to welcome screen
              router.replace('/(auth)/welcome');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter: ' + (error as Error).message);
            }
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approuve': return '#10B981';
      case 'en_attente': return '#F59E0B';
      case 'rejete': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approuve': return 'Approuvé';
      case 'en_attente': return 'En attente';
      case 'rejete': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={32} color="#64748B" />
          </View>
          <Text style={styles.profileName}>
            {profile.prenom} {profile.nom}
          </Text>
          <Text style={styles.profileRole}>
            {profile.role === 'professionnel' ? 'Professionnel de santé' : 'Patient'}
          </Text>
          
          {profile.role === 'professionnel' && (
            <View style={styles.statusBadge}>
              <Shield 
                size={16} 
                color={getStatusColor(profile.statut_approbation)} 
              />
              <Text style={[
                styles.statusText, 
                { color: getStatusColor(profile.statut_approbation) }
              ]}>
                {getStatusText(profile.statut_approbation)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.infoItem}>
            <Mail size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Phone size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{profile.telephone}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MapPin size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{profile.adresse}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Calendar size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date de naissance</Text>
              <Text style={styles.infoValue}>
                {new Date(profile.date_naissance).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <User size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Sexe</Text>
              <Text style={styles.infoValue}>
                {profile.sexe.charAt(0).toUpperCase() + profile.sexe.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {profile.role === 'professionnel' && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informations professionnelles</Text>
            
            <View style={styles.infoItem}>
              <Badge size={20} color="#64748B" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Spécialité</Text>
                <Text style={styles.infoValue}>{profile.qualification}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionSection}>
        <LogoutButton />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
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