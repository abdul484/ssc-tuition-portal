/**
 * SSC Students Study Circle - Supabase Configuration & Helper Module
 * Pre-configured default connection credentials for Supabase PostgreSQL database.
 */

window.SSC_CONFIG = {
  // Pre-configured and hardcoded Supabase project credentials:
  SUPABASE_URL: window.ENV_SUPABASE_URL || "https://gznjhflxskxggaufsbct.supabase.co",
  SUPABASE_ANON_KEY: window.ENV_SUPABASE_ANON_KEY || "[PASTE_YOUR_ANON_KEY_HERE]",
  INSTITUTION_NAME: 'SSC Students Study Circle',
  DIRECTOR_EMAIL: 'admin@sscstudycircle.com',
  WHATSAPP_NUMBER: '918919961354'
};

// Auto-initialize connection when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.DatabaseService) {
    window.DatabaseService.init();
  }
});
