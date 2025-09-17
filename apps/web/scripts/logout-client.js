// Force logout script for all local development ports
(function() {
  const ports = [3000, 3001, 3002];
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
        iframe.src = `http://localhost:${port}/`;
        iframe.onload = () => {
          try {
            iframe.contentWindow.localStorage.clear();
            iframe.contentWindow.sessionStorage.clear();
            console.log(`✅ Cleared data for port ${port}`);
          } catch (e) {
            console.log(`⚠️ Could not clear data for port ${port} (CORS)`);
          }
          setTimeout(() => document.body.removeChild(iframe), 1000);
        };
        document.body.appendChild(iframe);
      } catch (e) {
        console.log(`⚠️ Could not access port ${port}:`, e);
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