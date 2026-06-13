import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash,
      phone,
      address,
      role: UserRole.CUSTOMER, // Default role
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is populated by auth middleware
    const user = await User.findById((req as any).user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const formatPhone = (p: string): string => {
  let cleaned = p.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (!p.startsWith('+')) {
    return `+${cleaned}`;
  }
  return p;
};

const loginOrCreateUser = async (phone: string, res: Response) => {
  const userPhone = formatPhone(phone);
  let user = await User.findOne({ phone: userPhone });

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const randomPassword = Math.random().toString(36).substring(2, 10);
    const passwordHash = await bcrypt.hash(randomPassword, salt);
    
    user = new User({
      name: 'Customer',
      email: `${userPhone.replace('+', '')}@irepairme.temp`,
      passwordHash,
      phone: userPhone,
      role: UserRole.CUSTOMER
    });
    await user.save();
  }

  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role
    }
  });
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Graceful fallback to mock if credentials are not configured
    if (!accountSid || !authToken || !serviceSid || accountSid.includes('YOUR_') || authToken.includes('YOUR_') || serviceSid.includes('YOUR_')) {
      console.warn('Twilio credentials are not configured. Falling back to mock OTP send.');
      res.status(200).json({
        success: true,
        message: 'Mock OTP sent (Twilio credentials missing)',
        isMock: true
      });
      return;
    }

    const formattedPhone = formatPhone(phone);
    const authHeader = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');

    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('Channel', 'sms');

    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = (await response.json()) as any;

    if (response.ok) {
      res.status(200).json({
        success: true,
        message: 'Verification code sent successfully',
        sid: data.sid
      });
    } else {
      res.status(400).json({
        success: false,
        message: data.message || 'Failed to send verification code'
      });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Server error during OTP send' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ message: 'Phone and OTP code are required' });
      return;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Graceful fallback to mock if credentials are not configured
    if (!accountSid || !authToken || !serviceSid || accountSid.includes('YOUR_') || authToken.includes('YOUR_') || serviceSid.includes('YOUR_')) {
      console.warn('Twilio credentials are not configured. Falling back to mock verification.');
      await loginOrCreateUser(phone, res);
      return;
    }

    const formattedPhone = formatPhone(phone);
    const authHeader = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');

    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('Code', otp);

    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = (await response.json()) as any;

    if (response.ok && (data.status === 'approved' || data.valid === true)) {
      await loginOrCreateUser(phone, res);
    } else {
      res.status(400).json({
        success: false,
        message: data.message || 'OTP verification check failed'
      });
    }
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

