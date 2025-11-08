'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@workspace/ui/components/button";
import { Input } from '@workspace/ui/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Calendar, MapPin, ArrowRight, ArrowLeft, MessageCircle, Video, Phone } from 'lucide-react';
import { HeartIcon } from '@workspace/ui/components/heart';
import { FileTextIcon } from '@workspace/ui/components/file-text';
import { UsersIcon } from '@workspace/ui/components/users';
import { AuthApi } from '../../../lib/api/auth';
import { toast } from 'sonner';

/**
 * Patient onboarding form data structure
 */
interface PatientOnboardingData {
  // Personal Information
  age: string;
  gender: string;
  location: string;
  profileImage: File | null;
  profileImagePreview: string;
  
  // Medical Information
  cancerType: string;
  diagnosisDate: string;
  currentTreatment: string;
  treatmentStage: string;
  
  // Support Information
  supportNeeds: string[];
  preferredLanguage: string;
  familySupport: string;
  
  // Preferences
  consultationType: string[];
  availability: string;
  specialRequests: string;
}

/**
 * Patient onboarding page component
 */
export default function PatientOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<PatientOnboardingData>({
    age: '',
    gender: '',
    location: '',
    profileImage: null,
    profileImagePreview: '',
    cancerType: '',
    diagnosisDate: '',
    currentTreatment: '',
    treatmentStage: '',
    supportNeeds: [],
    preferredLanguage: '',
    familySupport: '',
    consultationType: [],
    availability: '',
    specialRequests: ''
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof PatientOnboardingData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSupportNeedToggle = (need: string) => {
    setFormData(prev => ({
      ...prev,
      supportNeeds: prev.supportNeeds.includes(need)
        ? prev.supportNeeds.filter(n => n !== need)
        : [...prev.supportNeeds, need]
    }));
  };

  const handleProfileImageChange = (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, profileImage: null, profileImagePreview: '' }));
      return;
    }
    // basic size/type guard (<= 2MB, image types)
    const isImage = /image\/png|image\/jpeg|image\/jpg/.test(file.type);
    const isSmallEnough = file.size <= 2 * 1024 * 1024;
    if (!isImage || !isSmallEnough) {
      alert('Please upload a JPG/PNG image up to 2MB.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profileImage: file, profileImagePreview: previewUrl }));
  };

  const handleConsultationTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      consultationType: prev.consultationType.includes(type)
        ? prev.consultationType.filter(t => t !== type)
        : [...prev.consultationType, type]
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form and redirect to dashboard
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload profile image if provided
      let avatarUrl: string | undefined;
      if (formData.profileImage) {
        try {
          const uploadResult = await AuthApi.uploadProfileImage(formData.profileImage);
          avatarUrl = uploadResult.url;
          toast.success('Profile image uploaded successfully');
        } catch (error) {
          console.error('Error uploading profile image:', error);
          toast.error('Failed to upload profile image. Continuing without image...');
        }
      }

      // Update profile with onboarding data
      const profileData: Record<string, unknown> = {
        age: formData.age,
        gender: formData.gender,
        location: formData.location,
        cancerType: formData.cancerType,
        diagnosisDate: formData.diagnosisDate,
        currentTreatment: formData.currentTreatment,
        treatmentStage: formData.treatmentStage,
        supportNeeds: formData.supportNeeds,
        preferredLanguage: formData.preferredLanguage,
        familySupport: formData.familySupport,
        consultationType: formData.consultationType,
        availability: formData.availability,
        specialRequests: formData.specialRequests,
        onboarding_completed: true, // Mark onboarding as complete
        onboarding_completed_at: new Date().toISOString(),
      };

      if (avatarUrl) {
        profileData.avatar_url = avatarUrl;
      }

      await AuthApi.updateProfile({
        metadata: profileData,
      });

      toast.success('Onboarding completed! Redirecting to your dashboard...');
      router.push('/dashboard/patient');
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartIcon size={40} className="text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Personal Information</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Help us understand your basic information</p>
      </div>

        <div className="flex flex-col items-center gap-4 mb-6">
        <Avatar className="h-24 w-24">
          {formData.profileImagePreview ? (
            <AvatarImage src={formData.profileImagePreview} alt="Profile preview" />
          ) : (
            <AvatarFallback>PI</AvatarFallback>
          )}
        </Avatar>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            id="patient-profile-upload"
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleProfileImageChange(e.target.files?.[0] || null)}
          />
          <Button 
            variant="outline" 
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </Button>
          {formData.profileImage && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => handleProfileImageChange(null)}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG or PNG, up to 2MB</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Age</label>
          <Input
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">Location</label>
          <Input
            type="text"
            placeholder="City, Province (e.g., Kigali, Kigali City)"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileTextIcon size={40} className="text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Medical Information</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Share your medical journey with us</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Type of Cancer</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.cancerType}
            onChange={(e) => handleInputChange('cancerType', e.target.value)}
          >
            <option value="">Select cancer type</option>
            <option value="breast">Breast Cancer</option>
            <option value="lung">Lung Cancer</option>
            <option value="prostate">Prostate Cancer</option>
            <option value="colorectal">Colorectal Cancer</option>
            <option value="cervical">Cervical Cancer</option>
            <option value="liver">Liver Cancer</option>
            <option value="stomach">Stomach Cancer</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Diagnosis Date</label>
          <Input
            type="date"
            value={formData.diagnosisDate}
            onChange={(e) => handleInputChange('diagnosisDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Current Treatment</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.currentTreatment}
            onChange={(e) => handleInputChange('currentTreatment', e.target.value)}
          >
            <option value="">Select current treatment</option>
            <option value="chemotherapy">Chemotherapy</option>
            <option value="radiation">Radiation Therapy</option>
            <option value="surgery">Surgery</option>
            <option value="immunotherapy">Immunotherapy</option>
            <option value="targeted-therapy">Targeted Therapy</option>
            <option value="hormone-therapy">Hormone Therapy</option>
            <option value="palliative-care">Palliative Care</option>
            <option value="no-treatment">No Current Treatment</option>
            <option value="completed-treatment">Completed Treatment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Treatment Stage</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.treatmentStage}
            onChange={(e) => handleInputChange('treatmentStage', e.target.value)}
          >
            <option value="">Select stage</option>
            <option value="stage-1">Stage 1</option>
            <option value="stage-2">Stage 2</option>
            <option value="stage-3">Stage 3</option>
            <option value="stage-4">Stage 4</option>
            <option value="in-remission">In Remission</option>
            <option value="survivor">Survivor</option>
            <option value="not-specified">Not Specified</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UsersIcon size={40} className="text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Support Needs</h2>
        <p className="text-sm sm:text-base text-muted-foreground">What kind of support are you looking for?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-4">Support Areas (Select all that apply)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Emotional Support',
            'Coping Strategies',
            'Family Counseling',
            'Grief Counseling',
            'Anxiety Management',
            'Depression Support',
            'Treatment Decision Support',
            'End-of-Life Planning',
            'Peer Support',
            'Spiritual Support'
          ].map((need) => (
            <button
              key={need}
              type="button"
              onClick={() => handleSupportNeedToggle(need)}
              className={`p-3 rounded-lg border text-left transition-all ${
                formData.supportNeeds.includes(need)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {need}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Preferred Language</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.preferredLanguage}
            onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
          >
            <option value="">Select language</option>
            <option value="kinyarwanda">Kinyarwanda</option>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="swahili">Swahili</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Family Support</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.familySupport}
            onChange={(e) => handleInputChange('familySupport', e.target.value)}
          >
            <option value="">Select level</option>
            <option value="strong">Strong family support</option>
            <option value="moderate">Moderate family support</option>
            <option value="limited">Limited family support</option>
            <option value="none">No family support</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Preferences</h2>
        <p className="text-sm sm:text-base text-muted-foreground">How would you like to connect with counselors?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-4">Preferred Consultation Types</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: 'chat', label: 'Text Chat', icon: MessageCircle },
            { type: 'video', label: 'Video Call', icon: Video },
            { type: 'phone', label: 'Phone Call', icon: Phone }
          ].map(({ type, label, icon: IconComponent }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleConsultationTypeToggle(type)}
              className={`p-4 rounded-lg border text-center transition-all ${
                formData.consultationType.includes(type)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex justify-center mb-2">
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Availability</label>
        <select
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          value={formData.availability}
          onChange={(e) => handleInputChange('availability', e.target.value)}
        >
          <option value="">Select availability</option>
          <option value="morning">Morning (6 AM - 12 PM)</option>
          <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
          <option value="evening">Evening (6 PM - 10 PM)</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Special Requests or Notes</label>
        <textarea
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
          placeholder="Any special requests, accessibility needs, or additional information you'd like counselors to know..."
          value={formData.specialRequests}
          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <Card className="w-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
        <CardHeader className="text-center relative">
          {/* Decorative gradient blob */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground relative z-10">
            Welcome to Rwanda Cancer Relief
          </CardTitle>
          <CardDescription className="text-base sm:text-lg relative z-10">
            Let's get to know you better so we can provide the best support
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-6 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? 'Saving...' : currentStep === totalSteps ? 'Complete Setup' : 'Next'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
