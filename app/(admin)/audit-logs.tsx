import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAdmin } from '@/hooks/useAdmin';
import { ArrowLeft, FileText, User, Clock } from 'lucide-react-native';
import { Database } from '@/lib/database.types';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'] & {
  user: Database['public']['Tables']['profiles']['Row'] | null;
};

export default function AdminAuditLogsScreen() {
  const router = useRouter();
  const { getAuditLogs } = useAdmin();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return '#10B981';
      case 'UPDATE': return '#F59E0B';
      case 'DELETE': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'INSERT': return 'Création';
      case 'UPDATE': return 'Modification';
      case 'DELETE': return 'Suppression';
      default: return action;
    }
  };

  const formatTableName = (tableName: string | null) => {
    if (!tableName) return 'Inconnue';
    switch (tableName) {
      case 'profiles': return 'Profils';
      case 'appointments': return 'Rendez-vous';
      case 'payments': return 'Paiements';
      default: return tableName;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement des logs...</Text>
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
        <Text style={styles.title}>Logs de sécurité</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total événements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {logs.filter(log => {
                const today = new Date();
                const logDate = new Date(log.created_at);
                return logDate.toDateString() === today.toDateString();
              }).length}
            </Text>
            <Text style={styles.statLabel}>Aujourd'hui</Text>
          </View>
        </View>

        <View style={styles.logsList}>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucun log</Text>
              <Text style={styles.emptyText}>
                Aucun événement d'audit n'a été enregistré.
              </Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logInfo}>
                    <View style={styles.logMeta}>
                      <View style={[styles.actionBadge, { backgroundColor: `${getActionColor(log.action)}15` }]}>
                        <Text style={[styles.actionText, { color: getActionColor(log.action) }]}>
                          {getActionText(log.action)}
                        </Text>
                      </View>
                      <Text style={styles.tableName}>
                        {formatTableName(log.table_name)}
                      </Text>
                    </View>
                    <View style={styles.timeInfo}>
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.timestamp}>
                        {new Date(log.created_at).toLocaleDateString('fr-FR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.logDetails}>
                  {log.user ? (
                    <View style={styles.userInfo}>
                      <View style={styles.userIcon}>
                        <User size={14} color="#2563EB" />
                      </View>
                      <Text style={styles.userText}>
                        {log.user.prenom} {log.user.nom} ({log.user.role})
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.userInfo}>
                      <View style={styles.userIcon}>
                        <User size={14} color="#64748B" />
                      </View>
                      <Text style={styles.userText}>Utilisateur système</Text>
                    </View>
                  )}

                  {log.record_id && (
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordLabel}>ID Enregistrement :</Text>
                      <Text style={styles.recordValue}>{log.record_id.slice(0, 8)}...</Text>
                    </View>
                  )}

                  {log.metadata && (
                    <View style={styles.metadataSection}>
                      <Text style={styles.metadataLabel}>Métadonnées :</Text>
                      <View style={styles.metadataContent}>
                        <Text style={styles.metadataText}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {log.ip_address && (
                    <View style={styles.networkInfo}>
                      <Text style={styles.networkLabel}>IP :</Text>
                      <Text style={styles.networkValue}>{log.ip_address}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
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
  logsList: {
    gap: 8,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logHeader: {
    marginBottom: 8,
  },
  logInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  tableName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  logDetails: {
    gap: 6,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  recordValue: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    fontFamily: 'monospace',
  },
  metadataSection: {
    marginTop: 4,
  },
  metadataLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 2,
  },
  metadataContent: {
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metadataText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#374151',
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  networkValue: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    fontFamily: 'monospace',
  },
});