import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  // Booking flow
  symptomText: '',
  selectedSymptoms: [],
  suggestedSpecialties: [],
  selectedSpecialty: null,
  filteredDoctors: [],
  selectedDoctor: null,
  selectedTimeSlot: null,
  // User location
  userLocation: null,
  // Appointments
  appointments: [],
  // Flow stage: 'home' | 'specialty' | 'discovery' | 'detail' | 'confirmation'
  flowStage: 'home',
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER_LOCATION':
      return { ...state, userLocation: action.payload };
    case 'SET_SYMPTOM_TEXT':
      return { ...state, symptomText: action.payload };
    case 'SET_SELECTED_SYMPTOMS':
      return { ...state, selectedSymptoms: action.payload };
    case 'SET_SUGGESTED_SPECIALTIES':
      return {
        ...state,
        suggestedSpecialties: action.payload,
        flowStage: 'specialty',
      };
    case 'SELECT_SPECIALTY':
      return {
        ...state,
        selectedSpecialty: action.payload,
        flowStage: 'discovery',
      };
    case 'SET_FILTERED_DOCTORS':
      return { ...state, filteredDoctors: action.payload };
    case 'SELECT_DOCTOR':
      return {
        ...state,
        selectedDoctor: action.payload,
        selectedTimeSlot: null,
        flowStage: 'detail',
      };
    case 'SELECT_TIME_SLOT':
      return { ...state, selectedTimeSlot: action.payload };
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
        flowStage: 'confirmation',
      };
    case 'LOAD_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'RESET_FLOW':
      return {
        ...state,
        symptomText: '',
        selectedSymptoms: [],
        suggestedSpecialties: [],
        selectedSpecialty: null,
        filteredDoctors: [],
        selectedDoctor: null,
        selectedTimeSlot: null,
        flowStage: 'home',
      };
    case 'GO_BACK_TO_DISCOVERY':
      return {
        ...state,
        selectedDoctor: null,
        selectedTimeSlot: null,
        flowStage: 'discovery',
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(
    () => ({
      setUserLocation: (loc) =>
        dispatch({ type: 'SET_USER_LOCATION', payload: loc }),
      setSymptomText: (text) =>
        dispatch({ type: 'SET_SYMPTOM_TEXT', payload: text }),
      setSelectedSymptoms: (symptoms) =>
        dispatch({ type: 'SET_SELECTED_SYMPTOMS', payload: symptoms }),
      setSuggestedSpecialties: (specs) =>
        dispatch({ type: 'SET_SUGGESTED_SPECIALTIES', payload: specs }),
      selectSpecialty: (spec) =>
        dispatch({ type: 'SELECT_SPECIALTY', payload: spec }),
      setFilteredDoctors: (docs) =>
        dispatch({ type: 'SET_FILTERED_DOCTORS', payload: docs }),
      selectDoctor: (doc) =>
        dispatch({ type: 'SELECT_DOCTOR', payload: doc }),
      selectTimeSlot: (slot) =>
        dispatch({ type: 'SELECT_TIME_SLOT', payload: slot }),
      addAppointment: (appt) =>
        dispatch({ type: 'ADD_APPOINTMENT', payload: appt }),
      loadAppointments: (appts) =>
        dispatch({ type: 'LOAD_APPOINTMENTS', payload: appts }),
      resetFlow: () => dispatch({ type: 'RESET_FLOW' }),
      goBackToDiscovery: () => dispatch({ type: 'GO_BACK_TO_DISCOVERY' }),
    }),
    []
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
