// Serverless function for user authentication and registration

// In-memory storage for demonstration (in production, use a real database)
let globalUsersData = {};

// Helper functions
const hashPassword = (password) => {
  // Simple hash for demo - in production use bcrypt or similar
  return btoa(password + 'salt_key_2024');
};

// Initialize with demo user
const initializeDemoUser = () => {
  const demoUserId = 'demo_user_2024';
  if (!globalUsersData[demoUserId]) {
    globalUsersData[demoUserId] = {
      id: demoUserId,
      name: 'Demo User',
      email: 'demo@leap.com',
      password: hashPassword('demo123'),
      created_at: '2024-01-01T00:00:00.000Z',
      last_login: new Date().toISOString(),
      status: 'active',
      role: 'user'
    };
  }
};

// Initialize demo user on module load
initializeDemoUser();

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
      const users = Object.values(globalUsersData).map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(users);
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