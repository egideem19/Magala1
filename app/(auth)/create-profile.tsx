import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Upload, ArrowLeft } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

const ROLES = [
  { value: 'patient', label: 'Patient' },
  { value: 'professionnel', label: 'Professionnel de santé' },
];

const SEXES = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
];

const QUALIFICATIONS = [
  'Médecin généraliste',
  'Médecin spécialiste',
  'Infirmier',
  'Psychologue',
  'Psychiatre',
  'Kinésithérapeute',
  'Sage-femme',
  'Autre',
];

export default function CreateProfileScreen() {
  const router = useRouter();
  const { createProfile } = useProfile();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form data
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [sexe, setSexe] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [qualification, setQualification] = useState('');
  const [titreAcademique, setTitreAcademique] = useState('');
  const [documentUri, setDocumentUri] = useState('');

  // UI states
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showSexePicker, setShowSexePicker] = useState(false);
  const [showQualificationPicker, setShowQualificationPicker] = useState(false);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setDocumentUri(result.assets[0].uri);
        Alert.alert('Document sélectionné', 'Votre document a été sélectionné avec succès');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner le document');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!prenom || !nom || !sexe || !dateNaissance || !adresse || !telephone || !email || !role) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (role === 'professionnel' && (!qualification || !titreAcademique)) {
      Alert.alert('Erreur', 'Veuillez remplir la qualification et le titre académique');
      return;
    }

    // Validation de la date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateNaissance)) {
      Alert.alert('Erreur', 'Veuillez entrer une date valide au format AAAA-MM-JJ');
      return;
    }

    setLoading(true);
    try {
      // Créer le profil pour l'utilisateur authentifié
      const profileData = {
        prenom,
        nom,
        sexe: sexe as 'homme' | 'femme' | 'autre',
        date_naissance: dateNaissance,
        adresse,
        telephone,
        email,
        role: role as 'patient' | 'professionnel',
        qualification: role === 'professionnel' ? qualification : null,
        titre_academique: role === 'professionnel' ? titreAcademique : null,
        document_autorisation_url: role === 'professionnel' && documentUri ? documentUri : null,
        statut_approbation: role === 'professionnel' ? 'en_attente' as const : 'approuve' as const,
      };

      console.log('Données du profil à créer:', profileData);
      await createProfile(profileData);
      
      if (role === 'professionnel') {
        Alert.alert(
          'Profil créé',
          'Votre profil professionnel a été créé. Il sera examiné par notre équipe et vous recevrez une notification une fois approuvé.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }]
        );
      } else {
        Alert.alert('Profil créé', 'Votre profil a été créé avec succès');
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du profil:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(auth)/welcome')}
        >
          <ArrowLeft size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Créer votre profil</Text>
        <Text style={styles.subtitle}>
          Complétez vos informations pour commencer
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={prenom}
              onChangeText={setPrenom}
              placeholder="Votre prénom"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              placeholder="Votre nom"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sexe *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowSexePicker(!showSexePicker)}
            >
              <Text style={[styles.pickerText, !sexe && styles.placeholder]}>
                {sexe ? SEXES.find(s => s.value === sexe)?.label : 'Sélectionner'}
              </Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>
            {showSexePicker && (
              <View style={styles.pickerOptions}>
                {SEXES.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      setSexe(option.value);
                      setShowSexePicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de naissance *</Text>
            <TextInput
              style={styles.input}
              value={dateNaissance}
              onChangeText={setDateNaissance}
              placeholder="AAAA-MM-JJ"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse *</Text>
            <TextInput
              style={styles.input}
              value={adresse}
              onChangeText={setAdresse}
              placeholder="Votre adresse complète"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              value={telephone}
              onChangeText={setTelephone}
              placeholder="+243 XXX XXX XXX"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Je suis *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <Text style={[styles.pickerText, !role && styles.placeholder]}>
                {role ? ROLES.find(r => r.value === role)?.label : 'Sélectionner votre rôle'}
              </Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>
            {showRolePicker && (
              <View style={styles.pickerOptions}>
                {ROLES.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      setRole(option.value);
                      setShowRolePicker(false);
                      if (option.value === 'patient') {
                        setQualification('');
                        setTitreAcademique('');
                        setDocumentUri('');
                      }
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {role === 'professionnel' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Qualification *</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowQualificationPicker(!showQualificationPicker)}
                >
                  <Text style={[styles.pickerText, !qualification && styles.placeholder]}>
                    {qualification || 'Sélectionner votre qualification'}
                  </Text>
                  <ChevronDown size={20} color="#64748B" />
                </TouchableOpacity>
                {showQualificationPicker && (
                  <View style={styles.pickerOptions}>
                    {QUALIFICATIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.pickerOption}
                        onPress={() => {
                          setQualification(option);
                          setShowQualificationPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Titre académique *</Text>
                <TextInput
                  style={styles.input}
                  value={titreAcademique}
                  onChangeText={setTitreAcademique}
                  placeholder="Ex: Docteur en médecine, Master en psychologie..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preuve d'autorisation de prester</Text>
                <TouchableOpacity
                  style={styles.documentButton}
                  onPress={handleDocumentPick}
                >
                  <Upload size={20} color="#2563EB" />
                  <Text style={styles.documentButtonText}>
                    {documentUri ? 'Document sélectionné' : 'Sélectionner un document'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Optionnel: Joindre votre attestation d'inscription au tableau de l'ordre
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Créer mon profil</Text>
            )}
          </TouchableOpacity>
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
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  backButton: {
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  pickerOptions: {
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  documentButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  documentButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});