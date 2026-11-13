/**
 * SSC Students Study Circle - Supabase Configuration & Helper Module
 * Pre-configured default connection credentials for Supabase PostgreSQL database.
 */

window.SSC_CONFIG = {
  // Pre-configured and hardcoded Supabase project credentials:
  SUPABASE_URL: window.ENV_SUPABASE_URL || "https://gznjhflxskxggaufsbct.supabase.co",
  SUPABASE_ANON_KEY: window.ENV_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bmpoZmx4c2t4Z2dhdWZzYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MzQwMzgsImV4cCI6MjEwODUxMDAzOH0.KzHXvwOxU4nGW6928M6oN97ielkOoDCyOKB04MREOmA",
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
