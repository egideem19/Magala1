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
import { ArrowLeft, CreditCard, User, RefreshCw } from 'lucide-react-native';
import { Database } from '@/lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'] & {
  user: Database['public']['Tables']['profiles']['Row'];
};

export default function AdminPaymentsScreen() {
  const router = useRouter();
  const { getAllPayments, refundPayment } = useAdmin();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      setPayments(data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    Alert.alert(
      'Rembourser le paiement',
      'Êtes-vous sûr de vouloir marquer ce paiement comme remboursé ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rembourser',
          onPress: async () => {
            try {
              setRefunding(paymentId);
              await refundPayment(paymentId);
              await loadPayments();
              Alert.alert('Succès', 'Paiement marqué comme remboursé');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            } finally {
              setRefunding(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'refunded': return '#64748B';
      default: return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      case 'refunded': return 'Remboursé';
      default: return status;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement des paiements...</Text>
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
        <Text style={styles.title}>Consultation des paiements</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{payments.length}</Text>
            <Text style={styles.statLabel}>Total paiements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {payments.filter(p => p.statut === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {payments.reduce((sum, p) => p.statut === 'paid' ? sum + p.montant : sum, 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total payé (USD)</Text>
          </View>
        </View>

        <View style={styles.paymentsList}>
          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucun paiement</Text>
              <Text style={styles.emptyText}>
                Aucun paiement n'a été enregistré pour le moment.
              </Text>
            </View>
          ) : (
            payments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>
                      {formatAmount(payment.montant, payment.devise)}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(payment.statut)}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(payment.statut) }]}>
                      {getStatusText(payment.statut)}
                    </Text>
                  </View>
                </View>

                <View style={styles.userSection}>
                  <View style={styles.userIcon}>
                    <User size={16} color="#2563EB" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {payment.user.prenom} {payment.user.nom}
                    </Text>
                    <Text style={styles.userEmail}>{payment.user.email}</Text>
                    <Text style={styles.userRole}>
                      {payment.user.role === 'professionnel' ? 'Professionnel de santé' : 'Patient'}
                    </Text>
                  </View>
                </View>

                {payment.methode_paiement && (
                  <View style={styles.paymentDetails}>
                    <Text style={styles.detailLabel}>Méthode de paiement :</Text>
                    <Text style={styles.detailValue}>{payment.methode_paiement}</Text>
                  </View>
                )}

                {payment.transaction_id && (
                  <View style={styles.paymentDetails}>
                    <Text style={styles.detailLabel}>ID Transaction :</Text>
                    <Text style={styles.detailValue}>{payment.transaction_id}</Text>
                  </View>
                )}

                {payment.statut === 'paid' && (
                  <View style={styles.actionsSection}>
                    <TouchableOpacity
                      style={styles.refundButton}
                      onPress={() => handleRefund(payment.id)}
                      disabled={refunding === payment.id}
                    >
                      {refunding === payment.id ? (
                        <ActivityIndicator size="small" color="#64748B" />
                      ) : (
                        <>
                          <RefreshCw size={16} color="#64748B" />
                          <Text style={styles.refundButtonText}>Rembourser</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
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
    gap: 8,
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  paymentsList: {
    gap: 12,
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
  paymentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  refundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  refundButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
});