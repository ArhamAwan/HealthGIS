export const SYMPTOM_CHIPS = [
  { id: 'headache', label: 'Headache', icon: 'head-side-virus' },
  { id: 'fever', label: 'Fever', icon: 'thermometer' },
  { id: 'chest_pain', label: 'Chest Pain', icon: 'heartbeat' },
  { id: 'skin_problem', label: 'Skin Problem', icon: 'hand-holding-medical' },
  { id: 'general_checkup', label: 'General Checkup', icon: 'stethoscope' },
];

export const SYMPTOM_TO_SPECIALTY = {
  headache: ['Neurologist', 'General Medicine'],
  fever: ['General Medicine', 'Internal Medicine'],
  chest_pain: ['Cardiologist', 'General Medicine'],
  skin_problem: ['Dermatologist', 'General Medicine'],
  general_checkup: ['General Medicine'],
};

export const SPECIALTY_ICONS = {
  Neurologist: 'brain',
  'General Medicine': 'user-md',
  'Internal Medicine': 'procedures',
  Cardiologist: 'heartbeat',
  Dermatologist: 'allergies',
};

/**
 * Given free-text symptom input, find matching specialties.
 * Matches against known symptom keywords.
 */
export function mapSymptomsToSpecialties(text) {
  const lower = text.toLowerCase();
  const matched = new Set();

  const keywordMap = {
    headache: 'headache',
    'head pain': 'headache',
    migraine: 'headache',
    fever: 'fever',
    temperature: 'fever',
    'chest pain': 'chest_pain',
    'chest tight': 'chest_pain',
    'heart pain': 'chest_pain',
    skin: 'skin_problem',
    rash: 'skin_problem',
    itching: 'skin_problem',
    acne: 'skin_problem',
    checkup: 'general_checkup',
    'check up': 'general_checkup',
    general: 'general_checkup',
  };

  for (const [keyword, symptomId] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      const specialties = SYMPTOM_TO_SPECIALTY[symptomId] || [];
      specialties.forEach((s) => matched.add(s));
    }
  }

  if (matched.size === 0) {
    return ['General Medicine'];
  }

  return Array.from(matched);
}
