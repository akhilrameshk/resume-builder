/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface ProjectItem {
  title: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface ParsedResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
}

export async function parseUploadedPdf(file: File): Promise<ParsedResumeData> {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only supported in browser environments.');
  }

  const pdfjsLib = await import('pdfjs-dist');

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let rawLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let currentLine = '';

    for (const item of textContent.items as any[]) {
      const itemStr = item.str;
      if (!itemStr) continue;

      // Group items on the same horizontal line (Y position tolerance)
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 3) {
        if (currentLine.trim()) rawLines.push(currentLine.trim());
        currentLine = itemStr;
      } else {
        currentLine += (currentLine ? ' ' : '') + itemStr;
      }
      lastY = item.transform[5];
    }
    if (currentLine.trim()) rawLines.push(currentLine.trim());
  }

  // Sanitize lines & remove page numbers
  rawLines = rawLines
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => Boolean(l) && !/^Page\s+\d+\s+of\s+\d+/i.test(l));

  const fullText = rawLines.join('\n');

  // Contact Info Extraction
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = fullText.match(/(?:\+?\d{1,3}[\s.-]*)?(?:\(?\d{2,5}\)?[\s.-]*)?\d{3,5}[\s.-]*\d{3,5}/);
  const linkedinMatch = fullText.match(/(?:linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  const locationMatch = fullText.match(/([A-Z][a-zA-Za-z\s]+,\s*(?:UAE|India|USA|UK|[A-Z][a-zA-Za-z\s]+))/i);

  // Section Headings
  const HEADINGS = {
    SUMMARY: /^PROFESSIONAL SUMMARY|^SUMMARY|^PROFILE|^OBJECTIVE/i,
    SKILLS: /^KEY SKILLS|^TECHNICAL EXPERTISE|^SKILLS|^COMPETENCIES/i,
    EXPERIENCE: /^PROFESSIONAL EXPERIENCE|^EXPERIENCE|^WORK HISTORY/i,
    PROJECTS: /^KEY PROJECTS|^PROJECTS/i,
    EDUCATION: /^EDUCATION|^ACADEMIC BACKGROUND/i,
    CERTIFICATIONS: /^CERTIFICATIONS|^LANGUAGES/i,
  };

  const getSectionText = (startPattern: RegExp, endPatterns: RegExp[]): string => {
    const startIdx = rawLines.findIndex((line) => startPattern.test(line));
    if (startIdx === -1) return '';

    let endIdx = rawLines.length;
    for (let i = startIdx + 1; i < rawLines.length; i++) {
      if (endPatterns.some((pattern) => pattern.test(rawLines[i]))) {
        endIdx = i;
        break;
      }
    }

    return rawLines.slice(startIdx + 1, endIdx).join('\n').trim();
  };

  const summaryText = getSectionText(HEADINGS.SUMMARY, [HEADINGS.SKILLS, HEADINGS.EXPERIENCE]);
  const skillsRaw = getSectionText(HEADINGS.SKILLS, [HEADINGS.EXPERIENCE, HEADINGS.EDUCATION, HEADINGS.PROJECTS]);
  const expSection = getSectionText(HEADINGS.EXPERIENCE, [HEADINGS.SKILLS, HEADINGS.PROJECTS, HEADINGS.EDUCATION]);
  const projSection = getSectionText(HEADINGS.PROJECTS, [HEADINGS.EDUCATION, HEADINGS.CERTIFICATIONS]);
  const eduSection = getSectionText(HEADINGS.EDUCATION, [HEADINGS.CERTIFICATIONS]);

  // Clean pipe-separated skills into clean comma-separated string
  const cleanSkills = skillsRaw
    .split('\n')
    .map((line) => line.split('|').map((s) => s.trim()).filter(Boolean).join(', '))
    .filter(Boolean)
    .join(', ');

  // Header Details
  const fullName = rawLines[0] || '';
  let jobTitle = '';

  if (
    rawLines[1] &&
    !Object.values(HEADINGS).some((h) => h.test(rawLines[1])) &&
    !rawLines[1].includes('@')
  ) {
    jobTitle = rawLines[1].replace(/\|.*/, '').trim();
  }

  return {
    fullName,
    jobTitle,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    location: locationMatch ? locationMatch[0].trim() : '',
    linkedin: linkedinMatch ? linkedinMatch[0] : '',
    summary: summaryText,
    skills: cleanSkills,
    experience: parseExperienceLines(expSection),
    projects: parseProjectsLines(projSection),
    education: parseEducationLines(eduSection),
  };
}

function parseExperienceLines(sectionText: string): ExperienceItem[] {
  if (!sectionText) return [];

  const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean);
  const experiences: ExperienceItem[] = [];
  let currentExp: ExperienceItem | null = null;

  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\s*[-–—\s]*\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{4})/i;
  const isBullet = (str: string) => /^[•\-\*]\s*/.test(str);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const cleanLine = rawLine.replace(/^[•\-\*]\s*/, '').trim();
    const periodMatch = rawLine.match(datePattern);

    if (periodMatch) {
      if (currentExp) experiences.push(currentExp);

      let titleCompany = rawLine.replace(periodMatch[0], '').replace(/^[•\-\*]\s*/, '').trim();
      let company = '';
      let title = titleCompany;

      if (titleCompany.includes('-')) {
        const parts = titleCompany.split('-');
        title = parts[0].trim();
        company = parts[1].trim();
      } else if (i > 0 && !isBullet(lines[i - 1])) {
        title = lines[i - 1].trim();
        company = titleCompany;
      }

      currentExp = {
        title: title || 'Senior Developer',
        company: company,
        period: periodMatch[0].trim(),
        bullets: [],
      };
    } else if (currentExp) {
      if (isBullet(rawLine)) {
        currentExp.bullets.push(cleanLine);
      } else if (!currentExp.company && !isBullet(rawLine) && currentExp.bullets.length === 0) {
        currentExp.company = cleanLine;
      } else if (currentExp.bullets.length > 0) {
        // Append text continuation to the previous bullet
        currentExp.bullets[currentExp.bullets.length - 1] += ' ' + cleanLine;
      }
    }
  }

  if (currentExp) experiences.push(currentExp);
  return experiences;
}

function parseProjectsLines(sectionText: string): ProjectItem[] {
  if (!sectionText) return [];

  const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean);
  const projects: ProjectItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^[•\-\*]\s*/, '').trim();
    if (line.length > 0 && line.length < 90 && !lines[i].startsWith('•')) {
      const description = lines[i + 1] ? lines[i + 1].replace(/^[•\-\*]\s*/, '').trim() : '';
      projects.push({
        title: line,
        description: description.startsWith('•') ? '' : description,
      });
      if (description && !description.startsWith('•')) i++;
    }
  }

  return projects;
}

function parseEducationLines(sectionText: string): EducationItem[] {
  if (!sectionText) return [];

  const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean);
  const education: EducationItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const yearMatch = line.match(/\(\d{4}\)|\d{4}\s*[-–—]\s*\d{4}|\d{4}/);

    if (yearMatch) {
      const degreeInst = line.replace(yearMatch[0], '').replace(/^[•\-\*]\s*/, '').trim();
      let degree = degreeInst;
      let institution = '';

      if (degreeInst.includes('-')) {
        const parts = degreeInst.split('-');
        degree = parts[0].trim();
        institution = parts[1].trim();
      }

      education.push({
        degree: degree || 'Degree',
        institution,
        year: yearMatch[0].replace(/[()]/g, ''),
      });
    }
  }

  return education;
}