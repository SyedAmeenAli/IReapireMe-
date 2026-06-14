import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  userId: string | null;
  userPhone: string | null;
  userEmail: string | null;
  userName: string | null;
  isAdmin: boolean;
  token: string | null;
  login: (
    phoneOrData: string | { phone?: string | null; email?: string | null; name?: string | null; token?: string | null; isAdmin?: boolean; userId?: string | null },
    name?: string,
    email?: string | null,
    token?: string | null,
    isAdmin?: boolean,
    userId?: string | null
  ) => Promise<void>;
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

const syncCartToFirebase = async (userId: string | null, cart: CartItem[]) => {
  if (!userId) return;
  try {
    await setDoc(doc(db, 'carts', userId), { cart });
  } catch (e) {
    console.error("Error syncing cart to Firebase:", e);
  }
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      isLoggedIn: false,
      userId: null,
      userPhone: null,
      userEmail: null,
      userName: null,
      isAdmin: false,
      token: null,
      login: async (phoneOrData, name, email, token, isAdmin, userId) => {
        let resolvedUserId: string | null = null;
        let updateState: any = { isLoggedIn: true };

        if (typeof phoneOrData === 'object' && phoneOrData !== null) {
          resolvedUserId = phoneOrData.userId || null;
          updateState = {
            isLoggedIn: true,
            userId: resolvedUserId,
            userPhone: phoneOrData.phone || null,
            userEmail: phoneOrData.email || null,
            userName: phoneOrData.name || '',
            token: phoneOrData.token || null,
            isAdmin: phoneOrData.isAdmin || false,
          };
        } else {
          resolvedUserId = userId || null;
          updateState = {
            isLoggedIn: true,
            userId: resolvedUserId,
            userPhone: typeof phoneOrData === 'string' ? phoneOrData : null,
            userEmail: email || null,
            userName: name || '',
            token: token || null,
            isAdmin: isAdmin || false,
          };
        }

        set(updateState);

        // Fetch user's cart from Firebase and merge it with current guest cart
        if (resolvedUserId) {
          try {
            const cartDoc = await getDoc(doc(db, 'carts', resolvedUserId));
            const guestCart = useStore.getState().cart;
            
            if (cartDoc.exists()) {
              const firebaseCart = cartDoc.data().cart || [];
              const mergedCartMap = new Map<string, CartItem>();
              
              // Load firebase items first
              firebaseCart.forEach((item: CartItem) => {
                mergedCartMap.set(item.id, item);
              });
              
              // Merge guest items (combining quantity of identical items)
              guestCart.forEach((item: CartItem) => {
                if (mergedCartMap.has(item.id)) {
                  const existing = mergedCartMap.get(item.id)!;
                  mergedCartMap.set(item.id, {
                    ...existing,
                    quantity: existing.quantity + item.quantity
                  });
                } else {
                  mergedCartMap.set(item.id, item);
                }
              });
              
              const finalCart = Array.from(mergedCartMap.values());
              set({ cart: finalCart });
              await syncCartToFirebase(resolvedUserId, finalCart);
            } else {
              // If no cloud cart exists, upload guest cart as initial cloud cart
              if (guestCart.length > 0) {
                await syncCartToFirebase(resolvedUserId, guestCart);
              }
            }
          } catch (e) {
            console.error("Error retrieving or merging cart from Firebase:", e);
          }
        }
      },
      logout: () => set({
        isLoggedIn: false,
        userId: null,
        userPhone: null,
        userEmail: null,
        userName: null,
        isAdmin: false,
        token: null,
      }),

      // Cart
      cart: [],
      addToCart: (item) => set((state) => {
        const newCart = [...state.cart, item];
        syncCartToFirebase(state.userId, newCart);
        return { cart: newCart };
      }),
      removeFromCart: (id) => set((state) => {
        const newCart = state.cart.filter((i) => i.id !== id);
        syncCartToFirebase(state.userId, newCart);
        return { cart: newCart };
      }),
      clearCart: () => set((state) => {
        syncCartToFirebase(state.userId, []);
        return { cart: [] };
      }),
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
        userId: state.userId,
        userPhone: state.userPhone,
        userEmail: state.userEmail,
        userName: state.userName,
        isAdmin: state.isAdmin,
        token: state.token,
        cart: state.cart,
      }),
    }
  )
);
