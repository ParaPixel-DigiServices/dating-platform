import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import theme from '@/theme/theme';
import apiClient from '@/services/backendService';
import { showSuccessToast, showErrorToast } from '@/components/toast';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import Slider from '@react-native-community/slider';
import Animated, { FadeInDown, SlideInRight, SlideOutLeft, SlideInLeft, SlideOutRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { OnboardingTopBar } from '@/components/onboarding/OnboardingTopBar';
import { EDUCATION_OPTIONS, WORK_ROLE_OPTIONS } from '@/data/marriageOptions';

const BgImg = require("@/assets/images/bg.png");
const { width, height } = Dimensions.get('window');

const t = theme.onboarding;

const OPTIONS: Record<string, any[]> = {
  maritalStatus: [
    { label: 'Never Married', value: 'NEVER_MARRIED' },
    { label: 'Divorced', value: 'DIVORCED' },
    { label: 'Widowed', value: 'WIDOWED' },
    { label: 'Awaiting Divorce', value: 'AWAITING_DIVORCE' },
    { label: 'Annulled', value: 'ANNULLED' }
  ],
  diet: [
    { label: 'Vegetarian', value: 'VEGETARIAN' },
    { label: 'Non-Vegetarian', value: 'NON_VEGETARIAN' },
    { label: 'Eggetarian', value: 'EGGETARIAN' },
    { label: 'Vegan', value: 'VEGAN' },
    { label: 'Jain', value: 'JAIN' }
  ],
  relocationPreference: [
    { label: 'Prefers Same City', value: 'PREFERS_SAME_CITY' },
    { label: 'Prefers Same State', value: 'PREFERS_SAME_STATE' },
    { label: 'Open to Relocate (India)', value: 'OPEN_TO_RELOCATE_WITHIN_COUNTRY' },
    { label: 'Open to Relocate (Anywhere)', value: 'OPEN_TO_RELOCATE_ANYWHERE' }
  ],
  disabilityStatus: [
    { label: 'None', value: 'NONE' },
    { label: 'Physical Disability', value: 'PHYSICAL_DISABILITY' }
  ],
  education: EDUCATION_OPTIONS,
  workSector: [
    { label: 'Private Sector', value: 'PRIVATE' },
    { label: 'Government/Public Sector', value: 'GOVT' },
    { label: 'Defense', value: 'DEFENSE' },
    { label: 'Business/Self-Employed', value: 'BUSINESS' },
    { label: 'Not Working', value: 'NOT_WORKING' }
  ],
  workRole: WORK_ROLE_OPTIONS,
  family: [
    { label: 'Nuclear Family', value: 'NUCLEAR' },
    { label: 'Joint Family', value: 'JOINT' }
  ],
  familyIncome: [
    { label: 'Lower Income', value: 'LOW' },
    { label: 'Middle Class', value: 'MIDDLE' },
    { label: 'Upper Middle Class', value: 'UPPER_MIDDLE' },
    { label: 'High Income', value: 'HIGH' },
    { label: 'Rich/Affluent', value: 'RICH' }
  ],
  annualIncome: [
    { label: 'Up to 1 Lakh', value: 'UPTO_1L' },
    { label: '1 - 3 Lakhs', value: '1_TO_3L' },
    { label: '3 - 5 Lakhs', value: '3_TO_5L' },
    { label: '5 - 8 Lakhs', value: '5_TO_8L' },
    { label: 'Up to 12 Lakhs', value: 'UPTO_12L' },
    { label: '12 - 15 Lakhs', value: '12_TO_15L' },
    { label: 'Up to 20 Lakhs', value: 'UPTO_20L' },
    { label: 'Up to 30 Lakhs', value: 'UPTO_30L' },
    { label: 'Up to 50 Lakhs', value: 'UPTO_50L' },
    { label: '50 Lakhs+', value: '50L_PLUS' }
  ]
};

type FieldKey = keyof typeof OPTIONS;

export default function MarriageDetailsScreen() {
  const router = useRouter();
  const marriageFormData = useOnboardingStore((s) => s.marriageFormData);
  const marriageProgress = useOnboardingStore((s) => s.marriageProgress);
  const setMarriageProgress = useOnboardingStore((s) => s.setMarriageProgress);
  const updateMarriageFormData = useOnboardingStore((s) => s.updateMarriageFormData);

  const [loading, setLoading] = useState(false);

  const getInitialStep = () => {
    if (marriageProgress === 'FAMILY') return 2;
    if (marriageProgress === 'BASIC_DETAILS') return 1;
    return 0; // SUB_CATEGORY fallback
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep()); 
  const [direction, setDirection] = useState<'forward'|'backward'>('forward');

  // Convert saved heightCm back to inches for the slider (heightCm is now stored as integer)
  const parsedHeightInches = marriageFormData.heightCm
    ? Math.round(Number(marriageFormData.heightCm) / 2.54) || 66
    : 66;

  const [formData, setFormData] = useState<any>({
    ...marriageFormData,
    heightInches: parsedHeightInches,
  });

  const [activeModal, setActiveModal] = useState<FieldKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(onboarding)/category');
      }
    }
  };

  const formatHeight = (inches: number) => {
    const feet = Math.floor(inches / 12);
    const inch = inches % 12;
    return `${feet}'${inch}" (${Math.round(inches * 2.54)} cm)`;
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Always sync current form data to store
    updateMarriageFormData({
      ...formData,
      // Store as clean integer cm — not the display string — so the backend can parse it safely
      heightCm: Math.round(formData.heightInches * 2.54),
      brotherCount: formData.brotherCount?.toString() || '0',
      sisterCount: formData.sisterCount?.toString() || '0',
    });

    if (currentStep < 2) {
      const nextStep = currentStep + 1;
      setDirection('forward');
      setCurrentStep(nextStep);
      setMarriageProgress(nextStep === 1 ? 'BASIC_DETAILS' : 'FAMILY');
    } else {
      await handleSubmit();
    }
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return formData.maritalStatus && formData.diet && formData.relocationPreference;
    }
    if (currentStep === 1) {
      return formData.education && formData.college && formData.workSector && formData.workRole && formData.workCompany && formData.annualIncome;
    }
    if (currentStep === 2) {
      return formData.family && formData.familyIncome && formData.fatherName && formData.motherName;
    }
    return true;
  };

  const updateField = (key: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const getLabel = (key: FieldKey, val: string) => {
    if (!val) return '';
    const opt = OPTIONS[key].find((o: any) => o.value === val || o.label === val);
    return opt ? opt.label : val;
  };

  const renderSelectRow = (key: FieldKey, title: string, icon: any) => (
    <TouchableOpacity style={styles.inputBox} activeOpacity={0.7} onPress={() => { 
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
      setSearchQuery('');
      setActiveModal(key); 
    }}>
      <Feather name={icon} size={18} color={t.primary} style={styles.inputIcon} />
      <Text style={[styles.textInput, !formData[key] && { color: t.textSecondary }]} numberOfLines={1}>
        {formData[key] ? getLabel(key, formData[key]) : title}
      </Text>
      <Feather name="chevron-down" size={20} color={t.primary} style={{ marginRight: 16 }} />
    </TouchableOpacity>
  );

  const renderTextInput = (key: string, placeholder: string, icon: any, keyboardType: any = "default") => (
    <View style={styles.inputBox}>
      <Feather name={icon} size={18} color={t.primary} style={styles.inputIcon} />
      <TextInput 
        style={styles.textInput} 
        placeholderTextColor={t.textSecondary} 
        placeholder={placeholder} 
        value={formData[key]} 
        onChangeText={(text) => updateField(key, text)} 
        keyboardType={keyboardType}
      />
    </View>
  );

  const handleSubmit = async () => {
    // Proceed to interests screen
    setMarriageProgress('INTERESTS');
    router.replace('/(onboarding)/marriage-interests');
  };

  return (
    <View style={styles.container}>
      {/* ── Background Layers ── */}
      <View style={styles.absoluteFill}>
        <Image source={BgImg} style={styles.backgroundImage} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#e5b499", opacity: 0.1 }]} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0D0A07", opacity: 0.7 }]} />
        <LinearGradient colors={["rgba(13,10,7,0.1)", "rgba(13,10,7,0.8)", "#0D0A07"]} locations={[0.3, 0.7, 1]} style={StyleSheet.absoluteFill} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <OnboardingTopBar step={currentStep + 1} totalSteps={3} onBack={handleBack} />

          <View style={styles.slidingArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                {/* STEP 1: BASIC INFO */}
                {currentStep === 0 && (
                  <Animated.View key="step1" entering={direction === 'forward' ? SlideInRight.duration(400) : SlideInLeft.duration(400)} exiting={direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)} style={styles.stepContent}>
                    <View style={styles.headerTextContainer}>
                      <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.headline}>Basic{"\n"}Information</Animated.Text>
                      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subHeadline}>Tell us a bit about yourself.</Animated.Text>
                    </View>

                    <View style={styles.formContainer}>
                      <Text style={styles.inputLabel}>YOUR HEIGHT<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                      <View style={styles.sliderContainer}>
                        <Text style={styles.sliderValue}>{formatHeight(formData.heightInches)}</Text>
                        <Slider
                          style={{width: '100%', height: 40, marginTop: 10}}
                          minimumValue={48}
                          maximumValue={84}
                          step={1}
                          value={formData.heightInches}
                          onSlidingComplete={(val) => updateField('heightInches', val)}
                          minimumTrackTintColor={t.primary}
                          maximumTrackTintColor="rgba(255,255,255,0.1)"
                          thumbTintColor={t.primary}
                        />
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5}}>
                          <Text style={{color: t.textSecondary, fontSize: 12}}>4'0"</Text>
                          <Text style={{color: t.textSecondary, fontSize: 12}}>7'0"</Text>
                        </View>
                      </View>

                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>MARITAL STATUS<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('maritalStatus', 'Select Marital Status', 'user')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>DIET PREFERENCE<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('diet', 'Select Diet', 'coffee')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>RELOCATION PREFERENCE<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('relocationPreference', 'Select Preference', 'map-pin')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>DISABILITY STATUS</Text>
                        {renderSelectRow('disabilityStatus', 'Select Status', 'activity')}
                      </View>
                    </View>
                  </Animated.View>
                )}

                {/* STEP 2: EDUCATION & CAREER */}
                {currentStep === 1 && (
                  <Animated.View key="step2" entering={direction === 'forward' ? SlideInRight.duration(400) : SlideInLeft.duration(400)} exiting={direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)} style={styles.stepContent}>
                    <View style={styles.headerTextContainer}>
                      <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.headline}>Education &{"\n"}Career</Animated.Text>
                      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subHeadline}>Share your professional journey.</Animated.Text>
                    </View>

                    <View style={styles.formContainer}>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>HIGHEST EDUCATION<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('education', 'Select Education', 'book')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>COLLEGE / UNIVERSITY<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderTextInput('college', 'College name', 'book-open')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>WORK SECTOR<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('workSector', 'Select Sector', 'briefcase')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>WORK ROLE<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('workRole', 'Select Role', 'award')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>COMPANY NAME<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderTextInput('workCompany', 'Company name', 'target')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>ANNUAL INCOME<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('annualIncome', 'Select Income Range', 'dollar-sign')}
                      </View>
                    </View>
                  </Animated.View>
                )}

                {/* STEP 3: FAMILY DETAILS */}
                {currentStep === 2 && (
                  <Animated.View key="step3" entering={direction === 'forward' ? SlideInRight.duration(400) : SlideInLeft.duration(400)} exiting={direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)} style={styles.stepContent}>
                    <View style={styles.headerTextContainer}>
                      <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.headline}>Family{"\n"}Details</Animated.Text>
                      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subHeadline}>Family values are important.</Animated.Text>
                    </View>

                    <View style={styles.formContainer}>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>FAMILY TYPE<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('family', 'Select Family Type', 'users')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>FAMILY INCOME<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderSelectRow('familyIncome', 'Select Income Range', 'dollar-sign')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>FATHER'S DETAILS<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderTextInput('fatherName', 'Occupation / Name', 'user')}
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>MOTHER'S DETAILS<Text style={{color: '#ff4d4d'}}> *</Text></Text>
                        {renderTextInput('motherName', 'Occupation / Name', 'user')}
                      </View>
                      
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                          <Text style={styles.inputLabel}>BROTHERS</Text>
                          {renderTextInput('brotherCount', 'Count', 'users', 'number-pad')}
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                          <Text style={styles.inputLabel}>SISTERS</Text>
                          {renderTextInput('sisterCount', 'Count', 'users', 'number-pad')}
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                )}
                
              </ScrollView>
            </KeyboardAvoidingView>
          </View>

          {/* ── Footer / CTA ── */}
          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={handleNext} activeOpacity={!canProceed() || loading ? 1 : 0.85} style={[styles.buttonWrapper, !canProceed() && { opacity: 0.5 }]} disabled={loading || !canProceed()}>
              <LinearGradient colors={["#f2c7aa", "#e5b399", "#f2c7aa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0D0A07" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Continue</Text>
                    <Feather name="arrow-right" color="#0D0A07" size={20} style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>

      {/* ── Modal for Enum Selections ── */}
      <Modal visible={activeModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setActiveModal(null)} />
          <Animated.View entering={FadeInDown.duration(300).springify()} style={[styles.modalContent, (activeModal === 'education' || activeModal === 'workRole') && { height: height * 0.8 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={24} color={t.textPrimary} />
              </TouchableOpacity>
            </View>

            {(activeModal === 'education' || activeModal === 'workRole') && (
              <View style={styles.searchContainer}>
                <Feather name="search" size={18} color={t.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search options..."
                  placeholderTextColor={t.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
              </View>
            )}

            <ScrollView style={{ flex: (activeModal === 'education' || activeModal === 'workRole') ? 1 : undefined, maxHeight: (activeModal === 'education' || activeModal === 'workRole') ? undefined : height * 0.5 }} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
              {activeModal && OPTIONS[activeModal]
                .filter((opt: any) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((opt: any, idx) => {
                const isSelected = formData[activeModal] === opt.value;
                return (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.modalOption, isSelected && { backgroundColor: t.primary + '15', borderColor: t.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateField(activeModal, opt.value);
                      setTimeout(() => setActiveModal(null), 150);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalOptionText, isSelected && { color: t.primary, fontFamily: 'Lato_700Bold' }]}>{opt.label}</Text>
                      {opt.category && <Text style={{ fontSize: 12, color: t.textSecondary, marginTop: 4 }}>{opt.category}</Text>}
                    </View>
                    {isSelected && <Feather name="check" size={20} color={t.primary} />}
                  </TouchableOpacity>
                );
              })}
              <View style={{height: 20}} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  absoluteFill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  backgroundImage: { width: width, height: height * 0.7, opacity: 1 },
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  contentContainer: { flex: 1 },
  slidingArea: { flex: 1, overflow: "hidden" },
  stepContent: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 250 },
  headerTextContainer: { marginBottom: 32 },
  headline: { fontFamily: Platform.select({ ios: "Times New Roman", android: "serif" }), fontSize: 44, color: t.textPrimary, lineHeight: 50, letterSpacing: 0, marginBottom: 12 },
  subHeadline: { fontFamily: "Lato_400Regular", fontSize: 16, color: t.textSecondary, letterSpacing: 0.3 },
  formContainer: { width: "100%" },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: "800", marginBottom: 10, marginLeft: 4, letterSpacing: 1, textTransform: "uppercase", color: t.primary },
  inputBox: { flexDirection: "row", alignItems: "center", borderRadius: 12, height: 58, borderWidth: 1.5, backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.15)" },
  inputIcon: { marginLeft: 16, marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, fontWeight: "500", letterSpacing: 0.2, color: t.textPrimary },
  sliderContainer: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderWidth: 1.5, borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: 12, padding: 16, marginBottom: 20 },
  sliderValue: { fontSize: 22, color: t.primary, fontFamily: 'Lato_700Bold', textAlign: 'center', marginBottom: 5 },
  footerContainer: { paddingHorizontal: 28, paddingBottom: Platform.OS === "ios" ? 44 : 24, paddingTop: 16 },
  buttonWrapper: { borderRadius: 50, overflow: "hidden" },
  buttonGradient: { height: 56, flexDirection: 'row', alignItems: "center", justifyContent: "center", borderRadius: 50 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#0D0A07", letterSpacing: 0.6 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: '#1A1412', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: 'Lato_700Bold', color: t.textPrimary },
  modalCloseBtn: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: 12, marginBottom: 12, backgroundColor: "rgba(255, 255, 255, 0.03)" },
  modalOptionText: { fontSize: 16, color: t.textPrimary, fontFamily: 'Lato_400Regular' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)" },
  searchInput: { flex: 1, color: t.textPrimary, fontSize: 15 }
});
