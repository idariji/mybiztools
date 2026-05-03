// This prevents the conflict between passport's Express.User and our augmentation
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      businessName: string | null;
      emailVerified: boolean;
      currentPlan: string;
      subscriptionStatus: string;
    }
  }
}

export {};