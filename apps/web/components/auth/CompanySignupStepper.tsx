'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import {
  Building2,
  Users,
  Mail,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Minus
} from 'lucide-react';

interface CompanySignupData {
  // Step 1: Company Details
  companyName: string;
  domain: string;
  industry: string;
  companySize: string;

  // Step 2: Plan & Seats
  planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  seatLimit: number;

  // Step 3: Team Members
  teamMembers: Array<{
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'MEMBER';
    department?: string;
  }>;

  // Step 4: Preferences
  defaultVertical: 'REAL_ESTATE' | 'E_COMMERCE' | 'LAW';
  enableDomainAutoJoin: boolean;
  inviteMessage: string;
}

const PLAN_DETAILS = {
  STARTER: {
    name: 'Starter',
    price: '$29/month',
    maxSeats: 10,
    features: ['Basic analytics', 'Email support', 'Standard integrations']
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: '$79/month',
    maxSeats: 50,
    features: ['Advanced analytics', 'Priority support', 'All integrations', 'Custom reports']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'Custom',
    maxSeats: 1000,
    features: ['Enterprise analytics', '24/7 support', 'Custom integrations', 'SSO', 'Audit logs']
  }
};

export default function CompanySignupStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanySignupData>({
    companyName: '',
    domain: '',
    industry: '',
    companySize: '',
    planTier: 'STARTER',
    seatLimit: 5,
    teamMembers: [{ email: '', role: 'ADMIN', department: '' }],
    defaultVertical: 'E_COMMERCE',
    enableDomainAutoJoin: false,
    inviteMessage: ''
  });

  const updateFormData = (updates: Partial<CompanySignupData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addTeamMember = () => {
    updateFormData({
      teamMembers: [...formData.teamMembers, { email: '', role: 'MEMBER', department: '' }]
    });
  };

  const removeTeamMember = (index: number) => {
    updateFormData({
      teamMembers: formData.teamMembers.filter((_, i) => i !== index)
    });
  };

  const updateTeamMember = (index: number, updates: Partial<CompanySignupData['teamMembers'][0]>) => {
    const updated = [...formData.teamMembers];
    updated[index] = { ...updated[index], ...updates };
    updateFormData({ teamMembers: updated });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create organization
      console.log('Creating organization:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to organization admin dashboard
      router.push('/org/admin');
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepValidation = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.companyName && formData.domain && formData.industry);
      case 2:
        return !!(formData.planTier && formData.seatLimit > 0);
      case 3:
        return formData.teamMembers.some(member => member.email);
      case 4:
        return !!formData.defaultVertical;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Company Details</h2>
              <p className="text-gray-600">Tell us about your organization</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateFormData({ companyName: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <Label htmlFor="domain">Company Domain *</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => updateFormData({ domain: e.target.value })}
                  placeholder="acme.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Team members with this domain can auto-join your organization
                </p>
              </div>

              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData({ industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="legal">Legal Services</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={formData.companySize} onValueChange={(value) => updateFormData({ companySize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Choose Your Plan</h2>
              <p className="text-gray-600">Select the plan that fits your team size</p>
            </div>

            <div className="grid gap-4">
              {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all ${
                    formData.planTier === key
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => updateFormData({
                    planTier: key as any,
                    seatLimit: Math.min(formData.seatLimit, plan.maxSeats)
                  })}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.price}</CardDescription>
                      </div>
                      {formData.planTier === key && (
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Up to {plan.maxSeats} seats</p>
                      <ul className="text-sm space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Label htmlFor="seatLimit">Number of Seats: {formData.seatLimit}</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateFormData({
                    seatLimit: Math.max(1, formData.seatLimit - 1)
                  })}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[3rem] text-center font-medium">
                  {formData.seatLimit}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateFormData({
                    seatLimit: Math.min(
                      PLAN_DETAILS[formData.planTier].maxSeats,
                      formData.seatLimit + 1
                    )
                  })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Max {PLAN_DETAILS[formData.planTier].maxSeats} seats for {PLAN_DETAILS[formData.planTier].name} plan
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Mail className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Invite Team Members</h2>
              <p className="text-gray-600">Add your team to get started together</p>
            </div>

            <div className="space-y-4">
              {formData.teamMembers.map((member, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label>Email Address</Label>
                          <Input
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, { email: e.target.value })}
                            placeholder="colleague@company.com"
                          />
                        </div>
                        <div className="w-32">
                          <Label>Role</Label>
                          <Select
                            value={member.role}
                            onValueChange={(role: any) => updateTeamMember(index, { role })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="MEMBER">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.teamMembers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-6"
                            onClick={() => removeTeamMember(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label>Department (Optional)</Label>
                        <Input
                          value={member.department || ''}
                          onChange={(e) => updateTeamMember(index, { department: e.target.value })}
                          placeholder="Marketing, Sales, Engineering..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formData.teamMembers.length < formData.seatLimit && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addTeamMember}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              )}

              <p className="text-sm text-gray-500">
                Using {formData.teamMembers.length} of {formData.seatLimit} seats
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold">Final Setup</h2>
              <p className="text-gray-600">Configure your organization preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Primary Business Vertical</Label>
                <Select
                  value={formData.defaultVertical}
                  onValueChange={(value: any) => updateFormData({ defaultVertical: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                    <SelectItem value="E_COMMERCE">E-commerce</SelectItem>
                    <SelectItem value="LAW">Legal Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="domainAutoJoin"
                  checked={formData.enableDomainAutoJoin}
                  onCheckedChange={(checked) => updateFormData({ enableDomainAutoJoin: !!checked })}
                />
                <Label htmlFor="domainAutoJoin" className="text-sm">
                  Allow users with @{formData.domain} to automatically join this organization
                </Label>
              </div>

              <div>
                <Label htmlFor="inviteMessage">Custom Invitation Message (Optional)</Label>
                <Textarea
                  id="inviteMessage"
                  value={formData.inviteMessage}
                  onChange={(e) => updateFormData({ inviteMessage: e.target.value })}
                  placeholder="Welcome to our team! We're excited to have you join us on the EFFINITY platform..."
                  rows={3}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Setup Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Organization:</span>
                    <span className="font-medium">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">
                      {PLAN_DETAILS[formData.planTier].name} ({formData.seatLimit} seats)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team Members:</span>
                    <span className="font-medium">
                      {formData.teamMembers.filter(m => m.email).length} invitations
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domain:</span>
                    <span className="font-medium">{formData.domain}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {currentStep} of 4</span>
          <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
        </div>
        <Progress value={(currentStep / 4) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!getStepValidation(currentStep) || isSubmitting}
        >
          {isSubmitting ? (
            'Creating Organization...'
          ) : currentStep === 4 ? (
            'Create Organization'
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}