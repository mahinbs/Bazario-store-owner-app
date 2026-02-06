import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, User, Mail, Phone, MapPin, Eye, EyeOff, Building, FileText, Truck, Camera, Plus, X, Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import OTPLogin from "@/components/OTPLogin";
import { authAPI, isAuthenticated, getUserData, type SignupData } from "@/services/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true);
        navigate('/dashboard');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success && response.data) {
        setIsLoggedIn(true);
        toast({
          title: "🎉 Welcome Back!",
          description: "Successfully logged in to your store dashboard",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "❌ Login Failed",
          description: response.error?.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Login Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (formData: SignupData) => {
    try {
      const response = await authAPI.signup(formData);

      if (response.success) {
        toast({
          title: "🎉 Registration Successful!",
          description: "Please check your email to verify your account before logging in.",
        });
        setAuthMode('login');
      } else {
        toast({
          title: "❌ Registration Failed",
          description: response.error?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOTPSuccess = (storeOwner: any) => {
    setIsLoggedIn(true);
    toast({
      title: "🎉 Welcome Back!",
      description: "Successfully logged in to your store dashboard",
    });
    navigate('/dashboard');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bazario-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg mx-auto animate-pulse">
              <Store className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground">Loading your store dashboard...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      {authMode === 'login' ? (
        <LoginScreen
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthMode('signup')}
          onOTPSuccess={handleOTPSuccess}
        />
      ) : (
        <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setAuthMode('login')} />
      )}
    </ResponsiveLayout>
  );
};

const LoginScreen = ({ onLogin, onSwitchToSignup, onOTPSuccess }: { onLogin: (email: string, password: string) => void; onSwitchToSignup: () => void; onOTPSuccess: (storeOwner: any) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await onLogin(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bazario-primary-start/10 rounded-full animate-pulse blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-bazario-primary-end/10 rounded-full animate-pulse blur-3xl" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-sm shadow-xl border-none bg-card/95 backdrop-blur-sm relative z-10 animate-fade-in rounded-2xl">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto w-16 h-16 bazario-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Store className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-bazario-primary-start to-bazario-primary-end">
            Store Manager
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base mt-2">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-8">
          {/* Login Method Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button
              type="button"
              variant={loginMethod === 'email' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('email')}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              type="button"
              variant={loginMethod === 'phone' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('phone')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </Button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-input focus:ring-2 focus:ring-primary/20 rounded-xl bg-background"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-input focus:ring-2 focus:ring-primary/20 rounded-xl bg-background"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 btn-gradient-primary text-white font-medium rounded-xl shadow-lg btn-animate"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In to Store"
                )}
              </Button>
            </form>
          ) : (
            <OTPLogin onSuccess={onOTPSuccess} />
          )}

          <div className="text-center bg-muted/50 p-4 rounded-xl border border-border">
            <p className="text-sm text-foreground mb-2 font-medium">📧 Email Verification Required</p>
            <p className="text-xs text-muted-foreground">
              After registration, please check your email and verify your account before logging in.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have a store account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-primary hover:text-primary-violet font-medium underline transition-colors"
              >
                Register your store
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SignupScreen = ({ onSignup, onSwitchToLogin }: { onSignup: (formData: any) => void; onSwitchToLogin: () => void }) => {
  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    // Location Details
    latitude: "",
    longitude: "",
    // Business Details
    businessType: "",
    category: "",
    description: "",
    gstNumber: "",
    panNumber: "",
    // Store Images
    storeImages: [] as string[],
    storeImageFiles: [] as File[],
    // Service & Delivery Settings
    serviceTypes: ["delivery"] as string[],
    deliveryRadius: "10",
    minOrderAmount: "0",
    deliveryFee: "25",
    estimatedDeliveryTime: "30",
    // Payment Details
    upiId: "",
    bankAccountNumber: "",
    bankName: "",
    ifscCode: "",
    accountHolderName: "",
    // Legal
    agreeToTerms: false,
    agreeToCommission: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const { toast } = useToast();






  // Send OTP for phone verification
  const sendOTP = async () => {
    if (!formData.phone) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    // Normalize phone number
    const normalizedPhoneValue = normalizePhoneNumber(formData.phone);
    setNormalizedPhone(normalizedPhoneValue);

    // Validate normalized phone number (should be 91XXXXXXXXXX - 13 digits)
    if (!/^91\d{10}$/.test(normalizedPhoneValue)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.sendOTP(normalizedPhoneValue, 'signup');

      if (response.success) {
        setOtpSent(true);
        setTimeLeft(300);
        toast({
          title: "OTP Sent",
          description: `OTP sent to +91 ${formData.phone}`
        });
      } else {
        toast({
          title: "Failed to Send OTP",
          description: response.message || 'Please try again',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: 'Please check your connection and try again',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer for OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 10);
  };

  // Normalize phone number to 91XXXXXXXXXX format
  const normalizePhoneNumber = (phoneNumber) => {
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

  // Verify phone number with OTP
  const verifyPhoneNumber = async () => {
    if (!otp || otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setPhoneVerifying(true);
    try {
      // Use "signup" as purpose to distinguish if needed, though strictly it's phone verification
      const response = await authAPI.verifyOTP(normalizedPhone, otp, 'signup');

      if (response.success) {
        setPhoneVerified(true);
        setOtpSent(false);
        setOtp('');
        setTimeLeft(0);
        toast({
          title: "Phone Verified",
          description: "Your phone number has been verified successfully!",
        });
      } else {
        throw new Error(response.error?.message || 'Failed to verify phone number');
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setPhoneVerifying(false);
    }
  };

  // Verify OTP and complete registration
  const verifyOTPAndRegister = async () => {
    if (!otp || otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // First verify the OTP and Register
      const otpResult = await authAPI.verifyOTP(
        normalizedPhone,
        otp,
        'signup',
        {
          storeName: formData.storeName,
          ownerName: formData.ownerName,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          businessType: formData.businessType,
          category: formData.category,
          description: formData.description,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber,
          serviceTypes: formData.serviceTypes,
          deliveryRadius: formData.deliveryRadius,
          minOrderAmount: formData.minOrderAmount,
          deliveryFee: formData.deliveryFee,
          estimatedDeliveryTime: formData.estimatedDeliveryTime,
          upiId: formData.upiId,
          bankAccountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
          agreeToTerms: formData.agreeToTerms,
          agreeToCommission: formData.agreeToCommission
        }
      );

      // The OTP verification already handled the registration
      if (otpResult.success) {
        const emailMessage = otpResult.emailVerificationSent
          ? " Please check your email for verification."
          : "";

        toast({
          title: "Registration Successful",
          description: `Welcome to Bazario Store Hub, ${formData.ownerName}!${emailMessage} Please login to continue.`
        });

        // Reset form and redirect to login
        setStep('form');
        setOtpSent(false);
        setOtp('');
        setTimeLeft(0);
        // Reset form data
        setFormData({
          storeName: '',
          ownerName: '',
          email: '',
          phone: '',
          address: '',
          password: '',
          confirmPassword: '',
          latitude: '',
          longitude: '',
          businessType: '',
          category: '',
          description: '',
          gstNumber: '',
          panNumber: '',
          storeImages: [],
          storeImageFiles: [],
          serviceTypes: ['delivery'],
          deliveryRadius: '10',
          minOrderAmount: '0',
          deliveryFee: '25',
          estimatedDeliveryTime: '30',
          upiId: '',
          bankAccountNumber: '',
          bankName: '',
          ifscCode: '',
          accountHolderName: '',
          agreeToTerms: false,
          agreeToCommission: false
        });

        // Switch to login (optional, based on UX preference, user might need explicit switch)
        onSwitchToLogin();

      } else {
        throw new Error(otpResult.error?.message || 'Failed to create account');
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setTimeLeft(300);
    await sendOTP();
  };

  const handleServiceTypeChange = (serviceType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: checked
        ? [...prev.serviceTypes, serviceType]
        : prev.serviceTypes.filter(type => type !== serviceType)
    }));
  };

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = formData.storeImageFiles.length + newFiles.length;

    if (totalFiles > 5) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 5 images total",
        variant: "destructive"
      });
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        storeImageFiles: [...prev.storeImageFiles, ...validFiles]
      }));
    }

    // Reset the input
    event.target.value = '';
  };

  const handleRemoveImageFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      storeImageFiles: prev.storeImageFiles.filter((_, i) => i !== index)
    }));
  };

  const uploadStoreImages = async (): Promise<string[]> => {
    if (formData.storeImageFiles.length === 0) {
      return [];
    }

    setImageUploading(true);

    try {
      const response = await authAPI.uploadRegistrationImages(formData.storeImageFiles);

      if (response.success && response.data?.images) {
        const imageUrls = response.data.images.map((img: any) => img.imageUrl);

        toast({
          title: "Images uploaded successfully",
          description: `Uploaded ${imageUrls.length} image(s)`,
        });

        return imageUrls;
      } else {
        throw new Error(response.error?.message || 'Failed to upload images');
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: "destructive"
      });
      return [];
    } finally {
      setImageUploading(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser.');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      setFormData(prev => ({
        ...prev,
        latitude: latitude.toString(),
        longitude: longitude.toString()
      }));

      toast({
        title: "✅ Location Retrieved",
        description: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "❌ Location Error",
        description: "Could not get your location. Please enter coordinates manually.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "❌ Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "❌ Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "❌ Terms & Conditions",
        description: "Please agree to the Terms & Conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    // Check if phone is verified
    if (!phoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before registering.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToCommission) {
      toast({
        title: "❌ Platform Fee Agreement",
        description: "Please agree to the 15% platform fee to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate IFSC code length
    if (formData.ifscCode.length < 8 || formData.ifscCode.length > 11) {
      toast({
        title: "❌ Invalid IFSC Code",
        description: "IFSC code should be 8-11 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Upload store images first if any
    const uploadedImageUrls = await uploadStoreImages();

    // Prepare data for API (exclude confirmPassword and ensure proper format)
    const signupData = {
      email: formData.email,
      password: formData.password,
      storeName: formData.storeName,
      ownerName: formData.ownerName,
      phone: formData.phone,
      address: formData.address,
      // Location data
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      // Business details
      businessType: formData.businessType,
      category: formData.category,
      description: formData.description || undefined,
      gstNumber: formData.gstNumber || undefined,
      panNumber: formData.panNumber || undefined,
      // Store images
      storeImages: uploadedImageUrls,
      // Service & delivery settings
      serviceTypes: formData.serviceTypes,
      deliveryRadius: parseInt(formData.deliveryRadius),
      minOrderAmount: parseFloat(formData.minOrderAmount),
      deliveryFee: parseFloat(formData.deliveryFee),
      estimatedDeliveryTime: parseInt(formData.estimatedDeliveryTime),
      // Payment details
      upiId: formData.upiId,
      bankAccountNumber: formData.bankAccountNumber,
      bankName: formData.bankName,
      ifscCode: formData.ifscCode,
      accountHolderName: formData.accountHolderName,
      // Legal
      agreeToTerms: formData.agreeToTerms,
      agreeToCommission: formData.agreeToCommission
    };

    // Call the normal signup function after phone verification
    await onSignup(signupData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-200 to-orange-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm relative z-10 animate-fade-in rounded-2xl">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Register Your Store
          </CardTitle>
          <CardDescription className="text-gray-600 text-base mt-2">
            Join Butterfly Delivery platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-8 max-h-[80vh] overflow-y-auto">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-sm font-medium text-gray-700">Store Name *</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="storeName"
                    type="text"
                    placeholder="Enter your store name"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="h-11 pl-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-sm font-medium text-gray-700">Owner Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="ownerName"
                    type="text"
                    placeholder="Enter owner's full name"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="h-11 pl-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-11 pl-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                      className="h-11 pl-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                      maxLength={10}
                      required
                      disabled={isLoading || phoneVerified}
                    />
                    {phoneVerified && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!phoneVerified && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={sendOTP}
                        disabled={!formData.phone || isLoading || otpSent}
                        className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : otpSent ? (
                          "Resend OTP"
                        ) : (
                          "Verify Phone"
                        )}
                      </Button>
                    </div>
                  )}

                  {otpSent && !phoneVerified && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter 4-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="flex-1 h-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-center"
                          maxLength={4}
                        />
                        <Button
                          type="button"
                          onClick={verifyPhoneNumber}
                          disabled={!otp || otp.length !== 4 || phoneVerifying}
                          className="px-4 h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                        >
                          {phoneVerifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                      {timeLeft > 0 && (
                        <p className="text-sm text-gray-500 text-center">
                          Resend OTP in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Store Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter store address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="h-11 pl-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Location Coordinates Section */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                  Store Location
                </h3>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-700 mb-3">
                      📍 We need your exact location to show your store to nearby customers
                    </p>
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation || isLoading}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      {isGettingLocation ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Getting Location...
                        </div>
                      ) : (
                        "📍 Get My Current Location"
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 29.3961728"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 73.4363648"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-11 pr-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-11 pr-10 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Business Details Section */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-orange-600" />
                  Business Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="businessType" className="text-sm font-medium text-gray-700">Business Type *</Label>
                      <select
                        id="businessType"
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        className="h-11 w-full px-3 border-2 border-gray-200 focus:border-orange-400 rounded-xl bg-white"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select business type</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="cafe">Cafe</option>
                        <option value="bakery">Bakery</option>
                        <option value="fast_food">Fast Food</option>
                        <option value="sweet_shop">Sweet Shop</option>
                        <option value="cloud_kitchen">Cloud Kitchen</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="h-11 w-full px-3 border-2 border-gray-200 focus:border-orange-400 rounded-xl bg-white"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select category</option>
                        <option value="restaurant">🍽️ Restaurants</option>
                        <option value="grocery">🛒 Grocery</option>
                        <option value="bakery">🧁 Bakery</option>
                        <option value="pharmacy">💊 Pharmacy</option>
                        <option value="mart">🏪 Mart</option>
                        <option value="meat">🥩 Meat & Seafood</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Store Description</Label>
                    <textarea
                      id="description"
                      placeholder="Brief description of your store (optional)"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full h-20 px-3 py-2 border-2 border-gray-200 focus:border-orange-400 rounded-xl resize-none"
                      disabled={isLoading}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500">{formData.description.length}/200 characters</p>
                  </div>

                  {/* Store Images Section */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Store Images (Optional)
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">Upload images of your store to attract more customers (Max 5 images, 5MB each)</p>

                    <div className="space-y-3">
                      {/* File Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          id="storeImages"
                          multiple
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          disabled={isLoading || imageUploading || formData.storeImageFiles.length >= 5}
                          className="hidden"
                        />
                        <label
                          htmlFor="storeImages"
                          className={`
                          w-full h-12 border-2 border-dashed border-orange-300 hover:border-orange-400 
                          text-orange-600 hover:text-orange-700 rounded-xl 
                          flex items-center justify-center cursor-pointer transition-colors
                          ${(isLoading || imageUploading || formData.storeImageFiles.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {imageUploading ? 'Uploading...' : `Select Store Images ${formData.storeImageFiles.length > 0 ? `(${formData.storeImageFiles.length}/5)` : ''}`}
                        </label>
                      </div>

                      {/* Image Preview Grid */}
                      {formData.storeImageFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {formData.storeImageFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Store image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onLoad={(e) => {
                                    // Clean up object URL after image loads
                                    const img = e.target as HTMLImageElement;
                                    if (img.src.startsWith('blob:')) {
                                      setTimeout(() => URL.revokeObjectURL(img.src), 1000);
                                    }
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveImageFile(index)}
                                disabled={isLoading || imageUploading}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                                {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {formData.storeImageFiles.length >= 5 && (
                      <p className="text-xs text-orange-600">Maximum 5 images selected</p>
                    )}

                    {imageUploading && (
                      <div className="flex items-center justify-center p-2 bg-orange-50 rounded-lg">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-orange-600">Uploading images...</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber" className="text-sm font-medium text-gray-700">GST Number</Label>
                      <Input
                        id="gstNumber"
                        type="text"
                        placeholder="GST Number (optional)"
                        value={formData.gstNumber}
                        onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        disabled={isLoading}
                        maxLength={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panNumber" className="text-sm font-medium text-gray-700">PAN Number</Label>
                      <Input
                        id="panNumber"
                        type="text"
                        placeholder="PAN Number (optional)"
                        value={formData.panNumber}
                        onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        disabled={isLoading}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Types & Delivery Settings Section */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-orange-600" />
                  Service & Delivery Settings
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Service Types *</Label>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="delivery"
                          checked={formData.serviceTypes.includes('delivery')}
                          onChange={(e) => handleServiceTypeChange('delivery', e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="delivery" className="text-sm text-gray-700 flex items-center">
                          🚚 <span className="ml-2">Delivery</span>
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="pickup"
                          checked={formData.serviceTypes.includes('pickup')}
                          onChange={(e) => handleServiceTypeChange('pickup', e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="pickup" className="text-sm text-gray-700 flex items-center">
                          🏪 <span className="ml-2">Pickup</span>
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="dine_in"
                          checked={formData.serviceTypes.includes('dine_in')}
                          onChange={(e) => handleServiceTypeChange('dine_in', e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="dine_in" className="text-sm text-gray-700 flex items-center">
                          🍽️ <span className="ml-2">Dine In</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryRadius" className="text-sm font-medium text-gray-700">Delivery Radius (km) *</Label>
                      <Input
                        id="deliveryRadius"
                        type="number"
                        min="1"
                        max="50"
                        placeholder="e.g., 10"
                        value={formData.deliveryRadius}
                        onChange={(e) => handleInputChange('deliveryRadius', e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedDeliveryTime" className="text-sm font-medium text-gray-700">Est. Delivery Time (min) *</Label>
                      <Input
                        id="estimatedDeliveryTime"
                        type="number"
                        min="15"
                        max="120"
                        placeholder="e.g., 30"
                        value={formData.estimatedDeliveryTime}
                        onChange={(e) => handleInputChange('estimatedDeliveryTime', e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="minOrderAmount" className="text-sm font-medium text-gray-700">Min Order Amount (₹) *</Label>
                      <Input
                        id="minOrderAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 100"
                        value={formData.minOrderAmount}
                        onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryFee" className="text-sm font-medium text-gray-700">Delivery Fee (₹) *</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 25"
                        value={formData.deliveryFee}
                        onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
                  Payment Details
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiId" className="text-sm font-medium text-gray-700">UPI ID *</Label>
                    <Input
                      id="upiId"
                      type="text"
                      placeholder="yourname@paytm (for instant payments)"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName" className="text-sm font-medium text-gray-700">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      type="text"
                      placeholder="As per bank records"
                      value={formData.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber" className="text-sm font-medium text-gray-700">Bank Account Number *</Label>
                    <Input
                      id="bankAccountNumber"
                      type="text"
                      placeholder="Enter account number"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">Bank Name *</Label>
                      <Input
                        id="bankName"
                        type="text"
                        placeholder="e.g., State Bank of India"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ifscCode" className="text-sm font-medium text-gray-700">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        type="text"
                        placeholder="e.g., SBIN0001234 (8-11 chars)"
                        value={formData.ifscCode}
                        onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                        className="h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                        required
                        disabled={isLoading}
                        maxLength={11}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions Section */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-600" />
                  Terms & Conditions
                </h3>

                <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreeToCommission"
                      checked={formData.agreeToCommission}
                      onChange={(e) => setFormData(prev => ({ ...prev, agreeToCommission: e.target.checked }))}
                      className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      required
                    />
                    <label htmlFor="agreeToCommission" className="text-sm text-gray-700">
                      <span className="font-semibold text-orange-600">Platform Fee Agreement *</span>
                      <br />
                      I understand and agree that Butterfly Delivery will charge a{' '}
                      <span className="font-bold text-red-600">15% platform fee</span> on each successful order.
                      This fee covers payment processing, customer support, marketing, and platform maintenance.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                      className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      required
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                      <span className="font-semibold">Terms & Conditions Agreement *</span>
                      <br />
                      I agree to the{' '}
                      <a href="#" className="text-orange-600 hover:underline">Terms of Service</a>,{' '}
                      <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>, and{' '}
                      <a href="#" className="text-orange-600 hover:underline">Store Partner Agreement</a>.
                      I confirm that all information provided is accurate and I have the authority to register this business.
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-xl shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </div>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Verify Your Phone</h3>
                <p className="text-sm text-gray-600 mt-2">
                  We sent a verification code to +91 {formData.phone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">Enter Verification Code *</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-center text-lg tracking-widest h-11 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                  maxLength={4}
                />
              </div>

              {timeLeft > 0 && (
                <p className="text-sm text-gray-600 text-center">
                  Resend code in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              )}

              <Button
                onClick={verifyOTPAndRegister}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium"
                disabled={isLoading || otp.length !== 4}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Create Store Account'
                )}
              </Button>

              {timeLeft === 0 && (
                <Button
                  onClick={resendOTP}
                  variant="outline"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  Resend Code
                </Button>
              )}

              <Button
                onClick={() => setStep('form')}
                variant="ghost"
                className="w-full"
              >
                ← Back to Form
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-orange-600 hover:text-orange-700 font-medium underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StoreManagement = () => null;

export default Index;
