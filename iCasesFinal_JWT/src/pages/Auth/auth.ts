// auth.ts - Updated to use Backend API
const API_URL = 'http://localhost:5146/api/auth'; // Your backend URL

export interface UserInfo {
  username: string;
  email: string;
  token: string;
  profilePic?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  errorCode?: string; // Add error code for translation
  token?: string;
  username?: string;
  email?: string;
  profilePic?: string;
}

export async function saveUser(
  username: string,
  password: string,
  profilePic?: string,
  email?: string
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        email: email || '',
        profilePic: profilePic || null
      }),
    });

    // Handle non-JSON responses (like plain text errors)
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data || 'Registration failed'
      };
    }

    return {
      success: true,
      message: data.message || 'User registered successfully'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network error. Please check if the backend is running on http://localhost:5146'
    };
  }
}

export async function validateUser(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Invalid credentials'
      };
    }

    // Store JWT token and user info after successful login
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        username: data.username,
        email: data.email,
        token: data.token,
        profilePic: data.profilePic
      }));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please check if the backend is running on http://localhost:5146'
    };
  }
}

export function getCurrentUser(): UserInfo | null {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function logout(): void {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/check-username/${encodeURIComponent(username)}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
}

export async function isEmailTaken(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/check-email/${encodeURIComponent(email)}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

export function getUsers(): Record<string, { password: string; profilePic?: string; email?: string }> {
  console.warn('getUsers() is deprecated. Users are now stored in the backend.');
  return {};
}

export async function updateUserEmail(username: string, newEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_URL}/update-email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        newEmail
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update email'
      };
    }

    // Update localStorage with new email
    const currentUser = getCurrentUser();
    if (currentUser) {
      currentUser.email = newEmail;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    return {
      success: true,
      message: data.message || 'Email updated successfully'
    };
  } catch (error) {
    console.error('Error updating email:', error);
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
}