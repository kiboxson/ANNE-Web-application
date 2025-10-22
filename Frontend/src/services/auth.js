// Frontend/src/services/auth.js
// Firebase Authentication integration
import auth from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import axios from "axios";
import { API_CONFIG, API_BASE_URL_EXPORT } from "../config/api";

async function registerUserInBackend(user) {
  try {
    console.log('🔐 Registering user in backend:', user);
    console.log('🔗 Using API URL:', API_BASE_URL_EXPORT);
    
    const response = await axios.post(`${API_BASE_URL_EXPORT}${API_CONFIG.ENDPOINTS.USERS}`, {
      userId: user.userId,
      username: user.username,
      email: user.email
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User registered successfully in backend:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Failed to register user in backend:', error);
    console.error('❌ Request URL:', error.config?.url);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error details:', error.response?.data || error.message);
    
    // Don't throw error - let the app continue even if backend registration fails
    // The cart will use fallback mechanisms
    if (error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Network error during user registration - cart will use fallback mode');
    } else if (error.response?.status >= 500) {
      console.warn('⚠️ Server error during user registration - cart will use fallback mode');
    }
    
    return false;
  }
}

function mapUser(u) {
  if (!u) return null;
  // Shape expected by the app: { username, email, userId }
  const username = u.displayName || (u.email ? u.email.split("@")[0] : "User");
  return { 
    username, 
    email: u.email || "", 
    userId: u.uid // Firebase UID as unique user ID
  };
}

export function getCurrentUser() {
  const u = auth.currentUser;
  return mapUser(u);
}

export async function logout() {
  await signOut(auth);
}

export async function login({ email, password }) {
  if (!email || !password) throw new Error("Email and password are required");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = mapUser(cred.user);
  
  // Register/update user in backend
  if (user) {
    const registrationSuccess = await registerUserInBackend(user);
    if (!registrationSuccess) {
      console.warn('⚠️ User login succeeded but backend registration failed - cart will use fallback mode');
    }
  }
  
  return user;
}

export async function signup({ username, email, password }) {
  if (!username || !email || !password) throw new Error("All fields are required");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Set display name so the UI can show a username
  await updateProfile(cred.user, { displayName: username });
  const user = mapUser(cred.user);
  
  // Register user in backend
  if (user) {
    const registrationSuccess = await registerUserInBackend(user);
    if (!registrationSuccess) {
      console.warn('⚠️ User signup succeeded but backend registration failed - cart will use fallback mode');
    }
  }
  
  return user;
}

export async function updateUsername(newName) {
  const u = auth.currentUser;
  if (!u) throw new Error("Not logged in");
  await updateProfile(u, { displayName: newName });
  return mapUser(auth.currentUser);
}
