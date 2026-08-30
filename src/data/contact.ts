export const inquiryTypes = [
  { value: 'client', label: 'Prospective client' },
  { value: 'professional', label: 'Professional connection' },
  { value: 'general', label: 'General inquiry' },
] as const;

export type InquiryType = (typeof inquiryTypes)[number]['value'];

export const contact = {
  headline: 'Get in touch',
  lede:
    'Whether you are exploring my freelance services, want to connect professionally, or have a general question — send a message and I will reply by email.',
  clientChecklist: [
    'Sources you pull today (Ads, CRM, sheets, etc.)',
    'How often the pack goes out (weekly / monthly)',
    'Who reads it and what decision it should drive',
    'Where it should land (email, Slack, both)',
  ],
  fields: {
    name: 'Name',
    email: 'Email',
    inquiryType: 'I am reaching out as',
    subject: 'Subject',
    message: 'Message',
  },
  submit: 'Send message',
  submitting: 'Sending your message…',
  processing: 'Submitting — saving to database and sending notifications…',
  success:
    'Message sent successfully. Your submission was saved and email/Telegram notifications were dispatched. I will reply by email soon.',
  savedPartial:
    'Your message was saved to the database, but email notification failed. I may still see it — you can also email me directly if urgent.',
  savedOnly: 'Your message was saved to the database.',
  error: 'Submission failed. Your message was not saved. Please try again or email me directly.',
  configError: 'Contact form is not configured yet. Please email me directly.',
  validation: {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    message: 'Please enter a message (at least 10 characters).',
  },
} as const;
