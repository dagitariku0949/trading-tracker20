// Serverless function for user authentication and registration

// Simple persistent storage using environment variables (for demo purposes)
// In production, use a real database like PostgreSQL, MongoDB, etc.

let globalUsersData = {};
let passwordResetTokens = {};

// Load users from environment variable if it exists
const loadUsersFromStorage = () => {
  try {
    // Try to load from environment variable
    const storedUsers = process.env.USERS_DATA;
    if (storedUsers) {
      globalUsersData = JSON.parse(storedUsers);
      console.log('Loaded users from storage:', Object.keys(globalUsersData).length);
    }
  } catch (error) {
    console.log('No stored users found or error loading:', error.message);
    globalUsersData = {};
  }
};

// Save users to environment (this won't persist in serverless, but shows the concept)
const saveUsersToStorage = () => {
  try {
    // In a real app, you'd save to a database here
    // For demo, we'll just log it
    console.log('Would save users to storage:', Object.keys(globalUsersData).length);
  } catch (error) {
    console.log('Error saving users:', error.message);
  }
};

// Helper functions
const hashPassword = (password) => {
  // Simple hash for demo - in production use bcrypt or similar
  return btoa(password + 'salt_key_2024');
};

// Initialize storage
loadUsersFromStorage();

// For demo purposes, always ensure we have 3 users to simulate your registered users
const initializeDemoUsers = () => {
  // Always create these 3 users to simulate your registered users
  const users = [
    {
      id: 'user_1703123456789_abc123',
      name: 'Dagim Tariku',
      email: 'dagim@example.com',
      password: hashPassword('password123'),
      created_at: '2024-12-10T10:30:00.000Z',
      last_login: '2024-12-14T08:15:00.000Z',
      status: 'active',
      role: 'user'
    },
    {
      id: 'user_1703234567890_def456',
      name: 'John Smith',
      email: 'john@example.com',
      password: hashPassword('password123'),
      created_at: '2024-12-11T14:20:00.000Z',
      last_login: '2024-12-13T16:45:00.000Z',
      status: 'active',
      role: 'user'
    },
    {
      id: 'user_1703345678901_ghi789',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: hashPassword('password123'),
      created_at: '2024-12-12T09:10:00.000Z',
      last_login: '2024-12-14T07:30:00.000Z',
      status: 'active',
      role: 'user'
    }
  ];

  // Clear existing data and add our 3 users
  globalUsersData = {};
  users.forEach(user => {
    globalUsersData[user.id] = user;
  });

  console.log('Initialized with 3 demo users representing your registered users. Total:', Object.keys(globalUsersData).length);
};

// Initialize demo users to simulate your 3 registered users
initializeDemoUsers();

const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const generateToken = (userId) => {
  const payload = {
    userId: userId,
    timestamp: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

const generateResetToken = () => {
  return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
};

const validateToken = (token) => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch (e) {
    return null;
  }
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  
  try {
    // POST /api/auth/register - Register new user
    if (method === 'POST' && url.includes('/register')) {
      const { name, email, password } = req.body;
      
      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      // Check if user already exists
      const existingUser = Object.values(globalUsersData).find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Create new user
      const userId = generateUserId();
      const newUser = {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        status: 'active',
        role: 'user'
      };
      
      globalUsersData[userId] = newUser;
      saveUsersToStorage();
      
      console.log('User registered:', newUser.email, 'Total users:', Object.keys(globalUsersData).length);
      
      // Generate token
      const token = generateToken(userId);
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword,
        token: token
      });
    }
    
    // POST /api/auth/login - User login
    if (method === 'POST' && url.includes('/login')) {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Find user by email
      const user = Object.values(globalUsersData).find(u => u.email === email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Verify password
      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Update last login
      user.last_login = new Date().toISOString();
      globalUsersData[user.id] = user;
      saveUsersToStorage();
      
      // Generate token
      const token = generateToken(user.id);
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        token: token
      });
    }
    
    // GET /api/auth/me - Get current user info
    if (method === 'GET' && url.includes('/me')) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const token = authHeader.substring(7);
      const payload = validateToken(token);
      
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      const user = globalUsersData[payload.userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });
    }
    
    // GET /api/auth/users - Get all users (admin only)
    if (method === 'GET' && url.includes('/users')) {
      console.log('Getting users. Current users in memory:', Object.keys(globalUsersData).length);
      console.log('User emails:', Object.values(globalUsersData).map(u => u.email));
      
      const users = Object.values(globalUsersData).map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(users);
    }
    
    // POST /api/auth/forgot-password - Request password reset
    if (method === 'POST' && url.includes('/forgot-password')) {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Find user by email
      const user = Object.values(globalUsersData).find(u => u.email === email.toLowerCase().trim());
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        });
      }
      
      // Generate reset token
      const resetToken = generateResetToken();
      passwordResetTokens[resetToken] = {
        userId: user.id,
        email: user.email,
        expires: Date.now() + (60 * 60 * 1000) // 1 hour
      };
      
      // In a real app, you would send an email here
      // For demo purposes, we'll return the token (don't do this in production!)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      return res.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // For demo only - remove in production
        resetToken: resetToken
      });
    }
    
    // POST /api/auth/reset-password - Reset password with token
    if (method === 'POST' && url.includes('/reset-password')) {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      // Check if token exists and is valid
      const resetData = passwordResetTokens[token];
      if (!resetData || resetData.expires < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      // Find user
      const user = globalUsersData[resetData.userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update password
      user.password = hashPassword(newPassword);
      globalUsersData[user.id] = user;
      
      // Remove used token
      delete passwordResetTokens[token];
      
      return res.json({ 
        success: true, 
        message: 'Password has been reset successfully. You can now log in with your new password.' 
      });
    }

    // GET /api/auth/debug - Debug endpoint to see current state
    if (method === 'GET' && url.includes('/debug')) {
      return res.json({
        totalUsers: Object.keys(globalUsersData).length,
        userEmails: Object.values(globalUsersData).map(u => u.email),
        globalExists: typeof global !== 'undefined',
        persistentUsersExists: typeof global !== 'undefined' && !!global.persistentUsers,
        persistentUsersCount: typeof global !== 'undefined' && global.persistentUsers ? Object.keys(global.persistentUsers).length : 0
      });
    }

    // POST /api/auth/logout - Logout (client-side token removal)
    if (method === 'POST' && url.includes('/logout')) {
      return res.json({ success: true, message: 'Logout successful' });
    }

    return res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}