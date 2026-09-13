import { User, LearnerProfile } from '../types';
import { storage } from './storage';

export interface AuthState {
  user: User | null;
  profile: LearnerProfile | null;
  isAdmin: boolean;
  isLearner: boolean;
  isAuthenticated: boolean;
}

// Security rate limiter state
let failedAdminAttempts = 0;
let lockoutUntil = 0;

export const auth = {
  // Get current state
  getState: (): AuthState => {
    const user = storage.getCurrentUser();
    const profile = user ? storage.getProfileByUserId(user.id) || null : null;
    return {
      user,
      profile,
      isAdmin: user?.role === 'admin',
      isLearner: user?.role === 'learner',
      isAuthenticated: !!user
    };
  },

  // Google Sign-In for learners
  loginWithGoogle: (mockEmail?: string, mockName?: string, mockPhoto?: string): { user: User; isNewUser: boolean } => {
    const email = mockEmail || 'learner.kapil@gmail.com';
    const displayName = mockName || email.split('@')[0].replace('.', ' ');
    const existingUser = storage.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      existingUser.last_login_at = new Date().toISOString();
      storage.saveUser(existingUser);
      storage.setCurrentUser(existingUser);
      storage.logAudit(existingUser.id, 'USER_LOGIN', 'User', existingUser.id, { provider: 'google' });
      return { user: existingUser, isNewUser: false };
    }

    const providerId = `google-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      auth_provider: 'google',
      provider_user_id: providerId,
      email,
      display_name: displayName,
      photo_url: mockPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      role: 'learner',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };

    storage.saveUser(newUser);

    // Initial empty profile requiring onboarding
    const newProfile: LearnerProfile = {
      id: `prof-${newUser.id}`,
      user_id: newUser.id,
      country: 'India',
      preferred_language: 'English',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    storage.saveProfile(newProfile);

    storage.setCurrentUser(newUser);
    storage.logAudit(newUser.id, 'USER_REGISTERED', 'User', newUser.id, { provider: 'google', email });

    // Send welcome notification
    storage.saveNotification({
      id: `notif-${Date.now()}`,
      user_id: newUser.id,
      title: 'Welcome to Zero-To-Infinity Learning Mission',
      body: 'Welcome aboard! Choose your track (Generative AI or Agentic AI) to begin the 30-day journey.',
      type: 'welcome',
      delivery_channel: 'in_app',
      status: 'delivered',
      sent_at: new Date().toISOString(),
      created_by: 'system',
      created_at: new Date().toISOString()
    });

    return { user: newUser, isNewUser: true };
  },

  // Admin login with identifier 'kapiladmin' and initial password 'admin123'
  loginAdmin: (identifier: string, password: string): { success: boolean; message: string; user?: User } => {
    const now = Date.now();
    if (now < lockoutUntil) {
      const waitSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return { success: false, message: `Too many failed attempts. Rate limit active. Please wait ${waitSeconds}s.` };
    }

    const cleanId = identifier.trim().toLowerCase();
    
    // Validate identifier and password
    // Standard requested credentials: kapiladmin / admin123 (or stored admin hash)
    const storedAdminPass = localStorage.getItem('zti_admin_password') || 'admin123';

    if (cleanId === 'kapiladmin' && password === storedAdminPass) {
      failedAdminAttempts = 0;
      
      let adminUser = storage.getUsers().find(u => u.role === 'admin');
      if (!adminUser) {
        adminUser = {
          id: 'admin-kapil',
          auth_provider: 'admin',
          provider_user_id: 'admin-kapil-system',
          email: 'kapilnarula27july@gmail.com',
          display_name: 'Kapil (Mission Administrator)',
          photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          role: 'admin',
          account_status: 'active',
          created_at: new Date('2026-01-01').toISOString(),
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        };
        storage.saveUser(adminUser);
      } else {
        adminUser.last_login_at = new Date().toISOString();
        storage.saveUser(adminUser);
      }

      storage.setCurrentUser(adminUser);
      storage.logAudit(adminUser.id, 'ADMIN_LOGIN_SUCCESS', 'AdminSession', adminUser.id, { identifier: cleanId });

      return { success: true, message: 'Authentication successful', user: adminUser };
    }

    // Failed attempt handling
    failedAdminAttempts++;
    storage.logAudit('anonymous', 'ADMIN_LOGIN_FAILED', 'Security', 'auth_endpoint', {
      attempted_identifier: cleanId,
      failed_count: failedAdminAttempts
    });

    if (failedAdminAttempts >= 5) {
      lockoutUntil = Date.now() + 30000; // 30s lockout
      return { success: false, message: 'Maximum failed attempts reached. Locked for 30 seconds for brute-force protection.' };
    }

    return { success: false, message: 'Invalid admin identifier or password.' };
  },

  // Change admin password
  changeAdminPassword: (oldPass: string, newPass: string): { success: boolean; message: string } => {
    const currentPass = localStorage.getItem('zti_admin_password') || 'admin123';
    if (oldPass !== currentPass) {
      return { success: false, message: 'Current password does not match.' };
    }
    if (newPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters.' };
    }
    localStorage.setItem('zti_admin_password', newPass);
    localStorage.setItem('zti_admin_password_changed', 'true');
    const user = storage.getCurrentUser();
    if (user) {
      storage.logAudit(user.id, 'ADMIN_PASSWORD_CHANGED', 'User', user.id);
    }
    return { success: true, message: 'Admin password updated securely.' };
  },

  isFirstAdminLogin: (): boolean => {
    return !localStorage.getItem('zti_admin_password_changed');
  },

  getCurrentUser: (): User | null => {
    return storage.getCurrentUser();
  },

  // Logout
  logout: () => {
    const user = storage.getCurrentUser();
    if (user) {
      storage.logAudit(user.id, 'USER_LOGOUT', 'User', user.id);
    }
    storage.setCurrentUser(null);
  }
};
