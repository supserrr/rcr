'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@workspace/ui/components/button";
import { Input } from '@workspace/ui/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { ArrowRight, ArrowLeft, Upload, Award, GraduationCap, MessageCircle, Video, Phone } from 'lucide-react';
import { FileTextIcon } from '@workspace/ui/components/file-text';
import { UsersIcon } from '@workspace/ui/components/users';
import { UploadIcon } from '@workspace/ui/components/upload';
import { AuthApi } from '../../../lib/api/auth';
import { toast } from 'sonner';

/**
 * Counselor onboarding form data structure
 */
interface CounselorOnboardingData {
  // Professional Information
  licenseNumber: string;
  licenseExpiry: string;
  issuingAuthority: string;
  
  // Education
  highestDegree: string;
  university: string;
  graduationYear: string;
  additionalCertifications: string[];
  
  // Experience
  yearsOfExperience: string;
  previousEmployers: string;
  specializations: string[];
  
  // Professional Details
  languages: string[];
  consultationTypes: string[];
  availability: string;
  
  // Profile
  profileImage: File | null;
  profileImagePreview: string;
  
  // Documentation
  resumeFile: File | null;
  licenseFile: File | null;
  certificationsFile: File | null;
  
  // Additional Information
  motivation: string;
  references: string;
  emergencyContact: string;
}

/**
 * Counselor onboarding page component
 */
