import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import theme from "@/theme/theme";
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, updateProfile, getReligions, getInterests, getPresignedUrl, uploadImageToS3, saveProfilePhoto, deleteProfilePhoto, setPrimaryProfilePhoto } from "@/services/backendService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";

const t = (theme as any).onboarding;
const BG_COLOR = (theme as any).onboarding.background;

type EditItem = {
  id: string;
  field: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  type: "text" | "mcq" | "number" | "multiselect" | "slider";
  options?: { label: string; value: string; category?: string }[];
  placeholder: string;
};

type EditSection = {
  title: string;
  subtitle?: string;
  items: EditItem[];
};

const EDUCATION_OPTIONS = [
  { label: "High School", value: "HIGH_SCHOOL" },
  { label: "Diploma", value: "DIPLOMA" },
  { label: "Bachelors", value: "BACHELORS" },
  { label: "Masters", value: "MASTERS" },
  { label: "PhD", value: "PHD" },
  { label: "Other", value: "OTHER" },
];

const HABIT_OPTIONS = [
  { label: "Never", value: "NEVER" },
  { label: "Occasionally", value: "OCCASIONALLY" },
  { label: "Regularly", value: "REGULARLY" },
];

const DIET_OPTIONS = [
  { label: "Vegetarian", value: "VEGETARIAN" },
  { label: "Non-Vegetarian", value: "NON_VEGETARIAN" },
  { label: "Eggetarian", value: "EGGETARIAN" },
  { label: "Vegan", value: "VEGAN" },
  { label: "Other", value: "OTHER" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [religionOptions,      setReligionOptions]      = useState<{label: string, value: string}[]>([]);
  // Values = religion-specific interests (category ends with _VALUES)
  const [valueOptions,         setValueOptions]         = useState<{label: string, value: string}[]>([]);
  // General Interests = non-_VALUES interests
  const [generalInterestOptions, setGeneralInterestOptions] = useState<{label: string, value: string}[]>([]);
  
  const [selectedItem, setSelectedItem] = useState<EditItem | null>(null);
  const [inputValue,   setInputValue]   = useState("");
  const [sliderValue,  setSliderValue]  = useState(170);
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);

  // ── Helper: map religion name → interest category ─────────────────────────
  const mapReligionToInterestCategory = (religionName: string): string => {
    const r = (religionName || '').toLowerCase();
    if (r.includes('hindu'))    return 'HINDU_VALUES';
    if (r.includes('muslim') || r.includes('islam')) return 'MUSLIM_VALUES';
    if (r.includes('christian')) return 'CHRISTIAN_VALUES';
    if (r.includes('sikh'))     return 'SIKH_VALUES';
    if (r.includes('buddhist') || r.includes('buddh')) return 'BUDDHIST_VALUES';
    return 'GENERAL_VALUES';
  };

  // isMarriage — reads from profile state; note profile is set after fetchData resolves
  const resolvedCategory = (
    profile?.category ||
    ''
  ).toUpperCase();
  const isMarriage = resolvedCategory === 'MARRIAGE';

  // ── Sections — built reactively on profile + option lists ─────────────────
  const sections: EditSection[] = useMemo(() => [
    {
      title: isMarriage ? "Values & Interests" : "Interests",
      subtitle: isMarriage
        ? "Your religious values and general interests."
        : "Get specific about the things you love.",
      items: isMarriage
        ? [
            // Row 1: Religion-specific values (_VALUES category)
            {
              id: "valueIds",
              field: "valueIds",       // virtual field — we merge on save
              label: "Values",
              icon: "star" as const,
              type: "multiselect" as const,
              options: valueOptions,
              placeholder: "Add your values",
            },
            // Row 2: General interests (non-_VALUES)
            {
              id: "interestIds",
              field: "interestIds",
              label: "Interests",
              icon: "hash" as const,
              type: "multiselect" as const,
              options: generalInterestOptions,
              placeholder: "Add interests",
            },
          ]
        : [
            {
              id: "interestIds",
              field: "interestIds",
              label: "Interests",
              icon: "hash" as const,
              type: "multiselect" as const,
              options: generalInterestOptions,
              placeholder: "Add interests",
            },
          ],
    },
    {
      title: "More about you",
      subtitle: "Cover the things most people are curious about.",
      items: [
        { id: "bio",            field: "bio",            label: "Bio",             icon: "align-left",  type: "text",   placeholder: "Write a short bio" },
        { id: "heightCm",       field: "heightCm",       label: "Height",          icon: "bar-chart-2", type: "slider", placeholder: "Set your height" },
        { id: "occupation",     field: "occupation",     label: "Occupation",      icon: "briefcase",  type: "text",   placeholder: "Add your occupation" },
        { id: "educationLevel", field: "educationLevel", label: "Education level", icon: "book-open",  type: "mcq",    options: EDUCATION_OPTIONS, placeholder: "Add education" },
        { id: "drinkingHabit",  field: "drinkingHabit",  label: "Drinking",        icon: "coffee",     type: "mcq",    options: HABIT_OPTIONS, placeholder: "Add" },
        { id: "smokingHabit",   field: "smokingHabit",   label: "Smoking",         icon: "wind",       type: "mcq",    options: HABIT_OPTIONS, placeholder: "Add" },
        { id: "dietPreference", field: "dietPreference", label: "Diet",            icon: "heart",      type: "mcq",    options: DIET_OPTIONS, placeholder: "Add" },
        // Religion: editable only for LOVE
        ...(!isMarriage
          ? [{ id: "religionId", field: "religionId", label: "Religion", icon: "globe" as const, type: "mcq" as const, options: religionOptions, placeholder: "Add" }]
          : []),
      ],
    },
  ], [isMarriage, valueOptions, generalInterestOptions, religionOptions]);

  const fetchData = async () => {
    try {
      const [profileData, relData] = await Promise.all([
        getUserProfile(),
        getReligions(),
      ]);

      const rawUser    = profileData;
      const rawProfile = profileData?.data?.profile || profileData?.profile || null;
      setProfile(rawProfile);

      const cat: string = (
        rawProfile?.category ||
        rawUser?.category ||
        ''
      ).toUpperCase();

      const finalRelData = relData?.data || relData;
      if (Array.isArray(finalRelData)) {
        setReligionOptions(finalRelData.map((r: any) => ({ label: r.name, value: r.id })));
      }

      if (cat === 'MARRIAGE') {
        // Values: religion-specific _VALUES interests
        const religionName   = rawProfile?.religion?.name || '';
        const valuesCategory = mapReligionToInterestCategory(religionName);
        const valData        = await getInterests(valuesCategory);
        const valArray       = Array.isArray(valData?.data || valData) ? (valData?.data || valData) : [];
        setValueOptions(valArray.map((i: any) => ({ label: i.name, value: i.id, category: i.category })));

        // Interests: all non-_VALUES, with category for grouping
        const genData     = await getInterests();
        const genArray    = Array.isArray(genData?.data || genData) ? (genData?.data || genData) : [];
        const genFiltered = (genArray as any[]).filter((i: any) => !String(i.category ?? '').endsWith('_VALUES'));
        setGeneralInterestOptions(genFiltered.map((i: any) => ({ label: i.name, value: i.id, category: i.category })));
      } else {
        // LOVE: general non-_VALUES interests only
        const genData     = await getInterests();
        const genArray    = Array.isArray(genData?.data || genData) ? (genData?.data || genData) : [];
        const genFiltered = (genArray as any[]).filter((i: any) => !String(i.category ?? '').endsWith('_VALUES'));
        setGeneralInterestOptions(genFiltered.map((i: any) => ({ label: i.name, value: i.id, category: i.category })));
        setValueOptions([]);
      }
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handlePickAndUploadPhoto = async () => {
    // 1. Ask for permission and pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSaving(true);
      try {
        // 2. Get Presigned URL
        const presignRes = await getPresignedUrl('jpg');
        const { uploadUrl, publicUrl } = presignRes;

        // 3. Upload to S3
        await uploadImageToS3(uploadUrl, asset.uri, 'image/jpeg');

        // 4. Save to Database
        await saveProfilePhoto(publicUrl, presignRes.fileKey);

        // Refresh profile
        await fetchData();
      } catch (err: any) {
        Alert.alert("Upload Failed", err.message || "Something went wrong uploading the photo.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRemovePhoto = async (photoId: string) => {
    setSaving(true);
    try {
      await deleteProfilePhoto(photoId);
      await fetchData();
    } catch (err: any) {
      Alert.alert("Failed", "Could not remove photo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimaryPhoto = async (photoId: string) => {
    setSaving(true);
    try {
      await setPrimaryProfilePhoto(photoId);
      await fetchData();
    } catch (err: any) {
      Alert.alert("Failed", "Could not set as profile photo.");
    } finally {
      setSaving(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleRowPress = (item: EditItem) => {
    setSelectedItem(item);

    if (item.type === 'multiselect') {
      const allIds: string[] = profile?.interests?.map((i: any) => i.interestId) || [];
      if (item.id === 'valueIds') {
        const valueIdSet = new Set(valueOptions.map((o) => o.value));
        setMultiSelectValues(allIds.filter((id) => valueIdSet.has(id)));
      } else {
        const genIdSet = new Set(generalInterestOptions.map((o) => o.value));
        setMultiSelectValues(allIds.filter((id) => genIdSet.has(id)));
      }
    } else if (item.type === 'slider') {
      setSliderValue(Number(profile?.[item.field] ?? 170));
    } else {
      const currentVal = profile?.[item.field];
      setInputValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
    }
  };


  const toggleMultiSelect = (val: string) => {
    setMultiSelectValues((prev) => {
      if (prev.includes(val)) {
        return prev.filter((v) => v !== val);
      }
      if (prev.length >= 10) {
        Alert.alert('Selection Limit', 'You can only select up to 10 options.');
        return prev;
      }
      return [...prev, val];
    });
  };

  const saveMultiSelect = async () => {
    if (!selectedItem || !profile) return;
    setSaving(true);
    try {
      const allCurrentIds: string[] = profile?.interests?.map((i: any) => i.interestId) || [];
      let finalIds: string[];
      if (selectedItem.id === 'valueIds') {
        const genIds = new Set(generalInterestOptions.map((o) => o.value));
        const existingGeneral = allCurrentIds.filter((id) => genIds.has(id));
        finalIds = [...new Set([...multiSelectValues, ...existingGeneral])];
      } else {
        const valIds = new Set(valueOptions.map((o) => o.value));
        const existingValues = allCurrentIds.filter((id) => valIds.has(id));
        finalIds = [...new Set([...multiSelectValues, ...existingValues])];
      }
      await updateProfile({ interestIds: finalIds });
      const allOptions = [...valueOptions, ...generalInterestOptions];
      const newInterests = finalIds.map((id) => {
        const opt = allOptions.find((o) => o.value === id);
        return { interestId: id, interest: { id, name: opt?.label ?? '' } };
      });
      setProfile((prev: any) => ({ ...prev, interests: newInterests }));
    } catch (err) {
      console.error('saveMultiSelect error:', err);
    } finally {
      setSaving(false);
      setSelectedItem(null);
    }
  };

  const saveOption = async (val: string) => {
    if (!selectedItem || !profile) return;
    
    setSaving(true);
    try {
      let finalVal: any = val;
      if (selectedItem.type === 'number') {
        finalVal = parseInt(val, 10);
        if (isNaN(finalVal)) finalVal = null;
      }

      // Update backend
      await updateProfile({ [selectedItem.field]: finalVal });
      
      // Update local state instantly
      setProfile((prev: any) => ({
        ...prev,
        [selectedItem.field]: finalVal
      }));
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
      setSelectedItem(null);
    }
  };

  const getDisplayValue = (item: EditItem) => {
    if (item.type === 'multiselect') {
      const allIds: string[] = profile?.interests?.map((i: any) => i.interestId) || [];
      if (allIds.length === 0) return null;

      if (item.id === 'valueIds') {
        const valueIdSet = new Set(valueOptions.map((o) => o.value));
        const count = allIds.filter((id) => valueIdSet.has(id)).length;
        return count > 0 ? `${count} selected` : null;
      } else {
        const genIdSet = new Set(generalInterestOptions.map((o) => o.value));
        const count = allIds.filter((id) => genIdSet.has(id)).length;
        return count > 0 ? `${count} selected` : null;
      }
    }

    let val = profile?.[item.field];
    if (!val) return null;

    if (item.type === 'mcq' && item.options) {
      const opt = item.options.find((o) => o.value === val);
      return opt ? opt.label : val;
    }

    if (item.field === 'heightCm') {
      const cm = Number(val);
      const totalInches = Math.round(cm / 2.54);
      const feet  = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}'${inches}" (${cm} cm)`;
    }

    return val;
  };


  const pct = profile?.completionPercentage || 0;
  const categoryName = profile?.category === 'LOVE' ? 'Love Profile' : profile?.category === 'MARRIAGE' ? 'Marriage Profile' : 'Profile';
  const hasCompletedQuiz = !!(profile?.loveProfile || profile?.marriageProfile);
  const hasCompletedInsights = profile?.userAnswers?.some((a: any) => a.question?.category === 'INSIGHT');
  const hasCompletedSync = profile?.userAnswers?.some((a: any) => a.question?.category === 'SYNCHRONIZATION');

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      
      <View style={{ backgroundColor: BG_COLOR, paddingTop: insets.top }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="chevron-left" size={28} color={t.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={styles.backBtn} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Strength */}
        <View style={styles.strengthSection}>
          <Text style={styles.sectionHeaderTitle}>Profile strength</Text>
          <TouchableOpacity style={styles.strengthCard} activeOpacity={0.8}>
            <Text style={styles.strengthPct}>{pct}% complete</Text>
            <Feather name="chevron-right" size={20} color={t.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Love Quizzes - only show for LOVE category */}
        {profile?.category === 'LOVE' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeaderTitle}>Love Quizzes</Text>
            
            {/* Insight Quiz */}
            <TouchableOpacity 
              style={{
                marginTop: 12,
                backgroundColor: t.primary + '10',
                borderColor: t.primary + '40',
                borderWidth: 1,
                padding: 16,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              activeOpacity={0.8}
              onPress={() => router.push('/(onboarding)/quiz/insight')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={{ 
                  backgroundColor: t.primary, 
                  width: 48, height: 48, 
                  borderRadius: 24, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: t.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <Feather name="search" size={24} color="#FFF" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: t.textPrimary, fontSize: 17, fontFamily: "Lato_700Bold", marginBottom: 4 }}>
                    {hasCompletedInsights ? "Retake Insight Quiz" : "Complete Insight Quiz"}
                  </Text>
                  <Text style={{ color: t.textSecondary, fontSize: 14, fontFamily: "Lato_400Regular", lineHeight: 20 }}>
                    {hasCompletedInsights 
                      ? "Update your deep psychological profile."
                      : <Text>Unlocks <Text style={{ color: t.primary, fontFamily: "Lato_700Bold" }}>35%</Text> of your profile score.</Text>
                    }
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={24} color={t.primary} />
            </TouchableOpacity>

            {/* Sync Quiz */}
            <TouchableOpacity 
              style={{
                marginTop: 12,
                backgroundColor: t.primary + '10',
                borderColor: t.primary + '40',
                borderWidth: 1,
                padding: 16,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              activeOpacity={0.8}
              onPress={() => router.push('/(onboarding)/quiz/sync')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={{ 
                  backgroundColor: '#FF2D55', 
                  width: 48, height: 48, 
                  borderRadius: 24, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: '#FF2D55',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <Feather name="heart" size={24} color="#FFF" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: t.textPrimary, fontSize: 17, fontFamily: "Lato_700Bold", marginBottom: 4 }}>
                    {hasCompletedSync ? "Retake Synch Quiz" : "Complete Synch Quiz"}
                  </Text>
                  <Text style={{ color: t.textSecondary, fontSize: 14, fontFamily: "Lato_400Regular", lineHeight: 20 }}>
                    {hasCompletedSync 
                      ? "Update your compatibility metrics."
                      : <Text>Unlocks <Text style={{ color: '#FF2D55', fontFamily: "Lato_700Bold" }}>{profile?.gender === 'FEMALE' ? '70%' : '35%'}</Text> of your profile score.</Text>
                    }
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={24} color={'#FF2D55'} />
            </TouchableOpacity>
          </View>
        )}

        {/* Photos Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Photos and videos</Text>
          <Text style={styles.sectionSubtitle}>Pick some that show the true you.</Text>
          
          <View style={styles.photoGrid}>
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const photo = profile?.photos && profile.photos[idx];
              return (
                <View key={idx} style={styles.photoBox}>
                  {photo ? (
                    <View style={styles.photoPlaceholderFilled}>
                       <Image source={{ uri: photo.cdnUrl }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                       {/* Star badge — set as primary */}
                       <TouchableOpacity
                         style={[styles.photoStarBtn, photo.isPrimary && { backgroundColor: '#FBBF24' }]}
                         onPress={() => handleSetPrimaryPhoto(photo.id)}
                         disabled={saving}
                       >
                         <Feather name="star" size={11} color={photo.isPrimary ? '#1E1410' : t.textPrimary} />
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => handleRemovePhoto(photo.id)} disabled={saving}>
                         <Feather name="x" size={12} color={t.textPrimary} />
                       </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.photoPlaceholderEmpty} activeOpacity={0.7} onPress={handlePickAndUploadPhoto} disabled={saving}>
                      {saving && idx === (profile?.photos?.length || 0) ? (
                        <ActivityIndicator size="small" color={t.primary} />
                      ) : (
                        <Feather name="plus" size={28} color={t.textSecondary} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Dynamic Fields */}
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
            </View>
            {section.subtitle && <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>}
            
            <View style={styles.listContainer}>
              {section.items.map((item, itemIdx) => {
                const displayVal = getDisplayValue(item);
                return (
                  <TouchableOpacity key={itemIdx} style={styles.row} activeOpacity={0.7} onPress={() => handleRowPress(item)}>
                    <View style={styles.rowLeft}>
                      <Feather name={item.icon} size={20} color={t.textSecondary} style={styles.rowIcon} />
                      <Text style={styles.rowText}>{item.label}</Text>
                    </View>
                    <View style={styles.rowRight}>
                      {displayVal ? (
                        <Text style={styles.rowValue} numberOfLines={1}>{String(displayVal)}</Text>
                      ) : (
                        <Text style={styles.rowPlaceholder}>{item.placeholder}</Text>
                      )}
                      <Feather name="chevron-right" size={20} color={t.textSecondary} style={styles.chevron} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Popup Modal */}
      <Modal
        visible={!!selectedItem}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !saving && setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.label}</Text>
              <TouchableOpacity onPress={() => !saving && setSelectedItem(null)}>
                <Feather name="x" size={24} color={t.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedItem?.type === "mcq" && selectedItem.options ? (
              <ScrollView style={styles.mcqContainer} showsVerticalScrollIndicator={false}>
                {selectedItem.options.map((opt, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={[
                      styles.mcqOption, 
                      inputValue === opt.value && { borderColor: t.primary, backgroundColor: t.primary + "15" }
                    ]} 
                    activeOpacity={0.8} 
                    onPress={() => saveOption(opt.value)}
                    disabled={saving}
                  >
                    <Text style={[styles.mcqOptionText, inputValue === opt.value && { color: t.primary, fontFamily: "Lato_700Bold" }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : selectedItem?.type === "multiselect" ? (
              <View>
                {!selectedItem.options || selectedItem.options.length === 0 ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
                    <Feather name="inbox" size={48} color={t.textSecondary + '50'} style={{ marginBottom: 16 }} />
                    <Text style={{ color: t.textPrimary, fontSize: 18, fontFamily: 'Lato_700Bold', marginBottom: 8 }}>
                      No Options Loaded
                    </Text>
                    <Text style={{ color: t.textSecondary, fontSize: 13, fontFamily: 'Lato_400Regular', textAlign: 'center', lineHeight: 20 }}>
                      Could not load {selectedItem.label.toLowerCase()} options.
                    </Text>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      style={{ maxHeight: 420 }}
                      showsVerticalScrollIndicator={true}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={{ paddingBottom: 16 }}
                    >
                      {(() => {
                        // Group options by category
                        const groups: Record<string, typeof selectedItem.options> = {};
                        selectedItem.options.forEach(opt => {
                          const rawCat = opt.category ? opt.category.replace('_VALUES', '') : 'General';
                          // Title Case the category (e.g. ARTS_AND_ENTERTAINMENT -> Arts And Entertainment)
                          const cat = rawCat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                          if (!groups[cat]) groups[cat] = [];
                          groups[cat].push(opt);
                        });

                        return Object.entries(groups).map(([catName, options]) => (
                          <View key={catName} style={{ marginBottom: 20 }}>
                            {/* Don't show header if everything is just 'General' */}
                            {(catName !== 'General' || Object.keys(groups).length > 1) && (
                              <Text style={{ color: t.textPrimary, fontFamily: 'Lato_700Bold', fontSize: 16, marginBottom: 12, opacity: 0.9 }}>
                                {catName}
                              </Text>
                            )}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                              {options.map((opt) => {
                                const isSelected = multiSelectValues.includes(opt.value);
                                return (
                                  <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                      styles.chip,
                                      isSelected && styles.chipSelected
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => toggleMultiSelect(opt.value)}
                                    disabled={saving}
                                  >
                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                      {opt.label}
                                    </Text>
                                    {isSelected && <Feather name="check" size={14} color="#1E1410" style={{ marginLeft: 4 }} />}
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        ));
                      })()}
                    </ScrollView>
                    <TouchableOpacity
                      style={[styles.saveBtn, { marginTop: 8 }]}
                      activeOpacity={0.8}
                      onPress={saveMultiSelect}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#1E1410" />
                      ) : (
                        <Text style={styles.saveBtnText}>Save {selectedItem.label}</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : selectedItem?.type === 'slider' ? (
              // ── Height Slider ───────────────────────────────────
              <View style={styles.textInputContainer}>
                <Text style={{ color: t.textPrimary, fontSize: 32, fontFamily: 'Lato_700Bold', textAlign: 'center', marginBottom: 8 }}>
                  {(() => {
                    const totalInches = Math.round(sliderValue / 2.54);
                    const ft = Math.floor(totalInches / 12);
                    const inc = totalInches % 12;
                    return `${ft}'${inc}"  (${sliderValue} cm)`;
                  })()}
                </Text>
                <Slider
                  style={{ width: '100%', height: 44 }}
                  minimumValue={140}   // ~4'7"
                  maximumValue={213}   // ~7'0"
                  step={1}
                  value={sliderValue}
                  onValueChange={(v) => setSliderValue(Math.round(v))}
                  minimumTrackTintColor={t.primary}
                  maximumTrackTintColor={t.border}
                  thumbTintColor={t.primary}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 20 }}>
                  <Text style={{ color: t.textSecondary, fontSize: 12 }}>4'7"</Text>
                  <Text style={{ color: t.textSecondary, fontSize: 12 }}>7'0"</Text>
                </View>
                <TouchableOpacity
                  style={styles.saveBtn}
                  activeOpacity={0.8}
                  onPress={() => saveOption(String(sliderValue))}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color="#1E1410" />
                    : <Text style={styles.saveBtnText}>Save Height</Text>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.modalInput}
                  placeholder={selectedItem?.placeholder || "Type your answer..."}
                  placeholderTextColor={t.textSecondary + "80"}
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType={selectedItem?.type === 'number' ? 'numeric' : 'default'}
                  autoFocus
                  multiline={selectedItem?.id === 'bio'}
                  numberOfLines={selectedItem?.id === 'bio' ? 4 : 1}
                />
                <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={() => saveOption(inputValue)} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#1E1410" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Lato_700Bold",
    color: t.textPrimary,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  strengthSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  strengthCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  strengthPct: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
    color: t.textPrimary,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontFamily: "Lato_700Bold",
    color: t.textPrimary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    color: t.textSecondary,
    marginBottom: 16,
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  photoBox: {
    width: "31%",
    aspectRatio: 3 / 4,
  },
  photoPlaceholderEmpty: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: t.border,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderFilled: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoRemoveBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: t.secondary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.border,
  },
  photoStarBtn: {
    position: "absolute",
    bottom: -6,
    left: -6,
    backgroundColor: t.secondary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.border,
  },
  listContainer: {
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  rowText: {
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    color: t.textPrimary,
  },
  rowPlaceholder: {
    fontSize: 15,
    fontFamily: "Lato_400Regular",
    color: t.textSecondary,
    opacity: 0.8,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: "Lato_400Regular",
    color: t.textPrimary,
    maxWidth: "80%",
  },
  chevron: {
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end", // Bottom sheet style
  },
  modalContent: {
    backgroundColor: t.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderColor: t.border,
    // Must have a bounded height so flex:1 children can expand
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Lato_700Bold",
    color: t.textPrimary,
  },
  mcqContainer: {
    maxHeight: 420,
  },
  mcqOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  mcqOptionText: {
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    color: t.textPrimary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  chipSelected: {
    backgroundColor: t.primary,
    borderColor: t.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    color: t.textPrimary,
  },
  chipTextSelected: {
    fontFamily: "Lato_700Bold",
    color: "#1E1410",
  },
  textInputContainer: {
    gap: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    color: t.textPrimary,
    backgroundColor: "rgba(255,255,255,0.02)",
    minHeight: 56,
  },
  saveBtn: {
    backgroundColor: t.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
    color: "#1E1410",
  },
});
