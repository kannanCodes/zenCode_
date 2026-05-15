export const tokenService = {
     getAccessToken: () => localStorage.getItem('accessToken'),

     setAccessToken: (token: string) => {
          localStorage.setItem('accessToken', token);
     },

     clear: () => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
     },
};