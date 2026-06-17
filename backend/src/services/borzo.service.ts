import crypto from 'crypto';
import axios from 'axios';

interface LatLng {
  lat: number;
  lng: number;
}

interface QuoteResponse {
  fee: number;
  expiresAt: number;
  quoteToken: string;
}

class BorzoService {
  private quoteCache = new Map<string, { fee: number; expiresAt: number }>();
  
  // Hyderabad Bounding Box Approximation
  private HYD_BOUNDS = {
    minLat: 17.10,
    maxLat: 17.65,
    minLng: 78.10,
    maxLng: 78.80
  };

  private STORE_LAT = parseFloat(process.env.STORE_LAT || '17.3850');
  private STORE_LNG = parseFloat(process.env.STORE_LNG || '78.4867');
  private STORE_ADDRESS = process.env.STORE_ADDRESS || 'iRepairMe Store, Hyderabad';
  private STORE_PHONE = process.env.STORE_PHONE || '9999999999';

  private getBaseUrl(): string {
    return process.env.BORZO_ENV === 'production' 
      ? 'https://robot-in.borzodelivery.com/api/business/1.8' 
      : 'https://robotapitest-in.borzodelivery.com/api/business/1.8';
  }

  private getHeaders() {
    const token = process.env.BORZO_AUTH_TOKEN;
    if (!token) {
      console.warn('⚠️ BORZO_AUTH_TOKEN is missing! Real API calls will fail.');
    }
    return {
      'Content-Type': 'application/json',
      'X-DV-Auth-Token': token || 'MOCK_TOKEN'
    };
  }

  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
  }

  private isWithinHyderabad(location: LatLng): boolean {
    return (
      location.lat >= this.HYD_BOUNDS.minLat &&
      location.lat <= this.HYD_BOUNDS.maxLat &&
      location.lng >= this.HYD_BOUNDS.minLng &&
      location.lng <= this.HYD_BOUNDS.maxLng
    );
  }

  public isWithinOperatingHours(scheduledTime: Date): boolean {
    const hour = scheduledTime.getHours();
    const day = scheduledTime.getDay(); // 0 = Sunday
    // Mon-Sat, 9 AM to 7 PM (19:00)
    return day !== 0 && hour >= 9 && hour < 19;
  }

  public async getQuote(pickup: LatLng, dropoff: LatLng, dropoffAddress: string): Promise<QuoteResponse> {
    if (!this.isWithinHyderabad(pickup) || !this.isWithinHyderabad(dropoff)) {
      throw new Error('OUT_OF_BOUNDS');
    }

    const cacheKey = `${pickup.lat},${pickup.lng}|${dropoff.lat},${dropoff.lng}`;
    const cached = this.quoteCache.get(cacheKey);

    let fee: number;
    let expiresAt: number;

    if (cached && Date.now() < cached.expiresAt) {
      fee = cached.fee;
      expiresAt = cached.expiresAt;
    } else {
      if (process.env.BORZO_AUTH_TOKEN) {
        // Real API Call
        try {
          const response = await axios.post(`${this.getBaseUrl()}/calculate-order`, {
            matter: 'Spare Parts and Electronics Repair',
            points: [
              {
                address: this.STORE_ADDRESS,
                latitude: pickup.lat.toString(),
                longitude: pickup.lng.toString(),
                contact_person: { phone: this.formatPhone(this.STORE_PHONE) }
              },
              {
                address: dropoffAddress,
                latitude: dropoff.lat.toString(),
                longitude: dropoff.lng.toString(),
                contact_person: { phone: this.formatPhone('9999999999') } // required for warnings
              }
            ]
          }, { headers: this.getHeaders() });

          if (response.data.is_successful) {
            fee = parseFloat(response.data.order.payment_amount); // Use payment_amount, not delivery_fee_amount
          } else {
            throw new Error(response.data.errors ? response.data.errors.join(', ') : 'Borzo Quote API failed');
          }
        } catch (err: any) {
          console.error('Borzo Quote Error:', err.response?.data || err.message);
          throw new Error('Failed to fetch quote from logistics provider');
        }
      } else {
        // Mock fallback if no API key
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const dist = Math.sqrt(Math.pow(pickup.lat - dropoff.lat, 2) + Math.pow(pickup.lng - dropoff.lng, 2));
        fee = Math.round(50 + (dist * 10000));
        if (Math.random() > 0.9) fee += Math.round(fee * 0.2); // 20% mock surge
      }

      expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes TTL
      this.quoteCache.set(cacheKey, { fee, expiresAt });
    }

    const quoteToken = this.generateQuoteToken(dropoff.lat, dropoff.lng, fee, expiresAt);
    return { fee, expiresAt, quoteToken };
  }

  private generateQuoteToken(lat: number, lng: number, fee: number, expiresAt: number): string {
    const secret = process.env.QUOTE_SECRET || 'MOCK_QUOTE_SECRET';
    return crypto
      .createHmac('sha256', secret)
      .update(`${lat},${lng},${fee},${expiresAt}`)
      .digest('hex');
  }

  public verifyQuoteToken(lat: number, lng: number, fee: number, expiresAt: number, token: string): boolean {
    if (Date.now() > expiresAt) return false;
    const expectedToken = this.generateQuoteToken(lat, lng, fee, expiresAt);
    return expectedToken === token;
  }

  public async createOrder(
    pickupAddress: string, 
    pickupPhone: string, 
    dropoffAddress: string, 
    dropoffPhone: string, 
    scheduledTime?: string
  ): Promise<string> {
    if (scheduledTime) {
      const parsedTime = new Date(scheduledTime);
      if (!this.isWithinOperatingHours(parsedTime)) {
        throw new Error('OUT_OF_OPERATING_HOURS');
      }
    }

    if (process.env.BORZO_AUTH_TOKEN) {
      try {
        const response = await axios.post(`${this.getBaseUrl()}/create-order`, {
          matter: 'Spare Parts and Electronics Repair',
          points: [
            {
              address: pickupAddress,
              contact_person: { phone: this.formatPhone(pickupPhone) }
            },
            {
              address: dropoffAddress,
              contact_person: { phone: this.formatPhone(dropoffPhone) }
            }
          ]
        }, { headers: this.getHeaders() });

        if (response.data.is_successful) {
          const borzoOrderId = response.data.order.order_id.toString();
          console.log(`[BorzoService] Dispatch Triggered successfully: ${borzoOrderId}`);
          console.log(`[MSG91 API] Sending tracking SMS to ${pickupPhone} & ${dropoffPhone} for order ${borzoOrderId}`);
          return borzoOrderId;
        } else {
          throw new Error(response.data.errors ? response.data.errors.join(', ') : 'Borzo Create API failed');
        }
      } catch (err: any) {
        console.error('Borzo Create Order Error:', err.response?.data || err.message);
        throw new Error('Failed to dispatch logistics provider');
      }
    } else {
      // Mock Fallback
      await new Promise(resolve => setTimeout(resolve, 800));
      const borzoOrderId = 'BRZ' + crypto.randomBytes(4).toString('hex').toUpperCase();
      console.log(`[BorzoService - MOCK] Dispatch Triggered: ${borzoOrderId}`);
      console.log(`[MSG91 API - MOCK] Sending tracking SMS to ${pickupPhone} & ${dropoffPhone} for order ${borzoOrderId}`);
      return borzoOrderId;
    }
  }

  public getStoreLocation() {
    return { lat: this.STORE_LAT, lng: this.STORE_LNG };
  }
}

export default new BorzoService();
