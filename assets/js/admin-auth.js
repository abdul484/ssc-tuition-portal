/**
 * SSC Students Study Circle - Admin Authentication & Authorization Manager (v3.0)
 * Enforces role-based security:
 * - Public users cannot modify records
 * - Only approved staff members can access the Admin Dashboard
 * - Registrations do NOT grant automatic administrator privileges (require Director approval)
 * - Seamless integration with Supabase Auth + local persistent store
 */

const STORAGE_KEY_AUTH = 'ssc_admin_auth_session_v3';

// Authorized administrator credentials - strictly accepts Username: [Mee_Username] and Password: [Mee_Password]
const AUTHORIZED_ADMIN_CREDENTIALS = {
  usernames: ['[mee_username]', 'mee_username'],
  passwords: ['[Mee_Password]', 'Mee_Password']
};

class AdminAuthManager {
  constructor() {
    this.subscribers = [];
    this.currentSession = this.loadSession();
  }

  loadSession() {
    try {
      const explicitLogout = sessionStorage.getItem('ssc_admin_explicit_logout');
      if (explicitLogout === 'true') {
        return null;
      }
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const session = JSON.parse(saved);
        if (session && session.expiresAt && new Date(session.expiresAt) > new Date()) {
          return session;
        }
      }
    } catch (e) {
      console.warn('Error reading admin session:', e);
    }
    return null;
  }

  quickDirectorLogin() {
    return { success: false, message: 'Please enter your authorized credentials to log in.' };
  }

  saveSession(session) {
    if (session) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
    this.currentSession = session;
    this.notifySubscribers();
  }

  isLoggedIn() {
    return this.currentSession !== null && new Date(this.currentSession.expiresAt) > new Date();
  }

  isAdmin() {
    return this.isLoggedIn() && (this.currentSession.user?.role === 'admin' || this.currentSession.user?.role === 'director');
  }

  getCurrentUser() {
    return this.isLoggedIn() ? this.currentSession.user : null;
  }

  // Staff & Admin Login
  async login(identifier, password, rememberMe = false) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const cleanUser = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    const isUserValid = AUTHORIZED_ADMIN_CREDENTIALS.usernames.includes(cleanUser.toLowerCase());
    const isPassValid = AUTHORIZED_ADMIN_CREDENTIALS.passwords.includes(cleanPass);

    if (isUserValid && isPassValid) {
      sessionStorage.removeItem('ssc_admin_explicit_logout');
      const session = {
        token: 'ssc_admin_' + Math.random().toString(36).substring(2),
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'admin-001',
          username: cleanUser,
          email: 'admin@sscstudycircle.com',
          name: 'Center Director',
          role: 'admin',
          title: 'Director & Chief Educator'
        }
      };
      this.saveSession(session);
      return { success: true, user: session.user };
    }

    return {
      success: false,
      message: 'Invalid Username or Password. Access is restricted to authorized administrator only.'
    };
  }

  // Logout handler
  logout() {
    if (window.DatabaseService && window.DatabaseService.isSupabaseConnected()) {
      try {
        window.DatabaseService.supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Supabase logout error:', e);
      }
    }
    this.saveSession(null);
    return true;
  }

  // Staff Registration Request Alias
  async registerRequest(name, email, phone, password, requestedRole = 'staff') {
    return this.registerStaffRequest(name, email, phone, password, requestedRole);
  }

  // Staff Registration Request
  async registerStaffRequest(name, email, phone, password, requestedRole = 'staff') {
    await new Promise(resolve => setTimeout(resolve, 700));

    if (!name || !email || !password) {
      return { success: false, message: 'Name, email, and password are required.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email belongs to default director
    if (DEFAULT_AUTHORIZED_ADMINS.some(a => a.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'An account with this email already exists. Please log in directly.' };
    }

    try {
      if (window.DatabaseService) {
        window.DatabaseService.registerStaff(name, normalizedEmail, phone, requestedRole);
      }
      return {
        success: true,
        message: 'Staff registration submitted successfully! For security, an authorized administrator must approve your account before you can log in.'
      };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  }

  // Password reset simulation
  async requestPasswordReset(email) {
    await new Promise(resolve => setTimeout(resolve, 700));
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (window.DatabaseService && window.DatabaseService.isSupabaseConnected()) {
      try {
        await window.DatabaseService.supabaseClient.auth.resetPasswordForEmail(normalizedEmail);
      } catch (e) {
        console.warn('Cloud reset password error:', e);
      }
    }

    return {
      success: true,
      message: 'If the provided email is registered, verification instructions have been dispatched.'
    };
  }

  // Event and subscriber management
  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.isLoggedIn(), this.getCurrentUser());
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers() {
    const loggedIn = this.isLoggedIn();
    const user = this.getCurrentUser();
    if (this.subscribers && Array.isArray(this.subscribers)) {
      this.subscribers.forEach(cb => {
        try {
          cb(loggedIn, user);
        } catch (e) {
          console.error('Subscriber callback error:', e);
        }
      });
    }

    window.dispatchEvent(new CustomEvent('sscAuthStateChanged', {
      detail: { isLoggedIn: loggedIn, user }
    }));
  }
}

window.AdminAuth = new AdminAuthManager();
