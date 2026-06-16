import { Request, Response } from 'express';
import borzoService from '../services/borzo.service';

export const getDeliveryQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dropLat, dropLng, type } = req.body; // type can be 'repair' or 'spare'

    if (!dropLat || !dropLng) {
      res.status(400).json({ message: 'Missing destination coordinates' });
      return;
    }

    const storeLocation = borzoService.getStoreLocation();
    const customerLocation = { lat: parseFloat(dropLat), lng: parseFloat(dropLng) };

    let pickup, dropoff;

    // For repairs, pickup from customer, drop to store
    // For spare parts, pickup from store, drop to customer
    if (type === 'repair') {
      pickup = customerLocation;
      dropoff = storeLocation;
    } else {
      pickup = storeLocation;
      dropoff = customerLocation;
    }

    try {
      const quote = await borzoService.getQuote(pickup, dropoff, type === 'repair' ? 'Customer Address' : 'Customer Address');
      // We also need to send the dropLat/dropLng so the frontend can store them and 
      // pass them back during checkout to verify the token.
      res.status(200).json({
        success: true,
        ...quote,
        lat: customerLocation.lat,
        lng: customerLocation.lng
      });
      return;
    } catch (err: any) {
      if (err.message === 'OUT_OF_BOUNDS') {
        res.status(400).json({ success: false, message: 'Pickup or dropoff is outside our service area' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch quote' });
      }
    }
  } catch (error) {
    console.error('Error in getDeliveryQuote:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const handleBorzoWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const borzoUpdate = req.body;
    console.log('[Borzo Webhook] Received status update:', JSON.stringify(borzoUpdate, null, 2));

    // Here you can update your database Order/RepairTicket with the live delivery status
    // For example:
    // const orderId = borzoUpdate.order?.order_id;
    // const status = borzoUpdate.order?.delivery?.status;
    
    // Always respond with 200 OK so Borzo knows the webhook was received
    res.status(200).send('OK');
  } catch (error) {
    console.error('[Borzo Webhook] Error processing update:', error);
    res.status(500).send('Internal Server Error');
  }
};
