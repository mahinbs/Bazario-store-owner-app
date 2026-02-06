import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, Mail, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from '@/services/api';

interface StoreOwner {
    id: string;
    storeName: string;
    ownerName: string;
    phone: string;
    email?: string;
    phone_verified: boolean;
}

interface OTPLoginProps {
    onSuccess: (storeOwner: StoreOwner) => void;
    onClose?: () => void;
}

type LoginStep = 'method' | 'phone' | 'email' | 'otp';

const OTPLogin: React.FC<OTPLoginProps> = ({ onSuccess, onClose }) => {
    const { toast } = useToast();
    const [step, setStep] = useState<LoginStep>('phone');
    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const formatPhoneNumber = (phone: string) => {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        // Format as per Indian mobile number
        if (cleaned.length <= 10) {
            return cleaned;
        }
        return cleaned.slice(-10); // Take last 10 digits
    };

    // Normalize phone number to 91XXXXXXXXXX format for backend
    const normalizePhoneNumber = (phoneNumber: string) => {
        // Remove all spaces, dashes, and special characters
        let cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
        
        // Remove leading + if present
        cleaned = cleaned.replace(/^\+/, '');
        
        // If starts with 91, keep it
        if (cleaned.startsWith('91')) {
            return cleaned;
        }
        
        // If doesn't start with 91, add it
        return '91' + cleaned;
    };

    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
        return phoneRegex.test(phone);
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const checkPhoneExists = async (phone: string) => {
        try {
            const response = await authAPI.checkPhoneExists(phone);
            return response.success ? (response.data?.exists || false) : false;
        } catch (error) {
            console.error('Check phone error:', error);
            return false;
        }
    };

    const sendOTP = async (phone: string, purpose: 'login' | 'signup' = 'login') => {
        try {
            setLoading(true);
            const response = await authAPI.sendOTP(phone, purpose);

            if (response.success) {
                setOtpSent(true);
                setTimeLeft(60); // 60 seconds cooldown
                setStep('otp');
                toast({
                    title: "OTP Sent!",
                    description: `Verification code sent to ${phone}`,
                });
            } else {
                toast({
                    title: "Error",
                    description: typeof response.error === 'string' ? response.error : 'Failed to send OTP',
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            toast({
                title: "Error",
                description: 'Network error. Please try again.',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!otp || otp.length !== 4) {
            toast({
                title: "Invalid OTP",
                description: 'Please enter a valid 4-digit OTP',
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            // Normalize phone number to 91XXXXXXXXXX format for backend
            const normalizedPhone = normalizePhoneNumber(phoneNumber);
            const response = await authAPI.verifyOTP(
                normalizedPhone,
                otp,
                'login'
            );

            if (response.success) {
                toast({
                    title: "Success!",
                    description: response.message,
                });
                onSuccess(response.data?.storeOwner);
            } else {
                toast({
                    title: "Verification Failed",
                    description: typeof response.error === 'string' ? response.error : 'Invalid OTP',
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            toast({
                title: "Error",
                description: 'Network error. Please try again.',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneLogin = async () => {
        const cleanPhone = formatPhoneNumber(phoneNumber);

        if (!validatePhoneNumber(cleanPhone)) {
            toast({
                title: "Invalid Phone Number",
                description: 'Please enter a valid 10-digit mobile number',
                variant: "destructive"
            });
            return;
        }

        // Normalize phone number to 91XXXXXXXXXX format for backend
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Send OTP for login - let backend handle if store owner exists
        await sendOTP(normalizedPhone, 'login');
    };

    const handleEmailLogin = async () => {
        if (!validateEmail(email) || !password) {
            toast({
                title: "Invalid Credentials",
                description: 'Please enter valid email and password',
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const response = await authAPI.login({ email, password });

            if (response.success) {
                onSuccess(response.data.storeOwner);
            } else {
                toast({
                    title: "Login Failed",
                    description: response.error?.message || 'Invalid credentials',
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: 'Network error. Please try again.',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };


    const resendOTP = async () => {
        if (timeLeft > 0) return;
        
        await sendOTP(phoneNumber, 'login');
    };

    const renderMethodSelection = () => (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-orange-600">Welcome Back!</CardTitle>
                <CardDescription>Choose your login method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    onClick={() => setLoginMethod('phone')}
                    variant={loginMethod === 'phone' ? 'default' : 'outline'}
                    className="w-full h-12 text-lg"
                >
                    <Phone className="w-5 h-5 mr-2" />
                    Login with Phone
                </Button>
                <Button
                    onClick={() => setLoginMethod('email')}
                    variant={loginMethod === 'email' ? 'default' : 'outline'}
                    className="w-full h-12 text-lg"
                >
                    <Mail className="w-5 h-5 mr-2" />
                    Login with Email
                </Button>
                <div className="text-center">
                    <Button
                        onClick={() => setStep(loginMethod)}
                        className="w-full"
                        disabled={loading}
                    >
                        Continue
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderPhoneInput = () => (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-orange-600">Enter Phone Number</CardTitle>
                <CardDescription>We'll send you a verification code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            type="tel"
                            placeholder="9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                            className="pl-10"
                            maxLength={10}
                        />
                    </div>
                </div>
                <Button
                    onClick={handlePhoneLogin}
                    className="w-full"
                    disabled={loading || !phoneNumber}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                </Button>
            </CardContent>
        </Card>
    );

    const renderEmailInput = () => (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-orange-600">Email Login</CardTitle>
                <CardDescription>Enter your email and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            type="email"
                            placeholder="owner@store.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                        <Eye className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button
                        onClick={() => setStep('method')}
                        variant="outline"
                        className="flex-1"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button
                        onClick={handleEmailLogin}
                        className="flex-1"
                        disabled={loading || !email || !password}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderOTPInput = () => (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-orange-600">Enter OTP</CardTitle>
                <CardDescription>We sent a 4-digit code to {phoneNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Code</label>
                    <Input
                        type="text"
                        placeholder="1234"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="text-center text-2xl tracking-widest"
                        maxLength={4}
                    />
                </div>
                
                {timeLeft > 0 && (
                    <Alert>
                        <AlertDescription>
                            Resend OTP in {timeLeft} seconds
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex space-x-2">
                    <Button
                        onClick={() => setStep('phone')}
                        variant="outline"
                        className="flex-1"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button
                        onClick={verifyOTP}
                        className="flex-1"
                        disabled={loading || otp.length !== 4}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                    </Button>
                </div>

                {timeLeft === 0 && (
                    <Button
                        onClick={resendOTP}
                        variant="link"
                        className="w-full"
                    >
                        Resend OTP
                    </Button>
                )}
            </CardContent>
        </Card>
    );


    return (
        <div className="w-full">
            {step === 'phone' && renderPhoneInput()}
            {step === 'otp' && renderOTPInput()}
        </div>
    );
};

export default OTPLogin;
