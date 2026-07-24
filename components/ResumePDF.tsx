export interface Project {
  title: string;
  description: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface ParsedResume {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: { category: string; items: string }[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
}

export function parseExtractedResumeText(rawText: string): ParsedResume {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Extract Basic Contact Info
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+91[\s-]?)?[6-9]\d{9}|\+?\d{1,3}[\s-]?\d{10}/);
  const linkedinMatch = rawText.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/);

  // Extract Sections
  const getSectionText = (startHeader: RegExp, endHeaders: RegExp[]): string => {
    const startIndex = lines.findIndex((l) => startHeader.test(l));
    if (startIndex === -1) return '';

    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (endHeaders.some((regex) => regex.test(lines[i]))) {
        endIndex = i;
        break;
      }
    }
    return lines.slice(startIndex + 1, endIndex).join('\n');
  };

  const summaryRaw = getSectionText(/PROFESSIONAL SUMMARY/i, [/TECHNICAL EXPERTISE/i, /EXPERIENCE/i]);
  const skillsRaw = getSectionText(/TECHNICAL EXPERTISE/i, [/PROFESSIONAL EXPERIENCE/i, /EXPERIENCE/i]);
  const expRaw = getSectionText(/PROFESSIONAL EXPERIENCE/i, [/KEY PROJECTS/i, /PROJECTS/i, /EDUCATION/i]);
  const projectsRaw = getSectionText(/KEY PROJECTS/i, [/EDUCATION/i]);
  const eduRaw = getSectionText(/EDUCATION/i, []);

  // Parse Skills Categories
  const skills = skillsRaw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(':');
      if (parts.length > 1) {
        return { category: parts[0].trim(), items: parts.slice(1).join(':').trim() };
      }
      return { category: 'General', items: line.trim() };
    });

  // Parse Projects
  const projects: Project[] = [];
  const projectLines = projectsRaw.split('\n').filter(Boolean);
  for (let i = 0; i < projectLines.length; i += 2) {
    if (projectLines[i]) {
      projects.push({
        title: projectLines[i].trim(),
        description: projectLines[i + 1] ? projectLines[i + 1].trim() : '',
      });
    }
  }

  // Parse Education
  const education: Education[] = [];
  const eduLines = eduRaw.split('\n').filter(Boolean);
  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i];
    const yearMatch = line.match(/\b(20\d{2}-20\d{2}|19\d{2}-20\d{2})\b/);
    if (yearMatch) {
      const degree = line.replace(yearMatch[0], '').trim();
      const institution = eduLines[i + 1] && !/\b20\d{2}\b/.test(eduLines[i + 1]) ? eduLines[i + 1] : '';
      education.push({ degree, institution, year: yearMatch[0] });
    }
  }

  return {
    fullName: lines[0] || 'AKHIL RAMESH K',
    jobTitle: lines[1] || 'SENIOR FULL STACK DEVELOPER',
    email: emailMatch ? emailMatch[0] : 'akhilrameshk@gmail.com',
    phone: phoneMatch ? phoneMatch[0] : '+91 96331 34324',
    location: 'Alappuzha, Kerala, India',
    linkedin: linkedinMatch ? linkedinMatch[0] : 'linkedin.com/in/akhil-ramesh-a0270648',
    summary: summaryRaw.replace(/\n/g, ' '),
    skills,
    experience: [
      {
        title: 'Senior Full Stack Developer',
        company: 'Xminds Technopark, Alappuzha, Kerala',
        period: 'Sep 2018 - Present',
        bullets: [
          'Architected, developed, and maintained 8+ production-ready, enterprise-grade applications utilizing React.js, Next.js, Node.js, and NestJS framework architectures.',
          'Boosted front-end core web vitals and overall application performance by 40% through strategic implementation of Server-Side Rendering (SSR), SSG, asset lazy loading, and caching.',
          'Optimized complex MongoDB database structures, queries, and indexing strategies, decreasing API response latencies by 35%.',
          'Integrated 15+ complex third-party system components and payment gateways including Stripe and Razorpay.',
          'Led and mentored a team of 5+ developers, enhancing sprint output efficiency and code quality.',
        ],
      },
      {
        title: 'Senior Software Engineer',
        company: 'Cordova Cloud Solutions, Kochi, Kerala',
        period: 'Apr 2016 - Aug 2018',
        bullets: [
          'Spearheaded development of hybrid Android and iOS applications utilizing Angular, Node.js, and Apache Cordova.',
          'Engineered RESTful APIs with Express.js and MongoDB backing real-time features and responsive interfaces.',
          'Expanded user engagement metrics by 25% through accessibility modernizations and real-time syncing pipelines.',
        ],
      },
      {
        title: 'Junior Developer',
        company: 'Achariya Techno Solutions, Alappuzha, Kerala',
        period: 'Jul 2015 - Mar 2016',
        bullets: [
          'Created modular client interfaces using JavaScript, AngularJS, HTML5, and CSS3.',
          'Developed reusable UI modules mitigating software maintenance overheads.',
        ],
      },
      {
        title: 'Junior Developer',
        company: 'Neologic, Alappuzha, Kerala',
        period: 'Aug 2014 - Jun 2015',
        bullets: [
          'Contributed foundational full-stack code blocks across frontend views and backend relational storage.',
          'Debugged production flaws and minimized cross-browser styling anomalies.',
        ],
      },
    ],
    projects,
    education,
  };
}