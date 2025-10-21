'use client';

import { MultiStepForm } from "@workspace/ui/components/ui/multi-step-form";
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip";
import { useState } from "react";
import { 
  ArrowUpRight, 
  Info, 
  Calendar, 
  User, 
  Phone, 
  MapPin,
  Heart,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

const TooltipIcon = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/**
 * Demo page showcasing the Multi-Step Form component.
 *
 * This page demonstrates a cancer screening appointment booking form with:
 * - Multiple steps with progress tracking
 * - Form validation and tooltips
 * - Animated step transitions
 * - Back/Next navigation
 *
 * @returns Multi-Step Form demo page
 */
export default function MultiStepFormDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Appointment booking submitted!");
      setCurrentStep(1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information";
      case 2: return "Medical History";
      case 3: return "Appointment Details";
      case 4: return "Confirmation";
      default: return "Screening Appointment";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Please provide your basic information to begin the screening appointment process.";
      case 2: return "Help us understand your medical background and any cancer-related concerns.";
      case 3: return "Select your preferred screening date, time, and location.";
      case 4: return "Review your information and confirm your screening appointment.";
      default: return "Book your free cancer screening appointment";
    }
  };

  const getNextButtonText = () => {
    if (currentStep === totalSteps) return "Confirm Booking";
    return "Continue";
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Multi-Step Form Demo</h1>
          <p className="text-muted-foreground text-lg">
            Interactive forms with progress tracking and step navigation
          </p>
        </div>

        {/* Main Form */}
        <div className="flex justify-center">
          <MultiStepForm
            currentStep={currentStep}
            totalSteps={totalSteps}
            title={getStepTitle()}
            description={getStepDescription()}
            onBack={handleBack}
            onNext={handleNext}
            onClose={() => setCurrentStep(1)}
            backButtonText="Back"
            nextButtonText={getNextButtonText()}
            footerContent={
              <a href="#" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Need Help? <ArrowUpRight className="h-4 w-4" />
              </a>
            }
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <TooltipIcon text="Enter your first name as it appears on your ID" />
                    </div>
                    <Input id="firstName" placeholder="Enter first name" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <TooltipIcon text="Enter your last name as it appears on your ID" />
                    </div>
                    <Input id="lastName" placeholder="Enter last name" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <TooltipIcon text="We'll use this to send appointment reminders" />
                    </div>
                    <div className="flex">
                      <Phone className="h-4 w-4 text-muted-foreground absolute ml-3 mt-2.5" />
                      <Input id="phone" placeholder="+250 XXX XXX XXX" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <TooltipIcon text="Required to determine appropriate screening protocols" />
                    </div>
                    <Input id="dateOfBirth" type="date" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="address">Address</Label>
                      <TooltipIcon text="Your home address for contact purposes" />
                    </div>
                    <div className="flex">
                      <MapPin className="h-4 w-4 text-muted-foreground absolute ml-3 mt-2.5" />
                      <Input id="address" placeholder="Enter your address" className="pl-10" />
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    All personal information is kept confidential and used only for appointment management.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 2: Medical History */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="screening-type">Screening Type</Label>
                      <TooltipIcon text="Select the type of cancer screening you need" />
                    </div>
                    <Select>
                      <SelectTrigger id="screening-type">
                        <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select screening type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breast">Breast Cancer Screening</SelectItem>
                        <SelectItem value="cervical">Cervical Cancer Screening</SelectItem>
                        <SelectItem value="prostate">Prostate Cancer Screening</SelectItem>
                        <SelectItem value="general">General Cancer Screening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="family-history">Family History</Label>
                      <TooltipIcon text="Have any family members been diagnosed with cancer?" />
                    </div>
                    <Select>
                      <SelectTrigger id="family-history">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, family history of cancer</SelectItem>
                        <SelectItem value="no">No family history</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="previous-screening">Previous Screening</Label>
                      <TooltipIcon text="Have you had a cancer screening before?" />
                    </div>
                    <Select>
                      <SelectTrigger id="previous-screening">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, I have been screened before</SelectItem>
                        <SelectItem value="no">No, this is my first screening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="symptoms">Current Symptoms (if any)</Label>
                      <TooltipIcon text="Describe any symptoms or concerns you're experiencing" />
                    </div>
                    <Input 
                      id="symptoms" 
                      placeholder="Describe any symptoms or concerns..." 
                      className="h-20"
                    />
                  </div>
                </div>

                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This information helps our medical team prepare for your screening. All data is confidential.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Appointment Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="location">Screening Location</Label>
                      <TooltipIcon text="Choose your preferred screening center" />
                    </div>
                    <Select>
                      <SelectTrigger id="location">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select location..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kigali">Kigali Cancer Center</SelectItem>
                        <SelectItem value="butare">Butare Regional Hospital</SelectItem>
                        <SelectItem value="gisenyi">Gisenyi Health Center</SelectItem>
                        <SelectItem value="mobile">Mobile Unit - Nearest Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="preferred-date">Preferred Date</Label>
                      <TooltipIcon text="Select your preferred appointment date" />
                    </div>
                    <div className="flex">
                      <Calendar className="h-4 w-4 text-muted-foreground absolute ml-3 mt-2.5" />
                      <Input id="preferred-date" type="date" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="time-slot">Preferred Time</Label>
                      <TooltipIcon text="Choose your preferred time slot" />
                    </div>
                    <Select>
                      <SelectTrigger id="time-slot">
                        <SelectValue placeholder="Select time..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (1:00 PM - 5:00 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5:00 PM - 7:00 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="language">Preferred Language</Label>
                      <TooltipIcon text="Language for appointment communication" />
                    </div>
                    <Select>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kinyarwanda">Kinyarwanda</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Appointments are subject to availability. We'll contact you within 24 hours to confirm your slot.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-card p-6 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Review Your Information
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">John Doe</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">+250 XXX XXX XXX</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Screening Type:</span>
                      <span className="font-medium">Breast Cancer Screening</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">Kigali Cancer Center</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">January 25, 2025</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">Morning (8:00 AM - 12:00 PM)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Language:</span>
                      <span className="font-medium">Kinyarwanda</span>
                    </div>
                  </div>
                </div>

                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    By confirming, you agree to our privacy policy and consent to receive appointment reminders via SMS.
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-6 space-y-2">
                  <h4 className="font-semibold text-primary">What to Expect</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Confirmation SMS within 24 hours</li>
                    <li>Reminder 48 hours before appointment</li>
                    <li>Bring your ID and any previous medical records</li>
                    <li>The screening typically takes 30-45 minutes</li>
                    <li>Results available within 7-10 days</li>
                  </ul>
                </div>
              </div>
            )}
          </MultiStepForm>
        </div>

        {/* Use Cases */}
        <section className="space-y-8 pt-12">
          <h2 className="text-3xl font-bold text-center">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Screening Appointments</h3>
              <p className="text-sm text-muted-foreground">
                Multi-step form for booking cancer screenings with medical history
                collection and appointment scheduling
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Volunteer Applications</h3>
              <p className="text-sm text-muted-foreground">
                Structured application process for volunteers with skills assessment,
                availability, and training requirements
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Patient Registration</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive patient onboarding with demographics, medical history,
                insurance, and consent forms
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Component Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Progress Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Visual progress bar showing completion percentage
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Step Navigation</h4>
              <p className="text-sm text-muted-foreground">
                Back/Next buttons with conditional visibility
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Smooth Animations</h4>
              <p className="text-sm text-muted-foreground">
                Framer Motion transitions between steps
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Responsive Design</h4>
              <p className="text-sm text-muted-foreground">
                Adapts to mobile, tablet, and desktop screens
              </p>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 max-w-4xl mx-auto">
          <h3 className="font-semibold mb-2">About Multi-Step Form Component</h3>
          <p className="text-sm text-muted-foreground">
            The Multi-Step Form component breaks complex forms into manageable steps
            with progress tracking and smooth animations. It features back/next navigation,
            optional close button, customizable footer content, and three size variants.
            Perfect for registration processes, booking systems, and onboarding flows.
          </p>
        </div>
      </div>
    </div>
  );
}

