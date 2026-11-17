export type Highlight = 'yellow' | 'green' | 'pink' | 'blue';
export type CaptionPart = { text: string; mark?: Highlight };

export const site = {
  name: 'Shouvik Ahmed Antu',
  shortName: 'S. A. Antu',
  description:
    'Shouvik Ahmed Antu builds conversational AI for education, in text and voice, and studies whether it improves how students reason. MSc AI, UPF Barcelona.',
  email: 'shouvikwu26@gmail.com',
  links: {
    github: 'https://github.com/shouvikantu',
    linkedin: 'https://www.linkedin.com/in/shouvikantu/',
    continuity: 'https://continuity.ai4edulab.com',
    cv: '/cv.pdf',
  },
  caption: {
    speaker: 'SHOUVIK',
    parts: [
      { text: 'I build ' },
      { text: 'conversational AI that talks with students', mark: 'yellow' },
      { text: ', in text and in voice, and ' },
      { text: 'measure whether it actually improves how they reason', mark: 'green' },
      { text: '. Now an Erasmus Mundus MSc student in AI at Universitat Pompeu Fabra, Barcelona.' },
    ] satisfies CaptionPart[],
  },
  now: [
    { label: 'NOW', text: 'Erasmus Mundus MSc in AI, UPF Barcelona and Sapienza Rome, 2026–28' },
    { label: 'LAB', text: 'Research assistant, TIDE Lab, Universitat Pompeu Fabra' },
    { label: 'NEXT', text: 'Presenting at SIGCSE TS, Sacramento, Feb 2027' },
  ],
  outside: 'Outside the lab: volleyball setter, KL-YES alum.',
};
