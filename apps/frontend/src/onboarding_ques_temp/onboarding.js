/**
 * Demo Questionnaire Data Structure
 * This object contains all the categories, questions, and options needed 
 * to render the onboarding and category-specific flows.
 */

export const demoQuestionnaire = {
    globalOnboarding: {
        id: "global_onboarding",
        title: "Global Onboarding (Basic Profile)",
        description: "Asked to every user initially to set up their baseline profile.",

        /**
         * Fields already collected during the onboarding flow.
         * These are READ-ONLY in the profile wizard — not re-asked.
         * They are still shown in the full profile detail view.
         */
        collectedDuringOnboarding: [
            { id: "go_1", text: "Name",          description: "First and Last Name", type: "text" },
            { id: "go_2", text: "Date of Birth",  description: "Used for age calculation", type: "date" },
            { id: "go_3", text: "Gender",         type: "select", options: ["Male", "Female", "Non-binary", "Other"] },
        ],

        /**
         * Questions asked in the 'Complete Profile' wizard (go_4 onwards).
         * All questions here are editable by the user.
         */
        questions: [
            { id: "go_4",  text: "Current Location",     description: "City/Neighborhood", type: "text" },
            { id: "go_5",  text: "Education Level",       type: "select", options: ["High School", "Bachelors", "Masters", "PhD", "Other"] },
            { id: "go_6",  text: "Occupation / Profession", type: "text" },
            { id: "go_7",  text: "Height",                type: "text" },
            { id: "go_8",  text: "Diet Preference",       type: "select", options: ["Veg", "Non-Veg", "Vegan", "Jain", "Eggetarian"] },
            { id: "go_9",  text: "Lifestyle Habits",      description: "Smoking / Drinking / Greens", type: "multiselect", options: ["Never", "Occasionally", "Frequently"] },
            { id: "go_10", text: "Personality Type",      type: "select", options: ["Introvert", "Extrovert", "Ambivert"] },
            { id: "go_11", text: "Interests / Hobbies",   description: "Select up to 5", type: "multiselect", options: ["Travel", "Fitness", "Reading", "Gaming", "Music", "Art", "Food", "Sports"] },
            { id: "go_12", text: "Profile Photos",        description: "Upload 3-5 photos for testing", type: "file_upload" }
        ]
    },

    categories: {
        marriage: {
            id: "marriage",
            title: "Marriage (Serious Intent)",
            description: "Triggered if the user selects 'Marriage' as their goal.",
            questions: [
                { id: "m_1", text: "Intention Timeline", type: "select", options: ["Immediate", "Within 1 year", "Exploring seriously"] },
                { id: "m_2", text: "Marital Status", type: "select", options: ["Never Married", "Divorced", "Widowed"] },
                { id: "m_3", text: "Do you want children?", type: "select", options: ["Yes", "No", "Undecided"] },
                { id: "m_4", text: "Family Type Preference", type: "select", options: ["Nuclear", "Joint", "Open to both"] },
                { id: "m_5", text: "Are you willing to relocate after marriage?", type: "select", options: ["Yes", "No", "Domestically only"] },
                { id: "m_6", text: "Religion & Importance", description: "How important is religion to your daily life?", type: "select", options: ["Low", "Medium", "High"] },
                { id: "m_7", text: "Is astrological matching mandatory for you?", type: "select", options: ["Yes", "No", "Doesn't matter"] },
                { id: "m_8", text: "Expectations regarding a working partner?", type: "select", options: ["Must work", "Must manage home", "Partner's choice"] },
                { id: "m_9", text: "How will finances be handled?", type: "select", options: ["Shared equally", "One primary provider"] },
                { id: "m_10", text: "Are you okay with non-veg food inside the house?", type: "select", options: ["Yes", "No"] },
                { id: "m_11", text: "Are you open to marrying outside your specific caste/sect?", type: "select", options: ["Yes", "No"] },
                { id: "m_12", text: "Wedding Style Preference", type: "select", options: ["Simple/Court", "Traditional", "Luxury/Destination"] },
                { id: "m_13", text: "What is one absolute deal-breaker for a lifelong partner?", type: "text" }
            ]
        },

        love: {
            id: "love",
            title: "Love (Serious Dating)",
            description: "Focuses on psychology and chemistry.",
            questions: [
                { id: "l_1", text: "Long-Term Goal", type: "select", options: ["Looking for a long-term relationship", "Open to marriage eventually"] },
                { id: "l_2", text: "How do you best receive affection? (Love Language)", type: "select", options: ["Words", "Time", "Gifts", "Acts of Service", "Touch"] },
                { id: "l_3", text: "Communication Style", type: "select", options: ["Daily texting", "Prefer calls", "Value in-person time more"] },
                { id: "l_4", text: "How do you handle arguments?", type: "select", options: ["Need space to cool down", "Discuss immediately to fix it"] },
                { id: "l_5", text: "Prompt: The quickest way to my heart is...", type: "text" },
                { id: "l_6", text: "Prompt: A green flag in a partner is...", type: "text" },
                { id: "l_7", text: "Prompt: My ideal weekend looks like...", type: "text" },
                { id: "l_8", text: "Are you comfortable with a long-distance relationship?", type: "select", options: ["Yes", "No", "Depends on the distance"] },
                { id: "l_9", text: "Social Level", type: "select", options: ["Homebody", "Social butterfly"] },
                { id: "l_10", text: "How important is it that your partner shares your political/social views?", type: "select", options: ["Not important", "Somewhat", "Deal-breaker"] },
                { id: "l_11", text: "Pet Preference", type: "select", options: ["Must love dogs/cats", "No pets please", "Indifferent"] },
                { id: "l_12", text: "Prompt: One thing I want to build together is...", type: "text" }
            ]
        },

        casual: {
            id: "casual",
            title: "Casual (Exploration & Fun)",
            description: "Focuses on boundaries, vibe, and logistics.",
            questions: [
                { id: "c_1", text: "Current Expectations", type: "select", options: ["Friends first", "Friends with Benefits", "Casual dating", "Open to anything"] },
                { id: "c_2", text: "Exclusivity", type: "select", options: ["Open to exclusivity eventually", "Strictly open"] },
                { id: "c_3", text: "How important is an emotional bond to you in a casual setup?", type: "select", options: ["Low", "Medium", "High"] },
                { id: "c_4", text: "Evening Vibe", type: "select", options: ["Party & Clubbing", "Bar hopping", "Netflix & Chill"] },
                { id: "c_5", text: "Communication Frequency", type: "select", options: ["Check in daily", "Spontaneous", "Only when planning to meet"] },
                { id: "c_6", text: "What is your comfort level with PDA?", type: "select", options: ["Very comfortable", "Private only"] },
                { id: "c_7", text: "Privacy Expectations", type: "select", options: ["Keep it completely secret", "Open but off social media", "Don't care"] },
                { id: "c_8", text: "Vibe & Connection", type: "select", options: ["Experimental", "Dominant & Submissive", "Relaxed & Go with the flow"] },
                { id: "c_9", text: "Logistics: Who is hosting?", type: "select", options: ["I can host", "You need to host", "Prefer hotels"] },
                { id: "c_10", text: "Date Duration", type: "select", options: ["A few hours", "Open to sleepovers", "Weekend getaways"] },
                { id: "c_11", text: "Prompt: My biggest green flag for a casual date is...", type: "text" },
                { id: "c_12", text: "Prompt: My biggest red flag/dealbreaker is...", type: "text" },
                { id: "c_13", text: "Are you open to staying friends afterward?", type: "select", options: ["Yes", "No"] }
            ]
        },

        Find_Your_Roommate: {
            id: "Find_Your_Roommate",
            title: "Roommate",
            description: "Triggered if the user is looking for a co-living setup.",
            questions: [
                { id: "r_1", text: "Budget Range", type: "slider_range", description: "Min and Max budget" },
                { id: "r_2", text: "Stay Duration", type: "select", options: ["Short-term", "6 Months", "1 Year+"] },
                { id: "r_3", text: "Cleanliness Level", type: "select", options: ["Relaxed", "Moderate", "Very strict/OCD"] },
                { id: "r_4", text: "Sleep Schedule", type: "select", options: ["Early bird", "Night owl", "Mixed"] },
                { id: "r_5", text: "Pet Policy", type: "select", options: ["I have a pet", "Open to pets", "No pets"] },
                { id: "r_6", text: "How often do you bring friends/dates over?", type: "select", options: ["Rarely", "Weekends", "All the time"] },
                { id: "r_7", text: "Smoking / Alcohol at Home", type: "select", options: ["Strictly outside", "Fine in common areas", "My room only", "Strictly no"] },
                { id: "r_8", text: "Chore & Grocery Sharing", type: "select", options: ["Share everything", "Keep completely separate", "Discuss and split"] },
                { id: "r_9", text: "How do you handle roommate disagreements?", type: "select", options: ["Direct chat", "Leave notes", "Ignore it"] },
                { id: "r_10", text: "Noise Volume Preference", type: "select", options: ["Requires absolute silence", "Don't mind background noise"] },
                { id: "r_11", text: "Relationship Expectation", type: "select", options: ["Just need a roommate", "Looking for a friend to hang out with"] },
                { id: "r_12", text: "Prompt: My biggest roommate red flag is...", type: "text" }
            ]
        }
    }
};