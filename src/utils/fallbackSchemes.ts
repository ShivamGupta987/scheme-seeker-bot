
import { Scheme } from '../context/FormContext';

// Base fallback schemes
export const fallbackSchemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    description: "Pradhan Mantri Kisan Samman Nidhi provides income support to farmers. Eligible farmers receive up to ₹6,000 per year in three equal installments.",
    category: "Agriculture",
    eligibilityCriteria: ["Small and marginal farmer", "Income below threshold"],
    link: "https://pmkisan.gov.in/"
  },
  {
    id: "pmjay",
    name: "Ayushman Bharat (PM-JAY)",
    description: "Provides health insurance coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization. Covers poor and vulnerable families identified through socio-economic criteria.",
    category: "Health",
    eligibilityCriteria: ["Income below poverty line", "No existing health coverage"],
    link: "https://pmjay.gov.in/"
  },
  {
    id: "pmuy",
    name: "Pradhan Mantri Ujjwala Yojana",
    description: "Provides LPG connections to women from below poverty line households. Aims to replace unclean cooking fuels with clean and efficient LPG.",
    category: "Energy",
    eligibilityCriteria: ["Below poverty line household", "No existing LPG connection"],
    link: "https://pmuy.gov.in/"
  }
];

// Generate dynamic fallback schemes based on the user's input data
export const generateDynamicFallbackSchemes = (prompt: string): Scheme[] => {
  // Extract state from prompt
  const stateMatch = prompt.match(/State\/UT:\s*([^\n]+)/);
  const state = stateMatch ? stateMatch[1].trim() : "India";
  
  // Extract income from prompt
  const incomeMatch = prompt.match(/Income:\s*₹([^\n]+)/);
  const income = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, '')) : 0;
  
  // Extract age from prompt
  const ageMatch = prompt.match(/Age:\s*(\d+)/);
  const age = ageMatch ? parseInt(ageMatch[1]) : 30;
  
  // Extract gender from prompt
  const genderMatch = prompt.match(/Gender:\s*([^\n]+)/);
  const gender = genderMatch ? genderMatch[1].trim() : "Any";
  
  // Copy the base fallback schemes
  const dynamicSchemes = [...fallbackSchemes];
  
  // Add state-specific scheme if known state
  if (state === "Maharashtra") {
    dynamicSchemes.push({
      id: "maha-awas-yojana",
      name: "Maharashtra Awas Yojana",
      description: "Housing scheme for low-income residents of Maharashtra. Provides affordable housing and subsidies for construction.",
      category: "Housing",
      eligibilityCriteria: ["Maharashtra resident", "Income below threshold"],
      link: "https://housing.maharashtra.gov.in/"
    });
  }
  
  // Add age-specific schemes
  if (age < 30) {
    dynamicSchemes.push({
      id: "skill-india",
      name: "Skill India Mission (PMKVY)",
      description: "Offers free skill training to youth to enhance employability. Includes certification and placement assistance.",
      category: "Education",
      eligibilityCriteria: ["Age below 35 years", "Looking for skill development"],
      link: "https://pmkvyofficial.org/"
    });
  }
  
  if (age > 60) {
    dynamicSchemes.push({
      id: "pm-vaya-vandana",
      name: "Pradhan Mantri Vaya Vandana Yojana",
      description: "Pension scheme for senior citizens providing assured returns. Offers financial security through regular pension payments.",
      category: "Senior Benefits",
      eligibilityCriteria: ["Age above 60 years"],
      link: "https://licindia.in/Products/Pension-Plans/Pradhan-Mantri-Vaya-Vandana-Yojana"
    });
  }
  
  // Add income-specific schemes
  if (income < 300000) {
    dynamicSchemes.push({
      id: "pm-svanidhi",
      name: "PM SVANidhi",
      description: "Provides affordable loans to street vendors. Helps with working capital needs and digital transactions.",
      category: "Microfinance",
      eligibilityCriteria: ["Street vendor or small business owner", "Low income"],
      link: "https://pmsvanidhi.mohua.gov.in/"
    });
  }
  
  return dynamicSchemes;
};
