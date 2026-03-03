'use client';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppProvider } from './context/AppContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
