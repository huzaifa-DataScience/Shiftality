// src/screens/survey/sections.ts
export type Section = {
  title: string;
  subtitle: string;
  questions: string[];
};

export const SECTIONS: Section[] = [
  {
    title: 'Finance',
    subtitle: 'Rate how much you agree with each statement',
    questions: [
      'I deserve to be well-paid for the value I create.',
      'Money is scarce and hard for me to get.',
      'My actions this year can improve my finances',
      'Unexpected costs are manageable.',
      'Opportunities show up when I show up.',
    ],
  },
  {
    title: 'Health & Energy',
    subtitle: 'Rate how much you agree with each statement',
    questions: [
      'Small choices can shift my energy.',
      'My body restores easily when I care for it.',
      'I’m too busy to care for my body.',
      'Protecting sleep is within my control.',
      'A low moment doesn’t define the day.',
    ],
  },
  {
    title: 'Focus & Growth',
    subtitle: 'Rate how much you agree with each statement',
    questions: [
      'I do the important thing first.',
      'Distractions mostly control my day.',
      'Small, consistency reps add up for me.',
      'If it isn’t perfect, I tend to avoid it.',
      'I can recover quickly after a slip.',
    ],
  },
  {
    title: 'Relationships & Belonging',
    subtitle: 'Rate how much you agree with each statement',
    questions: [
      'I am loved, loving, and chosen.',
      'I’ll be misunderstood or rejected.',
      'I can repair after conflict.',
      'Reaching out first is safe for me.',
      'People are generally for me.',
    ],
  },
  {
    title: 'Identity & Self-worth',
    subtitle: 'Rate how much you agree with each statement',
    questions: [
      'I keep promises to future-me.',
      'I am enough as I grow',
      'My past defines what’s possible for me.',
      'I can choose a better story at any moment.',
      'Change isn’t really available to me.',
    ],
  },
  {
    title: 'Calm & Resilience',
    subtitle: 'Rate how much you agree with each statement',
    questions: [
      'I can return to calm quickly.',
      'Stress is who I am',
      'Challenges are feedback, not failure.',
      'I can choose the generous interpretation.',
      'I bounce back when things go wrong.',
    ],
  },
];
