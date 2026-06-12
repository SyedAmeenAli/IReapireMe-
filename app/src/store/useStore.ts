import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeviceType = 'iphone' | 'android' | 'ipad' | 'macbook' | 'watch' | 'airpods' | 'imac' | 'other';
export type Brand = string;
export type ServiceMode = 'pickup' | 'dropoff' | 'courier' | 'onsite';
export type PartQuality = 'oem' | 'high-tier' | 'genuine';

export interface CartItem {
  id: string;
  type: 'repair' | 'product';
  name: string;
  deviceBrand?: string;
  deviceModel?: string;
  issue?: string;
  price: number;
  priceLabel: string;
  quality?: PartQuality;
  image?: string;
  quantity: number;
}

export interface BookingState {
  deviceType: DeviceType | null;
  brand: Brand | null;
  model: string | null;
  issue: string | null;
  priceLabel: string;
  estimatedTime: string;
  serviceMode: ServiceMode | null;
  date: string | null;
  timeSlot: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes: string;
  images: string[];
}

interface AppState {
  // Auth
  isLoggedIn: boolean;
  userPhone: string | null;
  userName: string | null;
  isAdmin: boolean;
  login: (phone: string, name?: string) => void;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Booking
  booking: BookingState;
  updateBooking: (updates: Partial<BookingState>) => void;
  resetBooking: () => void;

  // UI
  repairModalOpen: boolean;
  setRepairModalOpen: (open: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;

  // Admin
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
}

const initialBooking: BookingState = {
  deviceType: null,
  brand: null,
  model: null,
  issue: null,
  priceLabel: '',
  estimatedTime: '',
  serviceMode: null,
  date: null,
  timeSlot: null,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  address: '',
  notes: '',
  images: [],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      isLoggedIn: false,
      userPhone: null,
      userName: null,
      isAdmin: false,
      login: (phone, name) => set({ isLoggedIn: true, userPhone: phone, userName: name || '' }),
      logout: () => set({ isLoggedIn: false, userPhone: null, userName: null, isAdmin: false }),

      // Cart
      cart: [],
      addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
      clearCart: () => set({ cart: [] }),
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),

      // Booking
      booking: { ...initialBooking },
      updateBooking: (updates) =>
        set((state) => ({ booking: { ...state.booking, ...updates } })),
      resetBooking: () => set({ booking: { ...initialBooking } }),

      // UI
      repairModalOpen: false,
      setRepairModalOpen: (open) => set({ repairModalOpen: open }),
      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      loginModalOpen: false,
      setLoginModalOpen: (open) => set({ loginModalOpen: open }),

      // Admin
      activeAdminTab: 'overview',
      setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
    }),
    {
      name: 'irepairme-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userPhone: state.userPhone,
        userName: state.userName,
        isAdmin: state.isAdmin,
        cart: state.cart,
      }),
    }
  )
);
