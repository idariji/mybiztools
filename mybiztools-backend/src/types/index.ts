import { Request } from 'express';

// AUGMENTED EXPRESS REQUEST
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  admin?: AuthAdmin;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  emailVerified: boolean;
  currentPlan: string;
  subscriptionStatus: string;
}

export interface AuthAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

// SERVICE RESPONSE
// export interface ServiceResponse<T = undefined> {
//   success: boolean;
//   message: string;
//   data?: T;
//   error?: string;
// }

export interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// AUTH TYPES
export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  emailVerified: boolean;
  currentPlan: string;
}

export interface AuthResponseData {
  user: AuthUserPayload;
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}