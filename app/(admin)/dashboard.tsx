import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Gestion des utilisateurs',
      subtitle: 'Gérer les comptes et validations',
      icon: Users,
      color: '#2563EB',
      route: '/(admin)/users',
    },
    {
      title: 'Gestion des rendez-vous',
      subtitle: 'Voir et gérer les consultations',
      icon: Calendar,
      color: '#10B981',
      route: '/(admin)/appointments',
    },
    {
      title: 'Consultation des paiements',
      subtitle: 'Suivi des transactions',
      icon: CreditCard,
      color: '#F59E0B',
      route: '/(admin)/payments',
    },
    {
      title: 'Logs de sécurité',
      subtitle: 'Audit et traçabilité',
      icon: FileText,
      color: '#EF4444',
      route: '/(admin)/audit-logs',
    },
  ];

  const stats = [
    {
      title: 'Utilisateurs actifs',
      value: '0',
      icon: Users,
      color: '#2563EB',
    },
    {
      title: 'Rendez-vous aujourd\'hui',
      value: '0',
      icon: Calendar,
      color: '#10B981',
    },
    {
      title: 'Paiements en attente',
      value: '0',
      icon: AlertTriangle,
      color: '#F59E0B',
    },
    {
      title: 'Professionnels approuvés',
      value: '0',
      icon: CheckCircle,
      color: '#10B981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Shield size={32} color="#2563EB" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Administration</Text>
            <Text style={styles.subtitle}>Tableau de bord</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                  <stat.icon size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu d'administration</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuCard}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={28} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.alertSection}>
          <View style={styles.alertCard}>
            <AlertTriangle size={20} color="#F59E0B" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Accès administrateur</Text>
              <Text style={styles.alertText}>
                Vous avez accès aux fonctions sensibles. Utilisez ces outils avec précaution.
              </Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsSection: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '48%',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuGrid: {
    gap: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  alertSection: {
    marginBottom: 32,
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 16,
  },
});