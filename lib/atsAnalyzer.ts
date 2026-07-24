export interface ATSAnalysis {
  score: number;
  wordCount: number;
  detectedSections: string[];
  missingSections: string[];
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  careerLevelDetected: 'Senior / Lead Level' | 'Mid Level' | 'Junior Level';
}

const REQUIRED_SECTIONS = ['Summary', 'Experience', 'Education', 'Skills'];

const CORE_UNIVERSAL_TERMS = [
  'management', 'operations', 'communication', 'leadership', 'compliance',
  'coordination', 'planning', 'problem solving', 'reporting', 'quality',
  'process', 'collaboration', 'strategy', 'documentation', 'customer service'
];

// Senior and Lead expectations keywords
const SENIOR_LEAD_TERMS = [
  'lead', 'senior', 'architecture', 'strategy', 'roadmap', 'mentorship',
  'stakeholder', 'governance', 'budget', 'optimization', 'escalation',
  'team lead', 'project management', 'cross-functional', 'process improvement'
];

export function extractKeywordsFromText(text: string): string[] {
  const stopWords = new Set([
    'and', 'the', 'for', 'with', 'that', 'this', 'from', 'have', 'were',
    'been', 'their', 'which', 'about', 'would', 'there', 'will', 'each',
    'page', 'resume', 'curriculum', 'vitae', 'phone', 'email', 'address'
  ]);

  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s#+\-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w))
    )
  );
}

export function parseResumeTextToData(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  
  const fullName = lines.length > 0 ? lines[0] : '';
  const jobTitle = lines.length > 1 ? lines[1] : '';

  return {
    fullName,
    jobTitle,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    summary: text.slice(0, 500),
    skills: extractKeywordsFromText(text).slice(0, 15).join(', '),
  };
}

export function analyzeATSText(
  text: string,
  targetJobRole: string = '',
  customKeywordsInput: string = ''
): ATSAnalysis {
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Detect Standard Sections
  const detectedSections: string[] = [];
  const missingSections: string[] = [];
  REQUIRED_SECTIONS.forEach((sec) => {
    if (lowerText.includes(sec.toLowerCase())) {
      detectedSections.push(sec);
    } else {
      missingSections.push(sec);
    }
  });

  // 2. Career Level Detection Logic
  const containsSeniorKeywords = SENIOR_LEAD_TERMS.some((kw) => lowerText.includes(kw)) ||
    targetJobRole.toLowerCase().includes('senior') ||
    targetJobRole.toLowerCase().includes('lead') ||
    targetJobRole.toLowerCase().includes('manager');

  const careerLevelDetected = containsSeniorKeywords
    ? 'Senior / Lead Level'
    : wordCount > 400
    ? 'Mid Level'
    : 'Junior Level';

  // 3. Build Dynamic Target Keywords
  const dynamicJobKeywords = extractKeywordsFromText(targetJobRole);
  const customKeywords = customKeywordsInput
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  const seniorBaseline = containsSeniorKeywords ? SENIOR_LEAD_TERMS : [];

  const allTargetKeywords = Array.from(
    new Set([...CORE_UNIVERSAL_TERMS, ...seniorBaseline, ...dynamicJobKeywords, ...customKeywords])
  );

  // 4. Keyword Match
  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  allTargetKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // 5. Score Calculation
  const sectionScore = (detectedSections.length / REQUIRED_SECTIONS.length) * 40;
  const matchRatio = allTargetKeywords.length > 0 ? foundKeywords.length / allTargetKeywords.length : 1;
  const keywordScore = Math.min(40, matchRatio * 50);

  let lengthScore = 0;
  if (wordCount >= 350 && wordCount <= 1200) {
    lengthScore = 20;
  } else if (wordCount >= 200) {
    lengthScore = 12;
  } else if (wordCount > 0) {
    lengthScore = 5;
  }

  const score = Math.min(100, Math.round(sectionScore + keywordScore + lengthScore));

  // 6. Level-Appropriate Suggestions
  const suggestions: string[] = [];
  if (missingSections.length > 0) {
    suggestions.push(`Missing section headers: ${missingSections.join(', ')}.`);
  }
  if (careerLevelDetected === 'Senior / Lead Level') {
    if (!lowerText.includes('strategy') && !lowerText.includes('leadership')) {
      suggestions.push('For a Senior/Lead role, highlight strategic leadership, team oversight, and high-level accomplishments.');
    }
  }
  if (wordCount < 300) {
    suggestions.push(`Word count is low (${wordCount} words) for a senior/lead candidate. Detail major achievements.`);
  }

  return {
    score,
    wordCount,
    detectedSections,
    missingSections,
    foundKeywords,
    missingKeywords,
    suggestions,
    careerLevelDetected,
  };
}