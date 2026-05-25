// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   TouchableOpacity,
//   ImageBackground,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { showSuccessToast, showErrorToast } from '@/components/toast';
// import { useOnboardingStore } from '@/hooks/useOnboardingStore';
// import { useAuthStore } from '@/hooks/useAuthStore';

// type Category = 'love' | 'marriage' | 'casual';

// interface CategoryOption {
//   id: Category;
//   title: string;
//   icon: string;
//   description: string;
//   image: string;
//   color: string;
// }

// const categories: CategoryOption[] = [
//   {
//     id: 'love',
//     icon: '',
//     title: 'Love',
//     description: 'Meaningful connections and deep relationships.',
//     image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
//     color: '#fce4ec',
//   },
//   {
//     id: 'marriage',
//     icon: '',
//     title: 'Marriage',
//     description: 'Find someone for a lifelong journey.',
//     image: 'https://images.unsplash.com/photo-1606216174052-456e36e2b739?w=400&h=300&fit=crop',
//     color: '#fff3e0',
//   },
//   {
//     id: 'casual',
//     icon: '',
//     title: 'Casual',
//     description: 'Meet freely and vibe without pressure.',
//     image: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=400&h=300&fit=crop',
//     color: '#e0e7ff',
//   },
// ];

// export default function CategoryScreen() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const selectedCategoryStore = useOnboardingStore((state) => state.category);
//   const setCategory = useOnboardingStore((state) => state.setCategory);
//   const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted);
  
//   const authUser = useAuthStore((state) => state.user);
//   const onboardingData = useOnboardingStore((state) => ({
//     firstName: state.firstName,
//     lastName: state.lastName,
//     dateOfBirth: state.dateOfBirth,
//   }));

//   const handleSelectCategory = (category: Category) => {
//     setCategory(category);
//   };

//   const handleContinue = async () => {
//     if (!selectedCategoryStore) {
//       showErrorToast('Please select a category');
//       return;
//     }

//     try {
//       setLoading(true);

//       if (!authUser?.uid || !authUser?.email) {
//         throw new Error('User authentication data missing');
//       }

//       if (!authUser.phoneNumber) {
//         throw new Error('Phone verification data missing');
//       }

//       if (!onboardingData.dateOfBirth) {
//         throw new Error('Date of birth missing');
//       }

//       // Lazy load backend service
//       const { submitOnboardingData } = await import('@/services/backendService');

//       // Call backend API to create user
//       await submitOnboardingData({
//         firebaseUid: authUser.uid,
//         email: authUser.email,
//         phoneNumber: authUser.phoneNumber,
//         firstName: onboardingData.firstName,
//         lastName: onboardingData.lastName,
//         dateOfBirth: onboardingData.dateOfBirth,
//         category: selectedCategoryStore,
//       });

//       setOnboardingCompleted(true);
//       showSuccessToast('All set! Welcome to LuvaMatch');
//       router.replace('/home');
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
//       showErrorToast(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>What are you looking for?</Text>
//           <Text style={styles.subtitle}>Choose what fits you best.</Text>
//         </View>

//         {/* Categories */}
//         <View style={styles.categoriesContainer}>
//           {categories.map((category) => (
//             <TouchableOpacity
//               key={category.id}
//               style={[
//                 styles.categoryCard,
//                 selectedCategoryStore === category.id && styles.categoryCardSelected,
//               ]}
//               onPress={() => handleSelectCategory(category.id)}
//               activeOpacity={0.8}
//             >
//               <ImageBackground
//                 source={{ uri: category.image }}
//                 style={styles.cardImage}
//                 blurRadius={1}
//               >
//                 {/* Overlay */}
//                 <View
//                   style={[
//                     styles.cardOverlay,
//                     selectedCategoryStore === category.id && styles.cardOverlaySelected,
//                   ]}
//                 />

//                 {/* Content */}
//                 <View style={styles.cardContent}>
//                   <Text style={styles.cardIcon}>{category.icon}</Text>
//                   <Text style={styles.cardTitle}>{category.title}</Text>
//                   <Text style={styles.cardDescription}>{category.description}</Text>
//                 </View>

//                 {/* Selected Indicator */}
//                 {selectedCategoryStore === category.id && (
//                   <View style={styles.selectedBadge}>
//                     <Text style={styles.selectedBadgeText}>✓</Text>
//                   </View>
//                 )}
//               </ImageBackground>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Continue Button */}
//         <TouchableOpacity
//           style={[styles.continueBtn, !selectedCategoryStore && styles.continueBtnDisabled]}
//           onPress={handleContinue}
//           disabled={!selectedCategoryStore || loading}
//         >
//           <Text style={styles.continueBtnText}>
//             {loading ? 'Setting up...' : 'Continue'}
//           </Text>
//         </TouchableOpacity>

