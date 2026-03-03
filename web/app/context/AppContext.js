'use client';
import { createContext, useContext, useReducer, useMemo } from 'react';

const AppContext = createContext(null);

const initialState = {
  symptomText: '', selectedSymptoms: [], suggestedSpecialties: [],
  selectedSpecialty: null, filteredDoctors: [], selectedDoctor: null,
  selectedTimeSlot: null, userLocation: null, appointments: [],
  flowStage: 'home',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER_LOCATION': return { ...state, userLocation: action.payload };
    case 'SET_SYMPTOM_TEXT': return { ...state, symptomText: action.payload };
    case 'SET_SELECTED_SYMPTOMS': return { ...state, selectedSymptoms: action.payload };
    case 'SET_SUGGESTED_SPECIALTIES': return { ...state, suggestedSpecialties: action.payload, flowStage: 'specialty' };
    case 'SELECT_SPECIALTY': return { ...state, selectedSpecialty: action.payload, flowStage: 'discovery' };
    case 'SET_FILTERED_DOCTORS': return { ...state, filteredDoctors: action.payload };
    case 'SELECT_DOCTOR': return { ...state, selectedDoctor: action.payload, selectedTimeSlot: null, flowStage: 'detail' };
    case 'SELECT_TIME_SLOT': return { ...state, selectedTimeSlot: action.payload };
    case 'ADD_APPOINTMENT': return { ...state, appointments: [action.payload, ...state.appointments], flowStage: 'confirmation' };
    case 'LOAD_APPOINTMENTS': return { ...state, appointments: action.payload };
    case 'RESET_FLOW': return { ...state, symptomText: '', selectedSymptoms: [], suggestedSpecialties: [], selectedSpecialty: null, filteredDoctors: [], selectedDoctor: null, selectedTimeSlot: null, flowStage: 'home' };
    case 'GO_BACK_TO_DISCOVERY': return { ...state, selectedDoctor: null, selectedTimeSlot: null, flowStage: 'discovery' };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = useMemo(() => ({
    setUserLocation: (loc) => dispatch({ type: 'SET_USER_LOCATION', payload: loc }),
    setSymptomText: (t) => dispatch({ type: 'SET_SYMPTOM_TEXT', payload: t }),
    setSelectedSymptoms: (s) => dispatch({ type: 'SET_SELECTED_SYMPTOMS', payload: s }),
    setSuggestedSpecialties: (s) => dispatch({ type: 'SET_SUGGESTED_SPECIALTIES', payload: s }),
    selectSpecialty: (s) => dispatch({ type: 'SELECT_SPECIALTY', payload: s }),
    setFilteredDoctors: (d) => dispatch({ type: 'SET_FILTERED_DOCTORS', payload: d }),
    selectDoctor: (d) => dispatch({ type: 'SELECT_DOCTOR', payload: d }),
    selectTimeSlot: (s) => dispatch({ type: 'SELECT_TIME_SLOT', payload: s }),
    addAppointment: (a) => dispatch({ type: 'ADD_APPOINTMENT', payload: a }),
    loadAppointments: (a) => dispatch({ type: 'LOAD_APPOINTMENTS', payload: a }),
    resetFlow: () => dispatch({ type: 'RESET_FLOW' }),
    goBackToDiscovery: () => dispatch({ type: 'GO_BACK_TO_DISCOVERY' }),
  }), []);
  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
