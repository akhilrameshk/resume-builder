import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ParsedResumeData } from '@/lib/parsePdf';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 35,
    paddingHorizontal: 35,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderBottomStyle: 'solid',
    paddingBottom: 6,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    marginTop: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    color: '#475569',
    fontSize: 8.5,
    marginTop: 2,
  },
  contactItem: {
    marginRight: 6,
  },
  section: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  summaryText: {
    color: '#334155',
    textAlign: 'justify',
  },
  skillRow: {
    marginBottom: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillText: {
    color: '#334155',
    fontSize: 8.5,
  },
  entryBlock: {
    marginBottom: 7,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  entrySubTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Oblique',
    color: '#1d4ed8',
    marginBottom: 3,
  },
  entryPeriod: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
  },
  bulletList: {
    marginTop: 1,
    paddingLeft: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletPoint: {
    width: 10,
    fontSize: 9,
    color: '#1d4ed8',
  },
  bulletContent: {
    flex: 1,
    color: '#334155',
    fontSize: 8.5,
    textAlign: 'justify',
  },
  projectItem: {
    marginBottom: 5,
  },
  projectTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  projectDesc: {
    color: '#334155',
    fontSize: 8.5,
    marginTop: 1,
  },
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});

interface DynamicResumePDFProps {
  data: ParsedResumeData;
}

export const DynamicResumePDF: React.FC<DynamicResumePDFProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName || 'AKHIL RAMESH K'}</Text>
          {data.jobTitle ? <Text style={styles.title}>{data.jobTitle}</Text> : null}
          <View style={styles.contactRow}>
            {data.email ? <Text style={styles.contactItem}>Email: {data.email}</Text> : null}
            {data.phone ? <Text style={styles.contactItem}>| Phone: {data.phone}</Text> : null}
            {data.location ? <Text style={styles.contactItem}>| Location: {data.location}</Text> : null}
            {data.linkedin ? <Text style={styles.contactItem}>| LinkedIn: {data.linkedin}</Text> : null}
          </View>
        </View>

        {/* Professional Summary */}
        {data.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {/* Technical Expertise */}
        {data.skills ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Expertise</Text>
            {data.skills.split('\n').map((line, idx) => (
              <View key={idx} style={styles.skillRow}>
                <Text style={styles.skillText}>{line.trim()}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Professional Experience */}
        {data.experience && data.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, idx) => (
              <View key={idx} style={styles.entryBlock}>
                <View style={styles.entryHeader} wrap={false}>
                  <Text style={styles.entryTitle}>{exp.title}</Text>
                  <Text style={styles.entryPeriod}>{exp.period}</Text>
                </View>
                {exp.company ? <Text style={styles.entrySubTitle}>{exp.company}</Text> : null}

                {exp.bullets && exp.bullets.length > 0 ? (
                  <View style={styles.bulletList}>
                    {exp.bullets
                      .filter((b) => b && b.trim() !== '')
                      .map((bullet, bIdx) => (
                        <View key={bIdx} style={styles.bulletRow} wrap={false}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.bulletContent}>{bullet.trim()}</Text>
                        </View>
                      ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Key Projects */}
        {data.projects && data.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Projects</Text>
            {data.projects.map((proj, idx) => (
              <View key={idx} style={styles.projectItem} wrap={false}>
                <Text style={styles.projectTitle}>{proj.title}</Text>
                <Text style={styles.projectDesc}>{proj.description}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {data.education && data.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, idx) => (
              <View key={idx} style={styles.eduRow} wrap={false}>
                <View>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entrySubTitle}>{edu.institution}</Text>
                </View>
                <Text style={styles.entryPeriod}>{edu.year}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};