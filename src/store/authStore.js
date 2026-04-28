import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            theme: 'dark', // 'dark' | 'light'
            setAuth: (user, token) => set({ user, token }),
            updateUser: (user) => set({ user }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
            logout: () => {
                set({ user: null, token: null })
                window.location.href = '/auth/login'
            },
        }),
        { name: 'binancesim-auth' }
    )
)
