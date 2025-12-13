/**
 * Stripe Integration Hook
 * 
 * This hook provides the structure for Stripe payment integration.
 * To fully implement Stripe:
 * 
 * 1. Install Stripe: npm install @stripe/stripe-js @stripe/react-stripe-js
 * 2. Create a Stripe account at https://stripe.com
 * 3. Get your publishable key from the Stripe dashboard
 * 4. Set up a backend endpoint to create checkout sessions
 * 5. Replace the placeholder functions below with actual Stripe calls
 * 
 * For the 3-day trial with card collection upfront (like Speechify):
 * - Use Stripe Checkout in "subscription" mode with trial_period_days: 3
 * - Set payment_method_collection: 'always' to require card upfront
 */

import { useState } from "react";

interface StripeConfig {
  publishableKey: string;
  priceId: string; // Your Stripe price ID for the subscription
}

// TODO: Replace with your actual Stripe keys
const STRIPE_CONFIG: StripeConfig = {
  publishableKey: "pk_test_YOUR_PUBLISHABLE_KEY",
  priceId: "price_YOUR_PRICE_ID",
};

interface UseStripeReturn {
  isLoading: boolean;
  error: string | null;
  startCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

export const useStripe = (): UseStripeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start Stripe Checkout for subscription with 3-day free trial
   * 
   * Backend implementation needed:
   * ```js
   * // Your API endpoint
   * const session = await stripe.checkout.sessions.create({
   *   mode: 'subscription',
   *   payment_method_types: ['card'],
   *   line_items: [{
   *     price: 'price_YOUR_PRICE_ID',
   *     quantity: 1,
   *   }],
   *   subscription_data: {
   *     trial_period_days: 3,
   *   },
   *   payment_method_collection: 'always', // Collect card upfront
   *   success_url: 'https://yoursite.com/success',
   *   cancel_url: 'https://yoursite.com/cancel',
   * });
   * ```
   */
  const startCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId: STRIPE_CONFIG.priceId }),
      // });
      // const { sessionUrl } = await response.json();
      // window.location.href = sessionUrl;

      // Placeholder: Show alert for demo
      console.log("Stripe checkout would open here");
      alert(
        "Stripe Integration Required\n\n" +
        "To enable payments:\n" +
        "1. Set up Stripe account\n" +
        "2. Add your API keys\n" +
        "3. Create a backend endpoint\n\n" +
        "See src/hooks/useStripe.ts for instructions."
      );
    } catch (err) {
      setError("Failed to start checkout. Please try again.");
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open Stripe Customer Portal for subscription management
   */
  const openCustomerPortal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/create-portal-session', {
      //   method: 'POST',
      // });
      // const { url } = await response.json();
      // window.location.href = url;

      console.log("Stripe customer portal would open here");
    } catch (err) {
      setError("Failed to open customer portal.");
      console.error("Portal error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    startCheckout,
    openCustomerPortal,
  };
};

/**
 * Example: Stripe Elements Setup (for embedded payment form)
 * 
 * In your App.tsx or main component:
 * 
 * ```tsx
 * import { Elements } from '@stripe/react-stripe-js';
 * import { loadStripe } from '@stripe/stripe-js';
 * 
 * const stripePromise = loadStripe('pk_test_YOUR_KEY');
 * 
 * function App() {
 *   return (
 *     <Elements stripe={stripePromise}>
 *       <YourPaymentComponent />
 *     </Elements>
 *   );
 * }
 * ```
 */

export default useStripe;

