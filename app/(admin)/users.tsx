import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAdmin } from '@/hooks/useAdmin';
import { ArrowLeft, User, Shield, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function AdminUsersScreen() {
  const router = useRouter();
  const { getAllUsers, updateUserRole, updateUserStatus } = useAdmin();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'patient' | 'professionnel' | 'admin') => {
    Alert.alert(
      'Changer le rôle',
      `Êtes-vous sûr de vouloir changer le rôle de cet utilisateur en "${newRole}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setUpdating(userId);
              await updateUserRole(userId, newRole);
              await loadUsers();
              Alert.alert('Succès', 'Rôle mis à jour avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (userId: string, status: 'en_attente' | 'approuve' | 'rejete') => {
    const statusText = status === 'approuve' ? 'approuver' : status === 'rejete' ? 'rejeter' : 'mettre en attente';
    
    Alert.alert(
      'Changer le statut',
      `Êtes-vous sûr de vouloir ${statusText} ce professionnel ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setUpdating(userId);
              await updateUserStatus(userId, status);
              await loadUsers();
              Alert.alert('Succès', 'Statut mis à jour avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approuve': return <CheckCircle size={16} color="#10B981" />;
      case 'rejete': return <XCircle size={16} color="#EF4444" />;
      case 'en_attente': return <Clock size={16} color="#F59E0B" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approuve': return '#10B981';
      case 'rejete': return '#EF4444';
      case 'en_attente': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#7C3AED';
      case 'professionnel': return '#2563EB';
      case 'patient': return '#10B981';
      default: return '#64748B';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des utilisateurs</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total utilisateurs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.role === 'professionnel' && u.statut_approbation === 'en_attente').length}
            </Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>

        <View style={styles.usersList}>
          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <User size={20} color="#64748B" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user.prenom} {user.nom}
                    </Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.qualification && (
                      <Text style={styles.userQualification}>{user.qualification}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.userBadges}>
                  <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(user.role)}15` }]}>
                    <Text style={[styles.roleBadgeText, { color: getRoleColor(user.role) }]}>
                      {user.role}
                    </Text>
                  </View>
                  
                  {user.role === 'professionnel' && (
                    <View style={styles.statusBadge}>
                      {getStatusIcon(user.statut_approbation)}
                      <Text style={[styles.statusText, { color: getStatusColor(user.statut_approbation) }]}>
                        {user.statut_approbation}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.userActions}>
                <Text style={styles.actionsTitle}>Actions :</Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.roleButton]}
                    onPress={() => handleRoleChange(user.id, 'patient')}
                    disabled={updating === user.id}
                  >
                    {updating === user.id ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                      <Text style={styles.actionButtonText}>Patient</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.roleButton]}
                    onPress={() => handleRoleChange(user.id, 'professionnel')}
                    disabled={updating === user.id}
                  >
                    <Text style={styles.actionButtonText}>Professionnel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.adminButton]}
                    onPress={() => handleRoleChange(user.id, 'admin')}
                    disabled={updating === user.id}
                  >
                    <Shield size={14} color="#7C3AED" />
                    <Text style={[styles.actionButtonText, { color: '#7C3AED' }]}>Admin</Text>
                  </TouchableOpacity>
                </View>

                {user.role === 'professionnel' && (
                  <View style={styles.statusActions}>
                    <TouchableOpacity
                      style={[styles.statusButton, styles.approveButton]}
                      onPress={() => handleStatusChange(user.id, 'approuve')}
                      disabled={updating === user.id}
                    >
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={[styles.statusButtonText, { color: '#10B981' }]}>Approuver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.statusButton, styles.rejectButton]}
                      onPress={() => handleStatusChange(user.id, 'rejete')}
                      disabled={updating === user.id}
                    >
                      <XCircle size={14} color="#EF4444" />
                      <Text style={[styles.statusButtonText, { color: '#EF4444' }]}>Rejeter</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  statItem: {
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
  usersList: {
    gap: 12,
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  userQualification: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
  },
  userBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  userActions: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  actionsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  roleButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  adminButton: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  approveButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});