'use client';

import { FAQSection } from '@workspace/ui/components/ui/faqsection';

/**
 * Demo page showcasing the FAQSection component with
 * Rwanda Cancer Relief contextual questions and answers.
 * 
 * This page demonstrates the FAQ component with realistic
 * questions about cancer care services, patient support,
 * and organizational operations.
 * 
 * @returns A demo page with FAQ section
 */
export default function FAQDemoPage() {
  const faqsLeft = [
    {
      question: 'What cancer screening services do you provide?',
      answer:
        'We offer comprehensive screening services including breast cancer screenings (mammograms and clinical exams), cervical cancer screenings (Pap tests and HPV testing), and prostate cancer screenings. Our mobile units bring these services directly to rural communities across Rwanda.',
    },
    {
      question: 'How can I access your services?',
      answer:
        'You can access our services through our community health centers, mobile screening units that visit rural areas monthly, or by calling our helpline. We also partner with local health facilities to ensure accessible care across all regions of Rwanda.',
    },
    {
      question: 'Are your services free of charge?',
      answer:
        'We provide free screening services to underserved communities. For treatment and ongoing care, we work with patients to arrange financial assistance based on need. Our goal is to ensure that cost is never a barrier to receiving life-saving cancer care.',
    },
    {
      question: 'What support do you offer to cancer patients?',
      answer:
        'We provide comprehensive support including counseling services, nutritional guidance, palliative care, transportation assistance for treatment, and support groups. We also help patients navigate the healthcare system and connect them with treatment facilities.',
    },
    {
      question: 'How can I volunteer or support your mission?',
      answer:
        'We welcome volunteers with medical and non-medical backgrounds. You can support us through volunteering at events, joining our awareness campaigns, or making a donation. Visit our volunteer page or contact us directly to learn about current opportunities.',
    },
  ];

  const faqsRight = [
    {
      question: 'Do you provide treatment or only screening?',
      answer:
        'While we primarily focus on early detection through screening, we also facilitate access to treatment by partnering with hospitals and oncology centers. We help patients navigate the treatment process and provide ongoing support throughout their cancer journey.',
    },
    {
      question: 'What areas of Rwanda do you serve?',
      answer:
        'We serve communities throughout Rwanda, with a special focus on rural and underserved areas. Our mobile screening units rotate through different districts, and we have partnerships with health centers in all provinces to extend our reach.',
    },
    {
      question: 'How do you handle patient privacy and medical records?',
      answer:
        'We maintain strict confidentiality and follow all health privacy regulations. All medical records are securely stored and only accessed by authorized healthcare professionals involved in your care. We never share patient information without explicit consent.',
    },
    {
      question: 'What should I bring to a screening appointment?',
      answer:
        'Please bring a valid ID, any previous medical records related to cancer screening or treatment if available, and a list of current medications. If you have health insurance, bring your insurance information. Our staff will guide you through the process.',
    },
    {
      question: 'How can I learn more about cancer prevention?',
      answer:
        'We regularly conduct community education workshops covering cancer prevention, early warning signs, and healthy lifestyle choices. You can also access educational materials on our website or attend our monthly awareness events in your community.',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FAQSection
        title="Cancer Care & Support"
        subtitle="Frequently Asked Questions"
        description="Find answers to common questions about our screening services, patient support programs, and how to access cancer care in Rwanda."
        buttonLabel="Contact Us for More Information →"
        onButtonClick={() => console.log('FAQ button clicked')}
        faqsLeft={faqsLeft}
        faqsRight={faqsRight}
      />
    </main>
  );
}

