'use client';
import { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const initialState = { isAuthenticated: false, user: null, isLoading: true, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS': return { isAuthenticated: true, user: action.payload, isLoading: false, error: null };
    case 'AUTH_ERROR': return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_PROFILE': return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR': return { ...state, error: null };
    case 'LOGOUT': return { ...initialState, isLoading: false };
    case 'INIT_DONE': return { ...state, isLoading: false };
    default: return state;
  }
}

function mapProfile(row) {
  return {
    id: row.id, name: row.name, email: row.email, role: row.role,
    phone: row.phone, dateOfBirth: row.date_of_birth, gender: row.gender,
    weight: row.weight, height: row.height, bloodType: row.blood_type,
    allergies: row.allergies,
    emergencyContact: { name: row.emergency_contact_name, phone: row.emergency_contact_phone },
    profilePhoto: row.avatar_url,
  };
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) dispatch({ type: 'LOGIN_SUCCESS', payload: mapProfile(data) });
    else dispatch({ type: 'INIT_DONE' });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user.id);
      else dispatch({ type: 'INIT_DONE' });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) loadProfile(session.user.id);
      else dispatch({ type: 'LOGOUT' });
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) dispatch({ type: 'AUTH_ERROR', payload: error.message });
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING' });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { dispatch({ type: 'AUTH_ERROR', payload: error.message }); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      dispatch({ type: 'AUTH_ERROR', payload: 'This account does not have admin access' });
    }
  }, []);

  const signup = useCallback(async (profileData) => {
    dispatch({ type: 'SET_LOADING' });
    const { data, error } = await supabase.auth.signUp({
      email: profileData.email, password: profileData.password,
      options: { data: { name: profileData.name, role: 'patient' } },
    });
    if (error) { dispatch({ type: 'AUTH_ERROR', payload: error.message }); return; }
    if (data.user && !data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email, password: profileData.password,
      });
      if (signInError) {
        dispatch({ type: 'AUTH_ERROR', payload: 'Account created but could not sign in. Please log in manually.' });
        return;
      }
    }
    if (data.user) {
      await supabase.from('profiles').update({
        phone: profileData.phone || '', date_of_birth: profileData.dateOfBirth || '',
        gender: profileData.gender || '', weight: profileData.weight || '',
        height: profileData.height || '', blood_type: profileData.bloodType || '',
        allergies: profileData.allergies || '',
        emergency_contact_name: profileData.emergencyContact?.name || '',
        emergency_contact_phone: profileData.emergencyContact?.phone || '',
      }).eq('id', data.user.id);
    }
  }, []);

  const updateProfile = useCallback(async (fields) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: fields });
    if (!state.user) return;
    const row = {};
    if (fields.name !== undefined) row.name = fields.name;
    if (fields.phone !== undefined) row.phone = fields.phone;
    if (fields.dateOfBirth !== undefined) row.date_of_birth = fields.dateOfBirth;
    if (fields.gender !== undefined) row.gender = fields.gender;
    if (fields.weight !== undefined) row.weight = fields.weight;
    if (fields.height !== undefined) row.height = fields.height;
    if (fields.bloodType !== undefined) row.blood_type = fields.bloodType;
    if (fields.allergies !== undefined) row.allergies = fields.allergies;
    if (fields.emergencyContact !== undefined) {
      row.emergency_contact_name = fields.emergencyContact.name || '';
      row.emergency_contact_phone = fields.emergencyContact.phone || '';
    }
    if (fields.profilePhoto !== undefined) row.avatar_url = fields.profilePhoto;
    await supabase.from('profiles').update(row).eq('id', state.user.id);
  }, [state.user]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  const value = useMemo(
    () => ({ ...state, login, adminLogin, signup, updateProfile, logout, clearError }),
    [state, login, adminLogin, signup, updateProfile, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
