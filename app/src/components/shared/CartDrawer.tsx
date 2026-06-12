import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Link } from 'react-router';

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cart, removeFromCart, addToCart, isLoggedIn, setLoginModalOpen } = useStore();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h3 className="text-h-sm font-semibold text-neutral-950 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({cart.length})
          </h3>
          <button onClick={() => setCartOpen(false)} className="p-1 rounded-md hover:bg-neutral-100">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-b-lg text-neutral-500 font-medium mb-1">Your cart is empty</p>
              <p className="text-b-sm text-neutral-400 mb-6">Add items to get started</p>
              <Link
                to="/shop"
                onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Browse Spare Parts
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border border-neutral-200 rounded-lg">
                  <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-b-sm font-medium text-neutral-950 truncate">{item.name}</h4>
                    {item.deviceModel && (
                      <p className="text-b-xs text-neutral-500">{item.deviceBrand} {item.deviceModel}</p>
                    )}
                    {item.issue && <p className="text-b-xs text-neutral-500">{item.issue}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              const updated = { ...item, quantity: item.quantity - 1 };
                              removeFromCart(item.id);
                              addToCart(updated);
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-b-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const updated = { ...item, quantity: item.quantity + 1 };
                            removeFromCart(item.id);
                            addToCart(updated);
                          }}
                          className="w-6 h-6 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-b-sm font-semibold">&#8377;{(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-b-sm text-neutral-600">Subtotal</span>
              <span className="text-h-sm font-semibold">&#8377;{total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  setLoginModalOpen(true);
                  return;
                }
                setCartOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
