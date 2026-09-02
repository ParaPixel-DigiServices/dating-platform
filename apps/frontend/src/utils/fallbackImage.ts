export const getFallbackImage = (gender?: string) => {
  const g = (gender || "").toLowerCase();
  if (g === 'male' || g === 'man') {
    return require("../../assets/images/main_profile_logo_male.png");
  } else if (g === 'female' || g === 'woman') {
    return require("../../assets/images/main_profile_logo_female.png");
  }
  // Default fallback
  return require("../../assets/images/main_profile_logo_female.png");
};
