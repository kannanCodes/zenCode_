export const tokenService = {
     getAccessToken: () => localStorage.getItem('accessToken'),

     setAccessToken: (token: string) => {
          localStorage.setItem('accessToken', token);
     },

     clear: () => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
     },

     /** Decode the JWT payload (no signature verification – client-side only) */
     getTokenPayload: (): Record<string, unknown> | null => {
          const token = localStorage.getItem('accessToken');
          if (!token) return null;
          try {
               const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
               return JSON.parse(atob(base64));
          } catch {
               return null;
          }
     },
};