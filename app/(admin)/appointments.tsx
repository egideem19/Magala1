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
import { ArrowLeft, Calendar, User, XCircle } from 'lucide-react-native';
import { Database } from '@/lib/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient: Database['public']['Tables']['profiles']['Row'];
  professionnel: Database['public']['Tables']['profiles']['Row'];
};

export default function AdminAppointmentsScreen() {
  const router = useRouter();
  const { getAllAppointments, cancelAppointment } = useAdmin();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Annuler le rendez-vous',
      'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(appointmentId);
              await cancelAppointment(appointmentId);
              await loadAppointments();
              Alert.alert('Succès', 'Rendez-vous annulé avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            } finally {
              setCancelling(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planifie': return '#F59E0B';
      case 'confirme': return '#10B981';
      case 'annule': return '#EF4444';
      case 'termine': return '#64748B';
      default: return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planifie': return 'Planifié';
      case 'confirme': return 'Confirmé';
      case 'annule': return 'Annulé';
      case 'termine': return 'Terminé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement des rendez-vous...</Text>
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
        <Text style={styles.title}>Gestion des rendez-vous</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Total rendez-vous</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {appointments.filter(a => a.statut === 'planifie' || a.statut === 'confirme').length}
            </Text>
            <Text style={styles.statLabel}>Actifs</Text>
          </View>
        </View>

        <View style={styles.appointmentsList}>
          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucun rendez-vous</Text>
              <Text style={styles.emptyText}>
                Aucun rendez-vous n'a été planifié pour le moment.
              </Text>
            </View>
          ) : (
            appointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentDate}>
                      {new Date(appointment.date_rendez_vous).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(appointment.statut)}15` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(appointment.statut) }]}>
                        {getStatusText(appointment.statut)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.participantsSection}>
                  <View style={styles.participant}>
                    <View style={styles.participantIcon}>
                      <User size={16} color="#2563EB" />
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantLabel}>Patient</Text>
                      <Text style={styles.participantName}>
                        {appointment.patient.prenom} {appointment.patient.nom}
                      </Text>
                      <Text style={styles.participantEmail}>{appointment.patient.email}</Text>
                    </View>
                  </View>

                  <View style={styles.participant}>
                    <View style={[styles.participantIcon, { backgroundColor: '#10B98115' }]}>
                      <User size={16} color="#10B981" />
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantLabel}>Professionnel</Text>
                      <Text style={styles.participantName}>
                        Dr. {appointment.professionnel.prenom} {appointment.professionnel.nom}
                      </Text>
                      <Text style={styles.participantEmail}>{appointment.professionnel.email}</Text>
                      {appointment.professionnel.qualification && (
                        <Text style={styles.participantQualification}>
                          {appointment.professionnel.qualification}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {appointment.motif && (
                  <View style={styles.motifSection}>
                    <Text style={styles.motifLabel}>Motif :</Text>
                    <Text style={styles.motifText}>{appointment.motif}</Text>
                  </View>
                )}

                {appointment.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes :</Text>
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                  </View>
                )}

                {(appointment.statut === 'planifie' || appointment.statut === 'confirme') && (
                  <View style={styles.actionsSection}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelAppointment(appointment.id)}
                      disabled={cancelling === appointment.id}
                    >
                      {cancelling === appointment.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <>
                          <XCircle size={16} color="#EF4444" />
                          <Text style={styles.cancelButtonText}>Annuler</Text>
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
  appointmentsList: {
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
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appointmentHeader: {
    marginBottom: 16,
  },
  appointmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentDate: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
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
  participantsSection: {
    gap: 12,
    marginBottom: 16,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  participantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantInfo: {
    flex: 1,
  },
  participantLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 2,
  },
  participantName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  participantQualification: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginTop: 2,
  },
  motifSection: {
    marginBottom: 12,
  },
  motifLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  motifText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
});