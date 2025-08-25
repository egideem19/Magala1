import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Heart, Calendar, MessageSquare, Bell, Activity, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getStatusMessage = () => {
    if (profile?.role === 'professionnel') {
      switch (profile.statut_approbation) {
        case 'en_attente':
          return {
            type: 'warning',
            message: 'Votre profil professionnel est en cours de vérification',
            icon: Clock,
          };
        case 'approuve':
          return {
            type: 'success',
            message: 'Votre profil professionnel est approuvé',
            icon: Activity,
          };
        case 'rejete':
          return {
            type: 'error',
            message: 'Votre profil professionnel nécessite des modifications',
            icon: AlertCircle,
          };
      }
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {profile?.prenom || 'Utilisateur'}
          </Text>
          <Text style={styles.subtitle}>
            {profile?.role === 'professionnel' 
              ? `Dr. ${profile?.nom}` 
              : 'Comment vous sentez-vous aujourd\'hui ?'}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {statusMessage && (
          <View style={[styles.statusCard, styles[`${statusMessage.type}Card`]]}>
            <View style={styles.statusIcon}>
              <statusMessage.icon 
                size={20} 
                color={statusMessage.type === 'success' ? '#10B981' : 
                       statusMessage.type === 'warning' ? '#F59E0B' : '#EF4444'} 
              />
            </View>
            <Text style={[styles.statusText, styles[`${statusMessage.type}Text`]]}>
              {statusMessage.message}
            </Text>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Calendar size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionTitle}>Prendre rendez-vous</Text>
              <Text style={styles.actionSubtitle}>Planifier une consultation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <MessageSquare size={24} color="#10B981" />
              </View>
              <Text style={styles.actionTitle}>Mes messages</Text>
              <Text style={styles.actionSubtitle}>Discuter avec un professionnel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Heart size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionTitle}>Mon suivi</Text>
              <Text style={styles.actionSubtitle}>Historique médical</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Activity size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionTitle}>Urgences</Text>
              <Text style={styles.actionSubtitle}>Contacts d'urgence</Text>
            </TouchableOpacity>
          </View>
        </View>

        {profile?.role === 'patient' && (
          <View style={styles.healthTips}>
            <Text style={styles.sectionTitle}>Conseils santé du jour</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💧 Hydratation</Text>
              <Text style={styles.tipText}>
                N'oubliez pas de boire au moins 1.5L d'eau par jour pour maintenir une bonne hydratation.
              </Text>
            </View>
          </View>
        )}

        {profile?.role === 'professionnel' && profile?.statut_approbation === 'approuve' && (
          <View style={styles.professionalSection}>
            <Text style={styles.sectionTitle}>Tableau de bord professionnel</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Consultations aujourd'hui</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Patients ce mois</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusIcon: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  successText: {
    color: '#065F46',
  },
  warningText: {
    color: '#92400E',
  },
  errorText: {
    color: '#991B1B',
  },
  quickActions: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '48%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  healthTips: {
    marginVertical: 24,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  professionalSection: {
    marginVertical: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
});