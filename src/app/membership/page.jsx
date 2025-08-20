"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/checkoutform";
import { motion } from "framer-motion";
import { 
  Users, 
  Star, 
  Award, 
  GraduationCap,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Shield,
  Heart,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  User,
  Building,
  CreditCard,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Globe,
  Users2,
  Trophy,
  Sparkles
} from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const membershipTypes = [
  {
    id: "full",
    title: "Full Membership",
    price: "$50",
    originalPrice: "$75",
    description: "For certified BACB professionals (BCBA-D, BCBA, BCaBA)",
    icon: <Trophy className="h-8 w-8" />,
    features: [
      "Voting privileges in board elections",
      "All member benefits & resources",
      "Professional status recognition",
      "Priority access to events",
      "Exclusive networking opportunities"
    ],
    color: "from-red-600 to-red-700",
    borderColor: "border-red-200",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100",
    popular: true
  },
  {
    id: "affiliate",
    title: "Affiliate Membership",
    price: "$25",
    originalPrice: "$40",
    description: "For professionals not meeting full membership criteria",
    icon: <Users2 className="h-8 w-8" />,
    features: [
      "All member benefits & resources",
      "Networking opportunities",
      "Professional development access",
      "Event discounts",
      "Resource library access"
    ],
    color: "from-orange-500 to-orange-600",
    borderColor: "border-orange-200",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100"
  },
  {
    id: "studentBT",
    title: "Student & BT/Paraprofessional",
    price: "$10",
    originalPrice: "$20",
    description: "For students and behavior technicians",
    icon: <GraduationCap className="h-8 w-8" />,
    features: [
      "Student portal access",
      "Reduced conference fees",
      "Exam prep discounts",
      "Mentorship opportunities",
      "Student-specific resources"
    ],
    color: "from-blue-500 to-blue-600",
    borderColor: "border-blue-200",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
  }
];

const benefits = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    text: "Free CEU Events",
    description: "Access to continuing education units"
  },
  {
    icon: <Users className="h-6 w-6" />,
    text: "Networking Opportunities",
    description: "Connect with professionals in your field"
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    text: "Conference Discounts",
    description: "Reduced fees for annual conferences"
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    text: "Student Benefits",
    description: "Special resources for student members"
  },
  {
    icon: <Award className="h-6 w-6" />,
    text: "Voting Privileges",
    description: "Full members can vote in elections"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    text: "Student Portal",
    description: "Exclusive content and exam prep materials"
  }
];

