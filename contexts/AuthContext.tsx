'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; user: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return { user: action.user, isAuthenticated: true, isLoading: false };
    case 'LOGIN_FAILURE':
      return { user: null, isAuthenticated: false, isLoading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false };
    case 'REGISTER_SUCCESS':
      return { user: action.user, isAuthenticated: true, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: false
  });

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN_SUCCESS', user });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Update last login time
      user.last_login = new Date().toISOString();
      localStorage.setItem('auth_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', user });
      return true;
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: userData.username!,
      email: userData.email!,
      password: userData.password!,
      role: userData.role || 'student',
      name: userData.name!,
      institution: userData.institution!,
      department: userData.department,
      employee_id: userData.employee_id,
      student_id: userData.student_id,
      program: userData.program,
      year: userData.year,
      courses: userData.courses,
      enrolled_courses: userData.enrolled_courses,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    // In real app, this would be saved to database
    mockUsers.push(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    dispatch({ type: 'REGISTER_SUCCESS', user: newUser });
    
    return true;
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};