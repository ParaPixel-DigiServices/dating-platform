import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useProfileCompletionStore } from "@/hooks/useProfileCompletionStore";
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, getSparkQuestions, getPresignedUrl, uploadImageToS3, saveProfilePhoto, setPrimaryProfilePhoto } from "@/services/backendService";
import theme from "@/theme/theme";

const { width, height } = Dimensions.get("window");
const t = (theme as any).onboarding;


const HERO_HEIGHT = height * 0.4;
const AVATAR_SIZE = 110;
const MALE_LOGO = require("@/assets/images/main_profile_logo_male.png");
const FEMALE_LOGO = require("@/assets/images/main_profile_logo_female.png");
const HERO_BG = require("@/assets/images/main-bg.png");

// ─── Reusable Components ────────────────────────────────────────────────────────────

function InfoChip({ icon, label, value, onPress, t }: { icon: string; label: string; value: string | null; onPress?: () => void; t: any }) {
  if (!value) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flexGrow: 1 }}>
        <View style={[styles.infoChip, { backgroundColor: "transparent", borderColor: t.primary + "40", borderStyle: "dashed" }]}>
          <Feather name="plus" size={14} color={t.primary} style={{ marginRight: 8, marginTop: -12 }} />
          <View>
            <Text style={[styles.infoChipLabel, { color: t.textSecondary }]}>Add {label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.infoChip, { backgroundColor: t.primary + "12", borderColor: t.primary + "30", flexGrow: 1 }]}>
      <Feather name="icon" size={14} color={t.primary} style={{ marginRight: 8, marginTop: -12 }} />
      <View>
        <Text style={[styles.infoChipLabel, { color: t.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoChipValue, { color: t.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title, t }: { title: string; t: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: t.primary }]}>{title}</Text>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();

  // Basic info from AuthStore/OnboardingStore as fallback, but we will fetch real data
  const { user } = useAuthStore();
  const category    = useOnboardingStore((s) => s.category) ?? "Love";
  
  const [profileData, setProfileData] = React.useState<any>(null);
  const [sparkQuestions, setSparkQuestions] = React.useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        try {
          const data = await getUserProfile();
          setProfileData(data);
          
          if (data?.data?.profile?.category === 'LOVE' || data?.profile?.category === 'LOVE') {
            const sparkData = await getSparkQuestions();
            setSparkQuestions(sparkData?.data || sparkData || []);
          }
        } catch (err) {
          console.error("Failed to fetch profile", err);
        }
      };
      fetchProfile();
    }, [])
  );

  const profile = profileData?.data?.profile;

  console.log(profile);
  console.log("profile + ", profileData)
  const isComplete = profile?.isCompleted || false;
  const pct = profile?.completionPercentage || 0;

  const age = profile?.dateOfBirth
    ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()
    : null;

  const displayName = profile
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.displayName ?? "Your Name";

  const location   = profile?.city ? `${profile.city}${profile.state ? `, ${profile.state}` : ''}` : null;
  const bio        = profile?.bio || null;
  
  // Category specific fields
  const loveProfile = profile?.loveProfile;
  const marriageProfile = profile?.marriageProfile;
  
  const gender     = profile?.gender ? profile.gender.toLowerCase() : "Unspecified";
  const religion   = profile?.religion?.name || null;
  const preferences = profile?.partnerPreference || {};
  
  const kids       = marriageProfile?.hasChildren ? "Has kids" : loveProfile?.wantsChildren ? "Wants kids" : null;
  const heightCm   = profile?.heightCm ? `${profile.heightCm} cm` : null;
  const education  = profile?.educationLevel ? profile.educationLevel.replace('_', ' ').toLowerCase() : null;
  const occupation = profile?.occupation || null;
  const drinking   = profile?.drinkingHabit ? profile.drinkingHabit.toLowerCase() : null;
  const smoking    = profile?.smokingHabit ? profile.smokingHabit.toLowerCase() : null;
  const diet       = profile?.dietPreference ? profile.dietPreference.toLowerCase() : null;

  const onboardingDone = user?.onboardingStep === 'CATEGORY_DONE' || user?.onboardingStep === 'COMPLETED';
  const canEdit = !isComplete && !onboardingDone;

  const navigateToEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  const navigateToEdit = () => {
    if (!onboardingDone) {
      router.push("/(onboarding)/profile-completion" as any);
    } else {
      navigateToEditProfile();
    }
  };

  // ── Tabs Setup ──
  let tabs = ["BIO", "PHOTOS", "IDENTITY", "LOOKING FOR"];
  if (profile?.category === 'LOVE') {
    tabs.splice(1, 0, "SPARK");
  } else if (profile?.category === 'MARRIAGE') {
    tabs = ["BIO", "FAMILY", "PREFERENCES", "PHOTOS"];
  }
  const [activeTab, setActiveTab] = useState<string>("BIO");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Primary photo: prefer isPrimary, then fall back to first photo
  const primaryPhoto = profile?.photos?.find((p: any) => p.isPrimary) ?? profile?.photos?.[0] ?? null;
  const avatarSource = primaryPhoto
    ? { uri: primaryPhoto.cdnUrl }
    : gender === 'female' ? FEMALE_LOGO : MALE_LOGO;

  // Extract photo ID robustly — backend double-wraps so shape can be
  // { data: { id } } or just { id }
  const extractPhotoId = (saved: any): string | undefined =>
    saved?.data?.id ?? saved?.id;

  const handleSetExistingAsPrimary = async (photoId: string) => {
    setUploadingAvatar(true);
    setShowAvatarPicker(false);
    try {
      await setPrimaryProfilePhoto(photoId);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (err: any) {
      Alert.alert('Error', 'Could not set profile photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadNewAvatar = async () => {
    setShowAvatarPicker(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setUploadingAvatar(true);
    try {
      const presignRes = await getPresignedUrl('jpg');
      await uploadImageToS3(presignRes.uploadUrl, asset.uri, 'image/jpeg');
      const saved = await saveProfilePhoto(presignRes.publicUrl, presignRes.fileKey);
      const photoId = extractPhotoId(saved);
      if (!photoId) throw new Error('Could not get photo ID from server');
      await setPrimaryProfilePhoto(photoId);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      Alert.alert('Upload Failed', err.message || 'Something went wrong.');
    } finally {
      setUploadingAvatar(false);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* ── HERO SECTION ── */}
        <View style={{ width: "100%", height: HERO_HEIGHT }}>
          <Image source={HERO_BG} style={{ width: "100%", height: "100%" }} />
          <LinearGradient
            colors={["transparent", "rgba(13, 10, 7, 0.4)", t.background]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.headerSafe}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/settings" as any)}>
                <Feather name="settings" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="images-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ── PROFILE CARD ── */}
        <View style={styles.cardWrapper}>
          <View style={[styles.profileCard, { backgroundColor: t.secondary }]}>
            
            {/* Overlapping Avatar — tappable to update profile picture */}
            <TouchableOpacity
              style={[styles.avatarRing, { borderColor: t.primary, backgroundColor: t.background }]}
              onPress={() => setShowAvatarPicker(true)}
              activeOpacity={0.85}
              disabled={uploadingAvatar}
            >
              <Image
                source={avatarSource}
                style={styles.avatarImage}
              />
              {/* Camera overlay */}
              <View style={{
                position: 'absolute', bottom: 0, right: 0,
                backgroundColor: t.primary, borderRadius: 14,
                width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: t.background,
              }}>
                {uploadingAvatar
                  ? <React.Fragment><Feather name="loader" size={13} color="#1E1410" /></React.Fragment>
                  : <Feather name="camera" size={13} color="#1E1410" />
                }
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editBtn} onPress={navigateToEdit} activeOpacity={0.7}>
              <Feather name="edit-2" size={16} color={t.textSecondary} />
            </TouchableOpacity>

            {/* Basic Info */}
            <Text style={[styles.nameText, { color: t.textPrimary }]}>{displayName}</Text>
            <Text style={[styles.subtitleText, { color: t.textSecondary }]}>
              {gender ? gender.toLowerCase() : "gender"} • {age ? `${age} years` : "age"}
            </Text>
            {location && (
              <Text style={[styles.locationText, { color: t.textSecondary }]}>
                <Feather name="map-pin" size={12} /> {location}
              </Text>
            )}

            {/* Completion Section */}
            <TouchableOpacity
              onPress={navigateToEdit}
              style={[styles.meterBlock, isComplete && { opacity: 0.9 }]}
              activeOpacity={0.85}
            >
              <View style={[StyleSheet.absoluteFill, { backgroundColor: t.primary, width: `${pct}%`, opacity: 0.85 }]} />
              <View style={styles.meterContent}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[styles.meterTitle, { color: t.textPrimary }]}>
                    {isComplete ? "PROFILE COMPLETED" : "COMPLETE YOUR PROFILE"}
                  </Text>
                  {!isComplete && (
                    <Feather name="chevron-right" size={12} color={t.textPrimary} style={{ marginLeft: 6, opacity: 0.8 }} />
                  )}
                </View>
                <View style={[styles.meterPctBadge, isComplete && { backgroundColor: "transparent", paddingHorizontal: 0 }]}>
                  <Text style={[styles.meterPctText, { color: t.textPrimary }]}>{pct}%</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* ── TABS ── */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={styles.tabBtn}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.tabText, 
                    { color: isActive ? t.textPrimary : t.textSecondary },
                    isActive && { fontFamily: "Lato_700Bold" }
                  ]}>
                    {tab}
                  </Text>
                  {isActive && <View style={[styles.activeIndicator, { backgroundColor: t.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── TAB CONTENT ── */}
        <View style={styles.tabContent}>
          {activeTab === "BIO" && (
            <View style={styles.contentSection}>
              {bio ? (
                <Text style={[styles.bioText, { color: t.textSecondary }]}>"{bio}"</Text>
              ) : (
                <TouchableOpacity onPress={navigateToEditProfile} activeOpacity={0.8} style={{ padding: 16, borderRadius: 16, borderWidth: 1, borderColor: t.primary + "40", borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: "transparent" }}>
                  <Feather name="plus" size={20} color={t.primary} style={{ marginBottom: 8 }} />
                  <Text style={{ color: t.primary, fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 16 }}>Add a Bio</Text>
                </TouchableOpacity>
              )}
              
              <View style={{ marginTop: 24, gap: 12 }}>
                <SectionTitle title="Interests" t={t} />
                <View style={styles.chipsRow}>
                  {(() => {
                    const displayInterests = profile?.interests?.filter(
                      (ij: any) => !String(ij?.interest?.category || '').endsWith('_VALUES')
                    ) || [];
                    
                    return displayInterests.length > 0 ? (
                      displayInterests.map((interestJoin: any, i: number) => (
                        <View key={i} style={[styles.chip, { backgroundColor: t.primary + "15", borderColor: t.primary + "30" }]}>
                          <Text style={[styles.chipText, { color: t.textPrimary }]}>{interestJoin.interest.name}</Text>
                        </View>
                      ))
                    ) : (
                      <TouchableOpacity onPress={navigateToEditProfile} activeOpacity={0.8} style={[styles.chip, { backgroundColor: "transparent", borderColor: t.primary + "40", borderStyle: "dashed" }]}>
                        <Feather name="plus" size={14} color={t.primary} style={{ marginRight: 6 }} />
                      </TouchableOpacity>
                    );
                  })()}
                </View>

                <SectionTitle title="Background" t={t} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  <InfoChip icon="maximize-2" label="Height" value={heightCm} onPress={navigateToEditProfile} t={t} />
                  <InfoChip icon="book-open" label="Education" value={education} onPress={navigateToEditProfile} t={t} />
                  <InfoChip icon="briefcase" label="Occupation" value={occupation} onPress={navigateToEditProfile} t={t} />
                  <InfoChip icon="globe" label="Religion" value={religion} onPress={navigateToEditProfile} t={t} />
                </View>

                <SectionTitle title="Lifestyle" t={t} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  <InfoChip icon="coffee" label="Drinking" value={drinking} onPress={navigateToEditProfile} t={t} />
                  <InfoChip icon="wind" label="Smoking" value={smoking} onPress={navigateToEditProfile} t={t} />
                  <InfoChip icon="heart" label="Diet" value={diet} onPress={navigateToEditProfile} t={t} />
                </View>
              </View>
            </View>
          )}

          {activeTab === "PHOTOS" && (() => {
            const photos: { id: string; cdnUrl: string }[] = profile?.photos || [];
            return (
              <View style={[styles.contentSection, { marginTop: 16 }]}>
                {photos.length > 0 ? (
                  <>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {photos.map((photo, idx) => (
                        <View key={photo.id || idx} style={{ width: '31%', aspectRatio: 3/4, borderRadius: 12, overflow: 'hidden', backgroundColor: t.secondary }}>
                          <Image
                            source={{ uri: photo.cdnUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity style={[styles.addPhotoBtn, { backgroundColor: t.primary, marginTop: 20 }]} activeOpacity={0.8} onPress={navigateToEditProfile}>
                      <Feather name="edit-2" size={16} color="#1E1410" style={{ marginRight: 8 }} />
                      <Text style={{ color: "#1E1410", fontFamily: "PlayfairDisplay_700Bold", fontSize: 16 }}>
                        Manage Photos
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={{ alignItems: 'center', marginTop: 32 }}>
                    <View style={[styles.photoPlaceholder, { borderColor: t.border, backgroundColor: "rgba(255,255,255,0.02)" }]}>
                      <Feather name="image" size={48} color={t.textSecondary + "50"} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: t.textPrimary, marginTop: 20 }]}>
                      No photos added
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: t.textSecondary, marginTop: 8 }]}>
                      Add some photos to show your personality and get more matches.
                    </Text>
                    <TouchableOpacity style={[styles.addPhotoBtn, { backgroundColor: t.primary }]} activeOpacity={0.8} onPress={navigateToEditProfile}>
                      <Feather name="plus" size={18} color="#1E1410" style={{ marginRight: 8 }} />
                      <Text style={{ color: "#1E1410", fontFamily: "PlayfairDisplay_700Bold", fontSize: 16 }}>
                        Add Photos
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })()}

          {activeTab === "SPARK" && (
            <View style={styles.contentSection}>
              <SectionTitle title="Spark Questions" t={t} />
              
              {sparkQuestions.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 32, paddingHorizontal: 20 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Feather name="zap" size={32} color={t.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: t.textPrimary, textAlign: 'center' }]}>
                    Fill your Spark!
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: t.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }]}>
                    Add up to 3 questions to your profile that guys must answer when they send you a like. It's the best way to start a meaningful conversation.
                  </Text>
                  <TouchableOpacity 
                    style={{ marginTop: 24, backgroundColor: t.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    activeOpacity={0.8}
                    onPress={() => router.push("/profile/edit-spark")}
                  >
                    <Feather name="plus" size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 16 }}>Add Spark Questions</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: 8 }}>
                  {sparkQuestions.map((q: any, idx: number) => (
                    <View key={idx} style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: t.border }}>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Text style={{ color: t.primary, fontFamily: "Lato_700Bold", fontSize: 16 }}>Q{idx + 1}.</Text>
                        <Text style={{ color: t.textPrimary, fontFamily: "Lato_400Regular", fontSize: 16, flex: 1, lineHeight: 22 }}>
                          {q.text}
                        </Text>
                      </View>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={{ marginTop: 16, backgroundColor: t.primary + '15', borderWidth: 1, borderColor: t.primary + '50', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    activeOpacity={0.8}
                    onPress={() => router.push("/profile/edit-spark")}
                  >
                    <Feather name="edit-2" size={16} color={t.primary} />
                    <Text style={{ color: t.primary, fontFamily: "Lato_700Bold", fontSize: 16 }}>Edit Questions</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === "IDENTITY" && (
            <View style={styles.contentSection}>
              <View style={[styles.verificationBadge, { backgroundColor: t.primary + "10", borderColor: t.primary + "30" }]}>
                <Feather name="shield" size={18} color={t.primary} style={{ marginRight: 10 }} />
                <Text style={[styles.verificationText, { color: t.textPrimary }]}>Verification Pending</Text>
              </View>

              <View style={{ marginTop: 24, gap: 12 }}>
                <SectionTitle title="Verification" t={t} />
                <InfoChip icon="check-circle" label="Status" value="Pending Approval" t={t} />
              </View>
            </View>
          )}

          {activeTab === "FAMILY" && (
            <View style={styles.contentSection}>
              <View style={{ backgroundColor: t.primary + "0A", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: t.primary + "20" }}>
                <SectionTitle title="Family Background" t={t} />
                <View style={{ marginTop: 12, gap: 12 }}>
                  <InfoChip icon="users" label="Type" value={marriageProfile?.familyType?.replace(/_/g, ' ') || 'Not specified'} t={t} />
                  <InfoChip icon="home" label="Living Status" value={marriageProfile?.familyLivingStatus?.replace(/_/g, ' ') || 'Not specified'} t={t} />
                  <InfoChip icon="briefcase" label="Income" value={marriageProfile?.familyIncome?.replace(/_/g, ' ') || 'Not specified'} t={t} />
                </View>
              </View>

              <View style={{ backgroundColor: t.primary + "0A", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: t.primary + "20" }}>
                <SectionTitle title="Parents" t={t} />
                <View style={{ marginTop: 12, gap: 12 }}>
                  <InfoChip icon="user" label="Father" value={marriageProfile?.fatherName || 'Not specified'} t={t} />
                  <InfoChip icon="user" label="Mother" value={marriageProfile?.motherName || 'Not specified'} t={t} />
                </View>
              </View>

              <View style={{ backgroundColor: t.primary + "0A", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: t.primary + "20" }}>
                <SectionTitle title="Siblings" t={t} />
                <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <InfoChip icon="users" label="Brothers" value={marriageProfile?.brotherCount?.toString() || '0'} t={t} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InfoChip icon="users" label="Sisters" value={marriageProfile?.sisterCount?.toString() || '0'} t={t} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {(activeTab === "LOOKING FOR" || activeTab === "PREFERENCES") && (
            <View style={styles.contentSection}>
              <SectionTitle title={activeTab === "PREFERENCES" ? "Partner Preferences" : "Preferences"} t={t} />
              <Text style={[styles.emptyText, { color: t.textSecondary}]}>Not specified yet.</Text>
              
              <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SectionTitle title="Matching Criteria" t={t} />
                  {Object.keys(preferences).length > 0 && (
                    <TouchableOpacity onPress={() => router.push("/profile/preferences" as any)}>
                      <Text style={{ color: t.primary, fontFamily: 'Lato_700Bold', fontSize: 13 }}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {Object.keys(preferences).length > 0 ? (
                  <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {Object.keys(preferences).map((key) => {
                      const val = preferences[key];
                      if (!val || key === 'id' || key === 'profileId' || key === 'createdAt' || key === 'updatedAt') return null;
                      const displayVal = Array.isArray(val) ? val.join(", ") : String(val);
                      return (
                        <View key={key} style={{ backgroundColor: t.primary + "15", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.primary + "30" }}>
                          <Text style={{ color: t.textPrimary, fontFamily: "Lato_400Regular", fontSize: 13 }}>
                            <Text style={{ fontFamily: "Lato_700Bold", color: t.primary }}>{key}: </Text>
                            {displayVal}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => router.push("/profile/preferences" as any)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 16,
                      backgroundColor: t.primary + "10",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: t.primary + "30",
                      marginTop: 8
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Feather name="sliders" size={18} color={t.primary} style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 15, fontFamily: "Lato_700Bold", color: t.textPrimary }}>
                        Set Preferences
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={t.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          </View>

      </ScrollView>

      {/* ── AVATAR PICKER MODAL ── */}
      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          activeOpacity={1}
          onPress={() => setShowAvatarPicker(false)}
        />
        <View style={{
          backgroundColor: t.secondary,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: 40,
        }}>
          <Text style={{ color: t.textPrimary, fontFamily: 'Lato_700Bold', fontSize: 18, marginBottom: 6 }}>
            Profile Photo
          </Text>
          <Text style={{ color: t.textSecondary, fontFamily: 'Lato_400Regular', fontSize: 13, marginBottom: 20 }}>
            {profile?.photos?.length ? 'Tap a photo to set it as your profile picture, or upload a new one.' : 'Upload a new photo to set as your profile picture.'}
          </Text>

          {/* Existing photos grid */}
          {profile?.photos?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {profile.photos.map((photo: any) => {
                const isCurrent = primaryPhoto?.id === photo.id;
                return (
                  <TouchableOpacity
                    key={photo.id}
                    onPress={() => handleSetExistingAsPrimary(photo.id)}
                    activeOpacity={0.8}
                    style={{
                      width: 90, height: 110, borderRadius: 12,
                      borderWidth: isCurrent ? 2.5 : 1,
                      borderColor: isCurrent ? t.primary : t.border,
                      overflow: 'hidden',
                    }}
                  >
                    <Image source={{ uri: photo.cdnUrl }} style={{ width: '100%', height: '100%' }} />
                    {isCurrent && (
                      <View style={{
                        position: 'absolute', bottom: 4, right: 4,
                        backgroundColor: t.primary, borderRadius: 10,
                        paddingHorizontal: 6, paddingVertical: 2,
                      }}>
                        <Text style={{ color: '#1E1410', fontSize: 10, fontFamily: 'Lato_700Bold' }}>✓ Current</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Upload new */}
          <TouchableOpacity
            onPress={handleUploadNewAvatar}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: t.primary, borderRadius: 14,
              paddingVertical: 14, gap: 8,
            }}
          >
            <Feather name="upload" size={18} color="#1E1410" />
            <Text style={{ color: '#1E1410', fontFamily: 'Lato_700Bold', fontSize: 15 }}>Upload New Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAvatarPicker(false)}
            style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}
          >
            <Text style={{ color: t.textSecondary, fontFamily: 'Lato_400Regular', fontSize: 14 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  
  /* OVERLAPPING CARD */
  cardWrapper: {
    alignItems: "center",
    marginTop: -height * 0.18,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  profileCard: {
    width: "100%",
    borderRadius: 24,
    paddingBottom: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: t.border,
  },
  avatarRing: {
    marginTop: -AVATAR_SIZE / 2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    padding: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: (AVATAR_SIZE - 6) / 2,
  },
  editBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    padding: 8,
  },
  nameText: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    marginTop: 4,
    textTransform: "capitalize",
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginTop: 4,
    opacity: 0.8,
  },

  /* COMPLETION SECTION */
  meterBlock: {
    width: "100%",
    marginTop: 24,
    backgroundColor: "#0A0A0A",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  meterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,  
  },
  meterTitle: {
    fontSize: 10,
    fontFamily: "Lato_700Bold",
    letterSpacing: 1.5,
    // textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
  meterPctBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  meterPctText: {
    fontSize: 12,
    fontFamily: "Lato_700Bold",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  missingItemsContainer: {
    marginTop: 4,
  },
  missingTitle: {
    fontSize: 13,
    fontFamily: "Lato_700Bold",
    marginBottom: 8,
  },
  missingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  missingDot: {
    marginRight: 8,
  },
  missingText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
  completeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  completeBtnText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 14,
  },

  /* TABS */
  tabsWrapper: {
    marginTop: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tabBtn: {
    paddingVertical: 12,
    position: "relative",
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    letterSpacing: 1.5,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },

  /* CONTENT */
  tabContent: {
    padding: 24,
    paddingBottom: 60,
  },
  contentSection: {
    flex: 1,
  },
  bioText: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    lineHeight: 26,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    fontStyle: "italic",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
    opacity: 0.8,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
  },
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Lato_700Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  
  /* CHIPS & INFO */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: "45%",
  },
  infoChipLabel: {
    fontSize: 10,
    fontFamily: "Lato_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoChipValue: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    marginTop: 2,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  verificationText: {
    fontSize: 15,
    fontFamily: "Lato_700Bold",
  },
});