export default function MembershipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // All useState hooks must be called before any conditional returns
  const [clientSecret, setClientSecret] = useState("");
  const [msg, setMsg] = useState("");
  const [selectedType, setSelectedType] = useState("full");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    fullName: "",
    lastName: "",
    email: "",
    phone: "",
    bcba: "",
    affiliation: "",
    password: "",
    role: "full",
    billingName: "",
    billingAddress: "",
    shareInfoInternally: false,
    memberType: "member",
    businessName: "",
    businessWebsite: "",
  });
  
  // Function to validate form
  const validateForm = useCallback(() => {
    const errors = {};
    
    // Required fields validation
    if (!form.fullName?.trim()) errors.fullName = "Full name is required";
    if (!form.lastName?.trim()) errors.lastName = "Last name is required";
    if (!form.email?.trim()) errors.email = "Email is required";
    if (!form.password?.trim()) errors.password = "Password is required";
    if (!form.billingName?.trim()) errors.billingName = "Billing name is required";
    if (!form.billingAddress?.trim()) errors.billingAddress = "Billing address is required";
    
    // Business-specific validation
    if (form.shareInfoInternally && form.memberType === "business" && !form.businessName?.trim()) {
      errors.businessName = "Business name is required";
    }
    
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  }, [form]);

  // Redirect authenticated users to members portal
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/members-portal");
    }
  }, [session, status, router]);

  // Check form validity whenever form changes
  useEffect(() => {
    validateForm();
  }, [form, validateForm]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400 animate-ping"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading your membership experience...</p>
        </motion.div>
      </div>
    );
  }

  // Don't render the page if user is authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    
    // Password strength validation
    if (name === "password") {
      const checks = {
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      };
      
      const score = Object.values(checks).filter(Boolean).length;
      let feedback = "";
      
      if (score === 0) feedback = "Very Weak";
      else if (score === 1) feedback = "Weak";
      else if (score === 2) feedback = "Fair";
      else if (score === 3) feedback = "Good";
      else if (score === 4) feedback = "Strong";
      else feedback = "Very Strong";
      
      setPasswordStrength({
        score,
        feedback,
        checks
      });
    }

    // Business name validation
    if (name === "businessName" && form.shareInfoInternally && form.memberType === "business") {
      if (!value.trim()) {
        setFormErrors(prev => ({ ...prev, businessName: "Business name is required" }));
      } else {
        setFormErrors(prev => ({ ...prev, businessName: "" }));
      }
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    setMsg("");

    // ✅ Validate required fields
    if (!form.fullName || !form.email || !form.password || !form.billingName || !form.billingAddress) {
      setMsg("Please fill in all required fields before proceeding.");
      return;
    }

    // ✅ Validate business fields if member type is business
    if (form.shareInfoInternally && form.memberType === "business" && !form.businessName) {
      setMsg("Business name is required when selecting business as member type.");
      return;
    }

    try {
      const res = await fetch("/api/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          onlyIntent: true,
        }),
      });

      const data = await res.json();

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setMsg(data.error || "Failed to initialize payment.");
      }
    } catch (error) {
      setMsg("Error connecting to payment service.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white mb-8 shadow-lg"
            >
              <Sparkles className="h-10 w-10" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Join the
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"> ArkABA</span>
              <br />Community
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Connect with fellow ABA professionals, access exclusive resources, and advance your career with our comprehensive membership benefits.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Membership Types */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Membership</h2>
          <p className="text-lg text-gray-600">Select the plan that best fits your professional needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {membershipTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer ${
                form.role === type.id 
                  ? `${type.borderColor} shadow-2xl shadow-red-500/20` 
                  : 'border-gray-200 hover:border-red-300 bg-white hover:shadow-xl'
              } ${type.bgColor}`}
              onClick={() => setForm((f) => ({ ...f, role: type.id }))}
            >
              {type.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${type.color} text-white mb-4 shadow-lg`}>
                  {type.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{type.title}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {type.price}
                  </span>
                  <span className="text-lg text-gray-500 line-through">{type.originalPrice}</span>
                </div>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </div>

              <div className="space-y-3">
                {type.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl p-12 mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Member Benefits</h2>
            <p className="text-lg text-gray-600">Unlock exclusive resources and opportunities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-orange-50 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.text}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
                     <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Registration</h2>
             <p className="text-lg text-gray-600">Join thousands of ABA professionals today</p>
           </div>

           {/* Membership Type Selection */}
           <div className="mb-8">
             <label className="text-sm font-semibold text-gray-700 mb-4 block">Choose Your Membership Type *</label>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {membershipTypes.map((type) => (
                 <motion.div
                   key={type.id}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setForm((f) => ({ ...f, role: type.id }))}
                   className={`relative rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                     form.role === type.id 
                       ? `${type.borderColor} shadow-lg shadow-red-500/20 bg-white` 
                       : 'border-gray-200 hover:border-red-300 bg-gray-50 hover:bg-white'
                   }`}
                 >
                   {type.popular && (
                     <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                       <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                         Most Popular
                       </span>
                     </div>
                   )}
                   
                   <div className="text-center">
                     <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${type.color} text-white mb-3 shadow-md`}>
                       {type.icon}
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h3>
                     <div className="flex items-center justify-center gap-2 mb-2">
                       <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                         {type.price}
                       </span>
                       <span className="text-sm text-gray-500 line-through">{type.originalPrice}</span>
                     </div>
                     <p className="text-gray-600 text-xs mb-3">{type.description}</p>
                     
                     <div className="space-y-1">
                       {type.features.slice(0, 3).map((feature, featureIndex) => (
                         <div key={featureIndex} className="flex items-start">
                           <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                           <span className="text-gray-700 text-xs">{feature}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required icon={<User className="h-4 w-4" />} error={formErrors.fullName} />
             <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required icon={<User className="h-4 w-4" />} error={formErrors.lastName} />
             <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required icon={<Mail className="h-4 w-4" />} error={formErrors.email} />
             <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} icon={<Phone className="h-4 w-4" />} />
             <Input label="BCBA/BCaBA #" name="bcba" value={form.bcba} onChange={handleChange} icon={<Award className="h-4 w-4" />} />
             <Input label="Affiliation" name="affiliation" value={form.affiliation} onChange={handleChange} icon={<Building className="h-4 w-4" />} />
             <div className="md:col-span-2">
               <PasswordInput 
                 label="Password" 
                 name="password" 
                 value={form.password} 
                 onChange={handleChange} 
                 required 
                 showPassword={showPassword}
                 setShowPassword={setShowPassword}
                 strength={passwordStrength}
                 error={formErrors.password}
               />
             </div>
             <Input label="Billing Name" name="billingName" value={form.billingName} onChange={handleChange} required icon={<CreditCard className="h-4 w-4" />} error={formErrors.billingName} />
             <Input label="Billing Address" name="billingAddress" value={form.billingAddress} onChange={handleChange} required icon={<Globe className="h-4 w-4" />} error={formErrors.billingAddress} />
           </div>

           {/* Internal Sharing Preferences */}
           <div className="mb-8">
             <div className="flex items-center space-x-3 mb-4">
               <input
                 type="checkbox"
                 id="shareInfoInternally"
                 name="shareInfoInternally"
                 checked={form.shareInfoInternally}
                 onChange={(e) => setForm(prev => ({ ...prev, shareInfoInternally: e.target.checked }))}
                 className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
               />
               <label htmlFor="shareInfoInternally" className="text-sm font-semibold text-gray-700">
                 Do you want to share your information internally with other members?
               </label>
             </div>

             {/* Conditional Questions - Only show if shareInfoInternally is true */}
             {form.shareInfoInternally && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: "auto" }}
                 exit={{ opacity: 0, height: 0 }}
                 transition={{ duration: 0.3 }}
                 className="space-y-6 p-6 bg-gray-50 rounded-xl border border-gray-200"
               >
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about yourself</h3>
                 
                 {/* Member Type Selection */}
                 <div>
                   <label className="text-sm font-semibold text-gray-700 mb-3 block">Who are you? *</label>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {[
                       { value: "member", label: "Member", icon: <User className="h-4 w-4" /> },
                       { value: "supervisor", label: "Supervisor", icon: <Award className="h-4 w-4" /> },
                       { value: "business", label: "Business", icon: <Building className="h-4 w-4" /> }
                     ].map((type) => (
                       <button
                         key={type.value}
                         type="button"
                         onClick={() => setForm(prev => ({ ...prev, memberType: type.value }))}
                         className={`p-4 border-2 rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${
                           form.memberType === type.value
                             ? 'border-red-500 bg-red-50 text-red-700'
                             : 'border-gray-200 hover:border-gray-300 text-gray-700'
                         }`}
                       >
                         {type.icon}
                         <span className="font-medium">{type.label}</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Business-specific questions */}
                 {form.memberType === "business" && (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="space-y-4"
                   >
                     <Input 
                       label="Business Name" 
                       name="businessName" 
                       value={form.businessName} 
                       onChange={handleChange} 
                       required 
                       icon={<Building className="h-4 w-4" />} 
                       error={formErrors.businessName}
                     />
                     <Input 
                       label="Your Website Link (Optional)" 
                       name="businessWebsite" 
                       value={form.businessWebsite} 
                       onChange={handleChange} 
                       type="url"
                       icon={<Globe className="h-4 w-4" />} 
                     />
                   </motion.div>
                 )}
               </motion.div>
             )}
           </div>

          {!isFormValid && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-center"
            >
              <AlertCircle className="h-5 w-5 inline mr-2" />
              Please fill in all required fields to proceed with payment
            </motion.div>
          )}

          {!clientSecret && (
            <motion.button
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full py-4 px-8 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                isFormValid 
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-xl cursor-pointer"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              <Zap className="h-5 w-5" />
              Proceed to Payment
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          )}

          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center"
            >
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {msg}
            </motion.div>
          )}

          {clientSecret && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Elements options={{ clientSecret }} stripe={stripePromise}>
                <CheckoutForm 
                  form={form} 
                  setMsg={setMsg} 
                  isFormValid={isFormValid}
                  validateForm={validateForm}
                />
              </Elements>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = false, icon, error }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        {icon && <span className="mr-2 text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        name={name}
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-gray-900 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        required={required}
        placeholder={label}
      />
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

function PasswordInput({ label, name, value, onChange, required, showPassword, setShowPassword, strength, error }) {
  const getStrengthColor = (score) => {
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-orange-500";
    if (score === 3) return "bg-yellow-500";
    if (score === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthTextColor = (score) => {
    if (score <= 1) return "text-red-600";
    if (score === 2) return "text-orange-600";
    if (score === 3) return "text-yellow-600";
    if (score === 4) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <Shield className="mr-2 h-4 w-4 text-gray-500" />
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          name={name}
          id={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-gray-900 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          required={required}
          placeholder={label}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {value && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 p-4 bg-gray-50 rounded-xl"
        >
          {/* Strength Bar */}
          <div className="flex items-center mb-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(strength.score / 5) * 100}%` }}
                className={`h-3 rounded-full transition-all duration-500 ${getStrengthColor(strength.score)}`}
              />
            </div>
            <span className={`text-sm font-semibold ${getStrengthTextColor(strength.score)}`}>
              {strength.feedback}
            </span>
          </div>

          {/* Requirements List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className={`flex items-center ${strength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 mr-2 ${strength.checks.length ? 'text-green-500' : 'text-gray-400'}`} />
              At least 8 characters
            </div>
            <div className={`flex items-center ${strength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 mr-2 ${strength.checks.uppercase ? 'text-green-500' : 'text-gray-400'}`} />
              One uppercase letter
            </div>
            <div className={`flex items-center ${strength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 mr-2 ${strength.checks.lowercase ? 'text-green-500' : 'text-gray-400'}`} />
              One lowercase letter
            </div>
            <div className={`flex items-center ${strength.checks.number ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 mr-2 ${strength.checks.number ? 'text-green-500' : 'text-gray-400'}`} />
              One number
            </div>
            <div className={`flex items-center ${strength.checks.special ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 mr-2 ${strength.checks.special ? 'text-green-500' : 'text-gray-400'}`} />
              One special character
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
}