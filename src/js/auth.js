// Authentication helper functions

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});

// Check authentication status and update UI
async function checkAuthStatus() {
  const user = getUser();
  const token = getToken();
  
  if (user && token) {
    // Verify token is still valid
    try {
      await authAPI.getCurrentUser();
    } catch (error) {
      // Token invalid, logout
      authAPI.logout();
      return;
    }
    updateNavigation(user);
  } else {
    showLoginLinks();
  }
}

// Update navigation with user info
function updateNavigation(user) {
  const navElements = document.querySelectorAll('.user-nav, .auth-links');
  
  navElements.forEach(element => {
    if (element) {
      element.innerHTML = `
        <span>Welcome, ${user.name}</span>
        ${user.role === 'admin' ? '<a href="admin.html">Admin Dashboard</a>' : ''}
        <a href="#" onclick="handleLogout()">Logout</a>
      `;
    }
  });
}

// Show login/register links
function showLoginLinks() {
  const navElements = document.querySelectorAll('.user-nav, .auth-links');
  
  navElements.forEach(element => {
    if (element) {
      element.innerHTML = `
        <a href="user-login.html">Login</a>
        <a href="user-register.html">Register</a>
      `;
    }
  });
}

// Handle logout
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    authAPI.logout();
  }
}

// Handle user login form submission
async function handleUserLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  
  try {
    const response = await authAPI.login(email, password);
    
    if (response.success) {
      alert('Login successful!');
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

// Handle user registration form submission
async function handleUserRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  
  try {
    const response = await authAPI.register({ name, email, password });
    
    if (response.success) {
      alert('Registration successful! Please login.');
      window.location.href = 'user-login.html';
    }
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
}

// Handle admin login form submission
async function handleAdminLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await authAPI.login(email, password);
    
    if (response.success) {
      if (response.user.role === 'admin') {
        alert('Welcome Admin!');
        window.location.href = 'admin.html';
      } else {
        alert('Access denied. You are not an admin.');
        authAPI.logout();
      }
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

// Initialize login forms if they exist
document.addEventListener('DOMContentLoaded', () => {
  const userLoginForm = document.getElementById('userLoginForm');
  if (userLoginForm) {
    userLoginForm.addEventListener('submit', handleUserLogin);
  }
  
  const userRegisterForm = document.getElementById('userRegisterForm');
  if (userRegisterForm) {
    userRegisterForm.addEventListener('submit', handleUserRegister);
  }
  
  // Admin login
  const adminLoginBtn = document.querySelector('button[onclick="adminLogin()"]');
  if (adminLoginBtn) {
    window.adminLogin = async function() {
      await handleAdminLogin({ preventDefault: () => {} });
    };
  }
});