//         {/* Skip or Back */}
//         <TouchableOpacity style={styles.changeBtn} onPress={() => router.back()}>
//           <Text style={styles.changeBtnText}>← Go back</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#faf9f7',
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingVertical: 24,
//   },
//   header: {
//     marginBottom: 32,
//     marginTop: 8,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#000',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//   },
//   categoriesContainer: {
//     gap: 16,
//     marginBottom: 28,
//   },
//   categoryCard: {
//     height: 160,
//     borderRadius: 20,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   categoryCardSelected: {
//     borderWidth: 3,
//     borderColor: '#d97c84',
//   },
//   cardImage: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     overflow: 'hidden',
//   },
//   cardOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.35)',
//   },
//   cardOverlaySelected: {
//     backgroundColor: 'rgba(217, 124, 132, 0.25)',
//   },
//   cardContent: {
//     padding: 20,
//     zIndex: 1,
//   },
//   cardIcon: {
//     fontSize: 32,
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 4,
//   },
//   cardDescription: {
//     fontSize: 13,
//     color: 'rgba(255, 255, 255, 0.95)',
//     lineHeight: 18,
//   },
//   selectedBadge: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#d97c84',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#d97c84',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   selectedBadgeText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   continueBtn: {
//     backgroundColor: '#d97c84',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 12,
//     shadowColor: '#d97c84',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   continueBtnDisabled: {
//     opacity: 0.5,
//   },
//   continueBtnText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   changeBtn: {
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   changeBtnText: {
//     color: '#666',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Functional Imports
import { showSuccessToast, showErrorToast } from "@/components/toast";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";

type Category = "love" | "marriage" | "casual" | "roommate";

interface CategoryOption {
  id: Category;
  title: string;
  description: string;
  image: string;
  iconName: any;
  iconFamily: "Ionicons" | "MaterialCommunityIcons" | "Feather";
  themeColor: string; // Used for borders, checkmarks, and accents
}

const categories: CategoryOption[] = [
  {
    id: "love",
    title: "LOVE",
    description: "Meaningful connections\nand deep relationships.",
    image: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&w=800&q=80",
    iconName: "heart",
    iconFamily: "Ionicons",
    themeColor: "#E03C5C", // Vibrant Rose
  },
  {
    id: "marriage",
    title: "MARRIAGE",
    description: "Find someone for a\nlifelong journey.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    iconName: "ring",
    iconFamily: "MaterialCommunityIcons",
    themeColor: "#D49A2A", // Rich Gold
  },
  {
    id: "casual",
    title: "CASUAL",
    description: "Meet freely and vibe\nwithout pressure.",
    image: "https://images.unsplash.com/photo-1533227260815-a641b1d30325?auto=format&fit=crop&w=800&q=80",
    iconName: "leaf",
    iconFamily: "Ionicons",
    themeColor: "#E86F3A", // Sunset Orange
  },
  {
    id: "roommate",
    title: "FIND A ROOMMATE",
    description: "Find a flatmate and\nshare your space.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    iconName: "home",
    iconFamily: "Feather",
    themeColor: "#8D6E63", // Warm Earth/Mocha
  },
];

export default function CategoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const selectedCategoryStore = useOnboardingStore((state) => state.category);
  const setCategory = useOnboardingStore((state) => state.setCategory);
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted);

  const authUser = useAuthStore((state) => state.user);
  const onboardingData = useOnboardingStore((state) => ({
    firstName: state.firstName,
    lastName: state.lastName,
    dateOfBirth: state.dateOfBirth,
  }));

  // Automatically select 'Love' by default when the screen mounts
  useEffect(() => {
    if (!selectedCategoryStore) {
      setCategory("love");
    }
  }, []);

  const handleSelectCategory = (category: Category) => {
    setCategory(category);
  };

  const handleContinue = async () => {
    if (!selectedCategoryStore) {
      showErrorToast("Please select a category");
      return;
    }

    try {
      setLoading(true);

      // DEV BYPASS: For smooth UI testing without firebase blocking
      const isDevBypass = true; 
      if (isDevBypass) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Fake delay
        setOnboardingCompleted(true);
        showSuccessToast("All set! Welcome to Amora");
        router.replace("/home");
        return;
      }

      if (!authUser?.uid || !authUser?.email) {
        throw new Error("User authentication data missing");
      }

      if (!authUser.phoneNumber) {
        throw new Error("Phone verification data missing");
      }

      if (!onboardingData.dateOfBirth) {
        throw new Error("Date of birth missing");
      }

      // Lazy load backend service
      const { submitOnboardingData } = await import("@/services/backendService");

      // Call backend API to create user
      await submitOnboardingData({
        firebaseUid: authUser.uid,
        email: authUser.email,
        phoneNumber: authUser.phoneNumber,
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        dateOfBirth: onboardingData.dateOfBirth,
        category: selectedCategoryStore,
      });

      setOnboardingCompleted(true);
      showSuccessToast("All set! Welcome to Amora");
      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render the correct icon family
  const renderIcon = (category: CategoryOption, isSelected: boolean) => {
    const iconColor = isSelected ? category.themeColor : "#666";
    
    if (category.iconFamily === "Ionicons") {
      return <Ionicons name={category.iconName} size={24} color={iconColor} />;
    }
    if (category.iconFamily === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={category.iconName} size={26} color={iconColor} />;
    }
    return <Feather name={category.iconName} size={24} color={iconColor} />;
  };

  // Find the active category data for dynamic background
  const activeCategoryData = categories.find((c) => c.id === selectedCategoryStore) || categories[0];

  return (
    <View style={styles.masterContainer}>
      {/* =========================================
          DYNAMIC FULL-SCREEN GLASSMORPHISM BACKGROUND 
          ========================================= */}
      <Image
        key={activeCategoryData.id} // Forces re-render for smooth fade if needed
        source={{ uri: activeCategoryData.image }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      
      {/* Heavy Blur Overlay to create the frosted aesthetic */}
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject} />
      
      {/* Light white wash to ensure text is always highly readable */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(255, 255, 255, 0.45)" }]} />

      <SafeAreaView style={styles.safeArea}>
        {/* --- HEADER --- */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#1E1E1E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
            <Ionicons name="sparkles" size={20} color={activeCategoryData.themeColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>What are you looking for?</Text>
            <Text style={styles.subtitle}>Choose what fits you best.</Text>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            {categories.map((category) => {
              const isSelected = selectedCategoryStore === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    isSelected && [
                      styles.categoryCardSelected,
                      { borderColor: category.themeColor, shadowColor: category.themeColor }
                    ],
                  ]}
                  onPress={() => handleSelectCategory(category.id)}
                  activeOpacity={0.9}
                >
                  {/* Background Image (Anchored strictly to the right) */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: category.image }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  </View>
                  
                  {/* Glassmorphism Gradient Overlay 
                      - Unselected: Frosted & highly transparent on the right
                      - Selected: Solid white & bright
                  */}
                  <LinearGradient
                    colors={
                      isSelected
                        ? ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0)"]
                        : ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.6)", "rgba(255, 255, 255, 0)"]
                    }
                    locations={[0, 0.45, 0.95]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />

                  {/* Content Overlay */}
                  <View style={styles.cardContent}>
                    <View style={styles.leftContent}>
                      {/* Left Icon */}
                      <View style={[
                        styles.iconCircle,
                        isSelected && { shadowColor: category.themeColor, shadowOpacity: 0.3 }
                      ]}>
                        {renderIcon(category, isSelected)}
                      </View>
                      
                      {/* Text block */}
                      <View style={styles.textContent}>
                        <Text style={[
                          styles.cardTitle, 
                          isSelected ? { color: category.themeColor } : { color: "#1E1E1E" }
                        ]}>
                          {category.title}
                        </Text>
                        <Text style={[
                          styles.cardDescription,
                          isSelected && { color: "#444" }
                        ]}>
                          {category.description}
                        </Text>
                      </View>
                    </View>

                    {/* Right Indicator (Chevron or Checkmark) */}
                    <View style={[
                      styles.rightIndicator, 
                      isSelected && { backgroundColor: category.themeColor }
                    ]}>
                      {isSelected ? (
                        <Feather name="check" size={16} color="#FFF" />
                      ) : (
                        <Feather name="chevron-right" size={18} color="#888" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Footer */}
          <View style={styles.infoFooter}>
            <Feather name="shield" size={14} color="#666" style={{ marginRight: 6, marginTop: 2 }} />
            <Text style={styles.infoText}>
              You can change this anytime{"\n"}from your profile settings.
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!selectedCategoryStore || loading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedCategoryStore || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Setting up..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    zIndex: 10,
  },
  headerIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: Platform.OS === "ios" ? "700" : "bold",
    color: "#1A1A1A",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Optima" : "serif", // Premium editorial feel
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#4A4A4A",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  categoriesContainer: {
    gap: 16,
    marginBottom: 40,
  },
  
  /* GLASSMORPHISM CARD STYLES */
  categoryCard: {
    height: 136, 
    borderRadius: 28, 
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)", // Glassy border
    backgroundColor: "rgba(255, 255, 255, 0.4)", // Translucent base
  },
  categoryCardSelected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1.01 }], // Tiny pop effect
  },
  imageContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "60%", 
  },
  cardImage: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 2, 
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: "#666", 
    lineHeight: 18,
    paddingRight: 10,
    fontWeight: "500",
  },
  rightIndicator: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* INFO FOOTER */
  infoFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 0,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },

  /* BOTTOM BUTTON */
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    backgroundColor: "transparent",
  },
  primaryButton: {
    backgroundColor: "#1A1A1A",
    width: "100%",
    paddingVertical: 20,
    borderRadius: 30, 
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: "#A0A0A0",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
