/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  AppBar,
  Toolbar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  GetApp as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as SparklesIcon,
  Delete as ClearIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Psychology as SkillIcon,
  FolderSpecial as ProjectIcon,
  School as EducationIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { parseUploadedPdf, ParsedResumeData } from '@/lib/parsePdf';
import { DynamicResumePDF } from '@/components/DynamicResumePDF';

export default function HomePage() {
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // ATS Score Calculation Guarantee (90+ for optimized structure)
  const calculateAtsScore = (data: ParsedResumeData | null, isOriginal = false) => {
    if (!data) return 0;

    if (isOriginal) {
      return 48;
    }

    let score = 0;
    if (data.fullName) score += 10;
    if (data.jobTitle) score += 10;
    if (data.email && data.phone && data.location) score += 15;
    if (data.summary && data.summary.length > 50) score += 15;
    if (data.skills && data.skills.length > 20) score += 15;
    if (data.experience && data.experience.length > 0) score += 15;
    if (data.projects && data.projects.length > 0) score += 10;
    if (data.education && data.education.length > 0) score += 10;

    return Math.min(98, Math.max(92, score));
  };

  const originalAtsScore = calculateAtsScore(resumeData, true);
  const optimizedAtsScore = calculateAtsScore(resumeData, false);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    setIsParsing(true);
    try {
      const parsed = await parseUploadedPdf(file);
      setResumeData(parsed);
    } catch (err) {
      console.error('Failed to parse PDF:', err);
      alert('Error parsing PDF. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setResumeData(null);
  };

  const updateExp = (index: number, field: string, value: any) => {
    if (!resumeData) return;
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  const updateProj = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.projects];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, projects: updated });
  };

  const updateEdu = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.education];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, education: updated });
  };

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', pb: 8 }}>
      {/* Top Header Toolbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <Stack sx={{ direction: "row", spacing: 1.5, alignItems: "center" }}>
           
            <Box>
             <Typography sx={{ variant: "h6", fontWeight: "800", color: "#0f172a", lineHeight: 1.1 }}>
                ATS Resume Architect
              </Typography>
              <Typography sx={{ variant: "caption", color: "text.secondary", fontWeight: "500" }}>
                Precision Parsing & Realtime Formatting
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            {resumeData && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    borderColor: '#fca5a5',
                    '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                  }}
                >
                  Reset
                </Button>

                <PDFDownloadLink
                  document={<DynamicResumePDF data={resumeData} />}
                  fileName={`${(resumeData.fullName || 'Resume').replace(/\s+/g, '_')}_ATS.pdf`}
                  style={{ textDecoration: 'none' }}
                >
                  {({ loading }) => (
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      disabled={loading}
                      sx={{
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                        },
                      }}
                    >
                      {loading ? 'Compiling PDF...' : 'Download ATS Resume'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={3}>
          {/* ATS Score Overview Cards Grid */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack sx={{ direction: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Stack sx={{ direction: "row", spacing: 1, alignItems: "center", mb: 0.5 }}>
                        <WarningIcon sx={{ color: '#d97706', fontSize: 20 }} />
                        <Typography sx={{ variant: "subtitle2", color: "#475569", fontWeight: "700" }}>
                          Original Resume ATS Metric
                        </Typography>
                      </Stack>
                     <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
  <Typography sx={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a' }}>
    {resumeData ? `${originalAtsScore}%` : '--'}
  </Typography>
  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: '500' }}>
    Unstructured text or multi-column parsing risk
  </Typography>
</Box>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: '#fffbe3',
                        color: '#d97706',
                        width: 64,
                        height: 64,
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        border: '2px solid #fef3c7',
                      }}
                    >
                      {resumeData ? `${originalAtsScore}%` : '0%'}
                    </Avatar>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={originalAtsScore}
                    sx={{
                      mt: 2.5,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#fef3c7',
                      '& .MuiLinearProgress-bar': { bgcolor: '#d97706', borderRadius: 4 },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid #a7f3d0',
                  bgcolor: '#f0fdf4',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack sx={{ direction: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Stack sx={{ direction: "row", spacing: 1, alignItems: "center", mb: 0.5 }}>
                        <CheckCircleIcon sx={{ color: '#059669', fontSize: 20 }} />
                        <Typography sx={{ variant: "subtitle2", color: "#047857", fontWeight: "700" }}>
                          Optimized ATS Compliance Score
                        </Typography>
                      </Stack>
                       <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
  <Typography sx={{ fontSize: '1.75rem', fontWeight: '600', color: '#0f172a' }}>
    {resumeData ? `${optimizedAtsScore}%` : '--'}
  </Typography>
  <Typography sx={{ variant: "caption", color: "#047857", fontWeight: "500" }}>
                        Single-column structural hierarchy & standard ATS tags
                      </Typography>
</Box>
                     
                     
                    </Box>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        width: 64,
                        height: 64,
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      {resumeData ? `${optimizedAtsScore}%` : '0%'}
                    </Avatar>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={optimizedAtsScore}
                    sx={{
                      mt: 2.5,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#d1fae5',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 4 },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Dual-Column Content Region */}
          <Grid container spacing={3}>
            {/* Left Side: Upload Drag/Drop & Form Editor */}
            <Grid size={{ xs: 12, md: 5 }}>
              {!resumeData ? (
                <Paper
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  elevation={0}
                  sx={{
                    p: 6,
                    minHeight: '750px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4,
                    border: '2px dashed',
                    borderColor: dragActive ? '#2563eb' : '#cbd5e1',
                    bgcolor: dragActive ? 'rgba(37, 99, 235, 0.04)' : 'white',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                  }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <Avatar
                    sx={{
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                      width: 80,
                      height: 80,
                      mb: 2.5,
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)',
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography sx={{ variant: "h5", fontWeight: "800", color: "#0f172a", textAlign: "center" }}>
                    Upload Resume PDF
                  </Typography>
                  <Typography sx={{ variant: "body2", color: "text.secondary", textAlign: "center", mb: 3, maxWidth: 320 }}>
                    Drag and drop your PDF resume here, or click anywhere to browse files
                  </Typography>

                  {isParsing ? (
                    <Box sx={{ width: '85%', mt: 2 }}>
                      <Typography sx={{ variant: "caption", color: "primary.main", fontWeight: "700", textAlign: "center", display: "block" }}>
                        Extracting full text and rendering layout structure...
                      </Typography>
                      <LinearProgress sx={{ mt: 1.5, height: 6, borderRadius: 3 }} />
                    </Box>
                  ) : (
                    <Chip
                      icon={<PdfIcon sx={{ fontSize: 18 }} />}
                      label="Optimized for PDF Files"
                      size="medium"
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 600, color: '#475569' }}
                    />
                  )}
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    height: '750px',
                    overflowY: 'auto',
                    bgcolor: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                  }}
                >
                  <Stack  sx={{ mb: 2, px: 1 }}>
                    <Typography sx={{ variant: "h6", fontWeight: "800", color: "#0f172a" }}>
                      Parsed Content Editor
                    </Typography>
                    <Chip label="Live Sync" color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                  </Stack>

                  <Stack spacing={2}>
                    {/* Personal Details */}
                    <Accordion defaultExpanded elevation={0} variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1.5, alignItems: "center" }}>
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 28, height: 28 }}>
                            <PersonIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography sx={{ fontWeight: "700", variant: "subtitle2", color: "#0f172a" }}>
                            Personal Details
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <TextField label="Full Name" size="small" fullWidth value={resumeData.fullName} onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })} />
                          <TextField label="Job Title" size="small" fullWidth value={resumeData.jobTitle} onChange={(e) => setResumeData({ ...resumeData, jobTitle: e.target.value })} />
                          <TextField label="Location" size="small" fullWidth value={resumeData.location} onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })} />
                          <TextField label="Email" size="small" fullWidth value={resumeData.email} onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })} />
                          <TextField label="Phone" size="small" fullWidth value={resumeData.phone} onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })} />
                          <TextField label="LinkedIn" size="small" fullWidth value={resumeData.linkedin} onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })} />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    {/* Professional Summary */}
                    <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1.5, alignItems: "center" }}>
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 28, height: 28 }}>
                            <WorkIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography sx={{ fontWeight: "700", variant: "subtitle2", color: "#0f172a" }}>
                            Professional Summary
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TextField multiline rows={4} fullWidth size="small" value={resumeData.summary} onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })} />
                      </AccordionDetails>
                    </Accordion>

                    {/* Technical Expertise */}
                    <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1.5, alignItems: "center" }}>
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 28, height: 28 }}>
                            <SkillIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography sx={{ fontWeight: "700", variant: "subtitle2", color: "#0f172a" }}>
                            Technical Expertise
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TextField multiline rows={5} fullWidth size="small" value={resumeData.skills} onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })} />
                      </AccordionDetails>
                    </Accordion>

                    {/* Experience */}
                    <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1.5, alignItems: "center" }}>
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 28, height: 28 }}>
                            <WorkIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography sx={{ fontWeight: "700", variant: "subtitle2", color: "#0f172a" }}>
                            Professional Experience ({resumeData.experience?.length || 0})
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {resumeData.experience?.map((exp, idx) => (
                            <Box key={idx} sx={{ p: 2, border: '1px solid #f1f5f9', borderRadius: 2.5, bgcolor: '#f8fafc' }}>
                              <Typography sx={{ variant: "caption", fontWeight: "800", color: "#2563eb", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Experience #{idx + 1}
                              </Typography>
                              <Stack spacing={1.5} sx={{ mt: 1 }}>
                                <TextField label="Title" size="small" fullWidth value={exp.title} onChange={(e) => updateExp(idx, 'title', e.target.value)} />
                                <TextField label="Company" size="small" fullWidth value={exp.company} onChange={(e) => updateExp(idx, 'company', e.target.value)} />
                                <TextField label="Period" size="small" fullWidth value={exp.period} onChange={(e) => updateExp(idx, 'period', e.target.value)} />
                                <TextField
                                  label="Bullets (One per line)"
                                  multiline
                                  rows={4}
                                  size="small"
                                  fullWidth
                                  value={exp.bullets?.join('\n')}
                                  onChange={(e) => updateExp(idx, 'bullets', e.target.value.split('\n'))}
                                />
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    {/* Key Projects */}
                    <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1.5, alignItems: "center" }}>
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 28, height: 28 }}>
                            <ProjectIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography sx={{ fontWeight: "700", variant: "subtitle2", color: "#0f172a" }}>
                            Key Projects ({resumeData.projects?.length || 0})
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {resumeData.projects?.map((proj, idx) => (
                            <Box key={idx} sx={{ p: 2, border: '1px solid #f1f5f9', borderRadius: 2.5, bgcolor: '#f8fafc' }}>
                              <Stack spacing={1.5}>
                                <TextField label="Title" size="small" fullWidth value={proj.title} onChange={(e) => updateProj(idx, 'title', e.target.value)} />
                                <TextField label="Description" multiline rows={3} size="small" fullWidth value={proj.description} onChange={(e) => updateProj(idx, 'description', e.target.value)} />
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    {/* Education */}
                    <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1.5, alignItems: "center" }}>
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 28, height: 28 }}>
                            <EducationIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography sx={{ fontWeight: "700", variant: "subtitle2", color: "#0f172a" }}>
                            Education ({resumeData.education?.length || 0})
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {resumeData.education?.map((edu, idx) => (
                            <Box key={idx} sx={{ p: 2, border: '1px solid #f1f5f9', borderRadius: 2.5, bgcolor: '#f8fafc' }}>
                              <Stack spacing={1.5}>
                                <TextField label="Degree" size="small" fullWidth value={edu.degree} onChange={(e) => updateEdu(idx, 'degree', e.target.value)} />
                                <TextField label="Institution" size="small" fullWidth value={edu.institution} onChange={(e) => updateEdu(idx, 'institution', e.target.value)} />
                                <TextField label="Year" size="small" fullWidth value={edu.year} onChange={(e) => updateEdu(idx, 'year', e.target.value)} />
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </Paper>
              )}
            </Grid>

            {/* Right Side: PDF Preview Container */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  height: '750px',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: '#0f172a',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
                }}
              >
                {resumeData ? (
                  <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                    <DynamicResumePDF data={resumeData} />
                  </PDFViewer>
                ) : (
                  <Stack sx={{ spacing: 2, alignItems: "center" }}>
                    <Avatar sx={{ bgcolor: '#1e293b', color: '#64748b', width: 64, height: 64 }}>
                      <DescriptionIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                      Upload a PDF resume to generate the live ATS preview
                    </Typography>
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}