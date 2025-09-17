#!/usr/bin/env node

/**
 * Force Local Logout Script
 * Clears all authentication sessions across all development ports (3000, 3001, 3002)
 *
 * Usage:
 * node scripts/force-logout.js
 *
 * Or add to package.json scripts:
 * "logout": "node scripts/force-logout.js"
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Generate the client-side logout script
function generateLogoutScript(ports) {
  return `
// Force logout script for all local development ports
(function() {
  const ports = [${ports.join(', ')}];
  const domains = ['localhost', '127.0.0.1'];

  console.log('🔓 Starting force logout process...');

  // 1. Clear localStorage
  try {
    localStorage.clear();
    console.log('✅ localStorage cleared');
  } catch (e) {
    console.warn('⚠️ Could not clear localStorage:', e);
  }

  // 2. Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (e) {
    console.warn('⚠️ Could not clear sessionStorage:', e);
  }

  // 3. Clear all cookies for all domains and ports
  function clearCookies() {
    const cookies = document.cookie.split(';');
    const cookieNames = [];

    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) cookieNames.push(name);
    });

    domains.forEach(domain => {
      ports.forEach(port => {
        cookieNames.forEach(name => {
          // Clear for current path
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + domain;
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + domain;
          // Clear for specific port
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + domain + ':' + port;
        });
      });
    });

    console.log('✅ Cookies cleared for all domains and ports');
  }

  clearCookies();

  // 4. Clear Firebase auth state
  function clearFirebaseAuth() {
    try {
      // Try to sign out if Firebase is available
      if (typeof window !== 'undefined' && window.firebase) {
        window.firebase.auth().signOut().then(() => {
          console.log('✅ Firebase auth signed out');
        }).catch(e => {
          console.warn('⚠️ Firebase signOut failed:', e);
        });
      }

      // Clear Firebase-related localStorage keys
      const firebaseKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('firebase:') || key.includes('firebase') || key.includes('auth'))) {
          firebaseKeys.push(key);
        }
      }

      firebaseKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      if (firebaseKeys.length > 0) {
        console.log('✅ Firebase auth keys cleared:', firebaseKeys);
      }

    } catch (e) {
      console.warn('⚠️ Could not clear Firebase auth:', e);
    }
  }

  clearFirebaseAuth();

  // 5. Clear any remaining auth-related data
  const authKeys = ['user', 'token', 'authToken', 'accessToken', 'refreshToken', 'session', 'auth'];
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  console.log('✅ Additional auth keys cleared');

  // 6. Try to clear data on other ports
  ports.forEach(port => {
    if (window.location.port !== port.toString()) {
      try {
        // Create invisible iframe to clear data on other ports
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = \`http://localhost:\${port}/\`;
        iframe.onload = () => {
          try {
            iframe.contentWindow.localStorage.clear();
            iframe.contentWindow.sessionStorage.clear();
            console.log(\`✅ Cleared data for port \${port}\`);
          } catch (e) {
            console.log(\`⚠️ Could not clear data for port \${port} (CORS)\`);
          }
          setTimeout(() => document.body.removeChild(iframe), 1000);
        };
        document.body.appendChild(iframe);
      } catch (e) {
        console.log(\`⚠️ Could not access port \${port}:\`, e);
      }
    }
  });

  console.log('🔓 Force logout completed!');
  console.log('🔄 Reloading page to show logged-out state...');

  // 7. Reload the page after a short delay
  setTimeout(() => {
    window.location.reload();
  }, 2000);

})();
`;
}

// Main execution
function main() {
  const ports = [3000, 3001, 3002];

  log('🔓 Force Local Logout Script', 'cyan');
  log('============================', 'cyan');
  log('');

  log('This script will clear all authentication sessions across ports:', 'white');
  ports.forEach(port => log(`  - http://localhost:${port}`, 'yellow'));
  log('');

  // Generate the logout script
  const script = generateLogoutScript(ports);

  // Save script to a temporary file for easy access
  const scriptPath = path.join(__dirname, 'logout-client.js');
  fs.writeFileSync(scriptPath, script.trim());

  log('📝 Generated client-side logout script at:', 'green');
  log(`   ${scriptPath}`, 'yellow');
  log('');

  log('🚀 To use this script:', 'blue');
  log('');
  log('Option 1: Browser Console (Recommended)', 'white');
  log('1. Open your browser and go to any localhost port (3000, 3001, or 3002)', 'white');
  log('2. Open Developer Tools (F12)', 'white');
  log('3. Go to Console tab', 'white');
  log('4. Copy and paste the following script:', 'white');
  log('');
  log('================================================', 'magenta');
  log(script.trim(), 'yellow');
  log('================================================', 'magenta');
  log('');

  log('Option 2: Bookmarklet', 'white');
  log('1. Create a new bookmark in your browser', 'white');
  log('2. Set the URL to:', 'white');
  const bookmarklet = `javascript:${script.replace(/\s+/g, ' ').replace(/console\.log\([^)]+\);/g, '')}`;
  log(bookmarklet, 'cyan');
  log('3. Click the bookmark on any localhost page to logout', 'white');
  log('');

  log('Option 3: Direct File', 'white');
  log(`Load the script file in your browser: file://${scriptPath}`, 'white');
  log('');

  log('✨ After running the script:', 'green');
  log('  - All localStorage will be cleared', 'white');
  log('  - All sessionStorage will be cleared', 'white');
  log('  - All cookies will be cleared', 'white');
  log('  - Firebase auth will be signed out', 'white');
  log('  - Page will reload to show logged-out state', 'white');
  log('');

  log('🔄 The script works across all ports (3000, 3001, 3002)', 'blue');
  log('');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateLogoutScript, main };