export default function CounselorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const licenseFileInputRef = useRef<HTMLInputElement>(null);
  const certificationsFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CounselorOnboardingData>({
    licenseNumber: '',
    licenseExpiry: '',
    issuingAuthority: '',
    highestDegree: '',
    university: '',
    graduationYear: '',
    additionalCertifications: [],
    yearsOfExperience: '',
    previousEmployers: '',
    specializations: [],
    languages: [],
    consultationTypes: [],
    availability: '',
    profileImage: null,
    profileImagePreview: '',
    resumeFile: null,
    licenseFile: null,
    certificationsFile: null,
    motivation: '',
    references: '',
    emergencyContact: ''
  });

  const totalSteps = 5;

  const handleInputChange = (field: keyof CounselorOnboardingData, value: string | string[] | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: 'additionalCertifications' | 'specializations' | 'languages' | 'consultationTypes', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleFileUpload = (field: 'resumeFile' | 'licenseFile' | 'certificationsFile', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleProfileImageChange = (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, profileImage: null, profileImagePreview: '' }));
      return;
    }
    const isImage = /image\/png|image\/jpeg|image\/jpg/.test(file.type);
    const isSmallEnough = file.size <= 2 * 1024 * 1024;
    if (!isImage || !isSmallEnough) {
      alert('Please upload a JPG/PNG image up to 2MB.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profileImage: file, profileImagePreview: previewUrl }));
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
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        issuingAuthority: formData.issuingAuthority,
        highestDegree: formData.highestDegree,
        university: formData.university,
        graduationYear: formData.graduationYear,
        additionalCertifications: formData.additionalCertifications,
        yearsOfExperience: formData.yearsOfExperience,
        previousEmployers: formData.previousEmployers,
        specializations: formData.specializations,
        languages: formData.languages,
        consultationTypes: formData.consultationTypes,
        availability: formData.availability,
        motivation: formData.motivation,
        references: formData.references,
        emergencyContact: formData.emergencyContact,
        onboarding_completed: true, // Mark onboarding as complete
        onboarding_completed_at: new Date().toISOString(),
      };

      if (avatarUrl) {
        profileData.avatar_url = avatarUrl;
      }

      await AuthApi.updateProfile({
        metadata: profileData,
      });

      toast.success('Onboarding completed! Your application is under review. Redirecting to your dashboard...');
      router.push('/dashboard/counselor');
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
          <Award className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Professional License</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Verify your professional credentials (optional)</p>
      </div>

      <div className="bg-muted/20 border border-border rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Don't have a professional license?</h4>
            <p className="text-sm text-muted-foreground">
              No problem! Many qualified counselors work without formal licensing. You can skip this section and continue with your application.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">License Number</label>
          <Input
            type="text"
            placeholder="Enter your professional license number"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">License Expiry Date</label>
          <Input
            type="date"
            value={formData.licenseExpiry}
            onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">Issuing Authority</label>
          <Input
            type="text"
            placeholder="e.g., Rwanda Medical Council, Ministry of Health"
            value={formData.issuingAuthority}
            onChange={(e) => handleInputChange('issuingAuthority', e.target.value)}
          />
        </div>
      </div>

        <div className="flex flex-col items-center gap-4 pt-4 border-t border-border">
        <Avatar className="h-24 w-24">
          {formData.profileImagePreview ? (
            <AvatarImage src={formData.profileImagePreview} alt="Profile preview" />
          ) : (
            <AvatarFallback>PI</AvatarFallback>
          )}
        </Avatar>
        <div className="flex items-center gap-3">
          <input
            ref={profileFileInputRef}
            id="counselor-profile-upload"
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleProfileImageChange(e.target.files?.[0] || null)}
          />
          <Button 
            variant="outline" 
            size="sm"
            type="button"
            onClick={() => profileFileInputRef.current?.click()}
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Education & Certifications</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Tell us about your educational background</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Highest Degree</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.highestDegree}
            onChange={(e) => handleInputChange('highestDegree', e.target.value)}
          >
            <option value="">Select degree</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD/Doctorate</option>
            <option value="md">Medical Doctor (MD)</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">University/Institution</label>
          <Input
            type="text"
            placeholder="Name of university or institution"
            value={formData.university}
            onChange={(e) => handleInputChange('university', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Graduation Year</label>
          <Input
            type="number"
            placeholder="Year of graduation"
            value={formData.graduationYear}
            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Years of Experience</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
          >
            <option value="">Select experience level</option>
            <option value="0-1">0-1 years</option>
            <option value="2-5">2-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="11-15">11-15 years</option>
            <option value="16+">16+ years</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-4">Additional Certifications (Select all that apply)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'None',
            'Licensed Clinical Psychologist',
            'Licensed Social Worker',
            'Certified Grief Counselor',
            'Oncology Social Work Specialist',
            'Mental Health Counselor',
            'Family Therapist',
            'Trauma Specialist',
            'Palliative Care Specialist',
            'Cancer Support Specialist',
            'Peer Support Certification'
          ].map((cert) => (
            <button
              key={cert}
              type="button"
              onClick={() => {
                if (cert === 'None') {
                  // If "None" is selected, clear all other selections
                  handleInputChange('additionalCertifications', ['None']);
                } else {
                  // If any other option is selected, remove "None" and toggle the option
                  const currentCerts = formData.additionalCertifications.filter(c => c !== 'None');
                  if (currentCerts.includes(cert)) {
                    handleInputChange('additionalCertifications', currentCerts.filter(c => c !== cert));
                  } else {
                    handleInputChange('additionalCertifications', [...currentCerts, cert]);
                  }
                }
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                formData.additionalCertifications.includes(cert)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {cert}
            </button>
          ))}
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
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Specializations & Languages</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Define your areas of expertise</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-4">Specializations (Select all that apply)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'None',
            'Cancer Support',
            'Grief Counseling',
            'Family Therapy',
            'Anxiety Management',
            'Depression Support',
            'Trauma Therapy',
            'Palliative Care',
            'End-of-Life Counseling',
            'Peer Support',
            'Spiritual Counseling',
            'Child & Adolescent Therapy',
            'Couples Counseling'
          ].map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => {
                if (spec === 'None') {
                  // If "None" is selected, clear all other selections
                  handleInputChange('specializations', ['None']);
                } else {
                  // If any other option is selected, remove "None" and toggle the option
                  const currentSpecs = formData.specializations.filter(s => s !== 'None');
                  if (currentSpecs.includes(spec)) {
                    handleInputChange('specializations', currentSpecs.filter(s => s !== spec));
                  } else {
                    handleInputChange('specializations', [...currentSpecs, spec]);
                  }
                }
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                formData.specializations.includes(spec)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-4">Languages (Select all that apply)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Kinyarwanda', 'English', 'French', 'Swahili'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => handleArrayToggle('languages', lang)}
              className={`p-3 rounded-lg border text-center transition-all ${
                formData.languages.includes(lang)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-4">Consultation Types (Select all that apply)</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: 'chat', label: 'Text Chat', icon: MessageCircle },
            { type: 'video', label: 'Video Call', icon: Video },
            { type: 'phone', label: 'Phone Call', icon: Phone }
          ].map(({ type, label, icon: IconComponent }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleArrayToggle('consultationTypes', type)}
              className={`p-4 rounded-lg border text-center transition-all ${
                formData.consultationTypes.includes(type)
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
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadIcon size={40} className="text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Document Upload</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Upload required documents for verification</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Resume/CV (PDF)</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {formData.resumeFile ? formData.resumeFile.name : 'Click to upload or drag and drop'}
            </p>
            <input
              ref={resumeFileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload('resumeFile', e.target.files?.[0] || null)}
              className="hidden"
              id="resume-upload"
            />
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => resumeFileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Professional License (PDF/Image)</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {formData.licenseFile ? formData.licenseFile.name : 'Click to upload or drag and drop'}
            </p>
            <input
              ref={licenseFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('licenseFile', e.target.files?.[0] || null)}
              className="hidden"
              id="license-upload"
            />
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => licenseFileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Certifications (PDF/Image)</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {formData.certificationsFile ? formData.certificationsFile.name : 'Click to upload or drag and drop'}
            </p>
            <input
              ref={certificationsFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('certificationsFile', e.target.files?.[0] || null)}
              className="hidden"
              id="certifications-upload"
            />
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => certificationsFileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileTextIcon size={40} className="text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Additional Information</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Help us understand your motivation and background</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Previous Employers/Experience</label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
            placeholder="List your previous employers, hospitals, clinics, or organizations where you've worked..."
            value={formData.previousEmployers}
            onChange={(e) => handleInputChange('previousEmployers', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Availability</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.availability}
            onChange={(e) => handleInputChange('availability', e.target.value)}
          >
            <option value="">Select availability</option>
            <option value="full-time">Full-time (40+ hours/week)</option>
            <option value="part-time">Part-time (20-39 hours/week)</option>
            <option value="flexible">Flexible hours</option>
            <option value="weekends">Weekends only</option>
            <option value="evenings">Evenings only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Motivation to Join RCR</label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
            placeholder="Why do you want to join Rwanda Cancer Relief? What drives your passion for helping cancer patients and their families?"
            value={formData.motivation}
            onChange={(e) => handleInputChange('motivation', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Professional References</label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
            placeholder="Provide contact information for 2-3 professional references (name, title, organization, email, phone)..."
            value={formData.references}
            onChange={(e) => handleInputChange('references', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Emergency Contact</label>
          <Input
            type="text"
            placeholder="Name, relationship, phone number"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
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
            Counselor Application
          </CardTitle>
          <CardDescription className="text-base sm:text-lg relative z-10">
            Complete your professional profile to join our counselor network
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

            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              {currentStep === 1 && (
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Skip License
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isSubmitting ? 'Saving...' : currentStep === totalSteps ? 'Submit Application' : 'Next'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
