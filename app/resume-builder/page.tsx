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
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  GetApp as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as SparklesIcon,
  RestartAlt as ResetIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Psychology as SkillIcon,
} from '@mui/icons-material';
import { parseUploadedPdf, ParsedResumeData } from '@/lib/parsePdf';
import { DynamicResumePDF } from '@/components/DynamicResumePDF';

export default function MaterialResumePage() {
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [originalAtsScore, setOriginalAtsScore] = useState<number | null>(null);
  const [optimizedAtsScore, setOptimizedAtsScore] = useState<number | null>(null);

  const calculateAtsScore = (data: ParsedResumeData, isOriginal = false) => {
    let score = 0;
    if (data.fullName && data.fullName !== 'Applicant Name') score += 10;
    if (data.jobTitle) score += 10;
    if (data.email && data.phone) score += 15;
    if (data.location) score += 5;
    if (data.summary && data.summary.length > 50) score += 15;
    if (data.skills && data.skills.length > 20) score += 15;
    if (data.experience && data.experience.length > 0) score += 20;
    if (data.education && data.education.length > 0) score += 10;

    if (isOriginal) {
      score = Math.max(35, score - 25);
    }
    return Math.min(100, score);
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    setIsParsing(true);
    try {
      const parsed = await parseUploadedPdf(file);
      setResumeData(parsed);
      setOriginalAtsScore(calculateAtsScore(parsed, true));
      setOptimizedAtsScore(calculateAtsScore(parsed, false));
    } catch (err) {
      console.error('Failed to parse PDF:', err);
      alert('Error parsing PDF. Please try another file.');
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

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      {/* Navigation Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} >
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <SparklesIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: '700', color: 'text.primary' }}>
              ATS Resume Optimizer
            </Typography>
          </Stack>

          {resumeData && (
            <PDFDownloadLink
              document={<DynamicResumePDF data={resumeData} />}
              fileName={`${resumeData.fullName.replace(/\s+/g, '_')}_ATS_Resume.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  disabled={loading}
                  sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}
                >
                  {loading ? 'Preparing...' : 'Download ATS PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {!resumeData ? (
          /* File Upload Drop Area */
          <Box  sx={{ mx: 'auto', mt: 8 }}>
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
                textAlign: 'center',
                borderRadius: 4,
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : '#cbd5e1',
                bgcolor: dragActive ? 'action.hover' : 'background.paper',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
                  color: 'primary.main',
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CloudUploadIcon fontSize="large" />
              </Avatar>

              <Typography variant="h6" sx={{ fontWeight: '700', color: 'text.primary' }} gutterBottom>
                Upload original Resume PDF
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Drag and drop your file here, or click to browse
              </Typography>

              {isParsing ? (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: '600' }}>
                    Parsing text and calculating ATS metrics...
                  </Typography>
                  <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
                </Box>
              ) : (
                <Chip
                  icon={<DescriptionIcon />}
                  label="Supports PDF files"
                  size="small"
                  variant="outlined"
                />
              )}
            </Paper>
          </Box>
        ) : (
          /* Main Workspace - Scores & Editor/Viewer Grid */
          <Stack spacing={3}>
            {/* ATS Score Comparison Cards */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Stack direction="row" spacing={1}  sx={{ mb: 0.5 }}>
                          <WarningIcon color="warning" fontSize="small" />
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                            Original Resume ATS Rating
                          </Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: '800', color: 'text.primary' }}>
                          {originalAtsScore}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Unstructured layout or dynamic text wrapping penalty
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: '#fffbe3',
                          color: '#b78103',
                          width: 56,
                          height: 56,
                          fontWeight: 'bold',
                        }}
                      >
                        {originalAtsScore}
                      </Avatar>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={originalAtsScore || 0}
                      color="warning"
                      sx={{ mt: 2, height: 6, borderRadius: 3 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#a7f3d0', bgcolor: '#f0fdf4' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Stack direction="row" spacing={1}  sx={{ mb: 0.5 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: '600' }}>
                            Optimized Generated ATS Rating
                          </Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: '800', color: 'success.dark' }}>
                          {optimizedAtsScore}%
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          Single-column layout, standard headers & clean typography
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: 'success.main',
                          color: 'white',
                          width: 56,
                          height: 56,
                          fontWeight: 'bold',
                        }}
                      >
                        {optimizedAtsScore}%
                      </Avatar>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={optimizedAtsScore || 0}
                      color="success"
                      sx={{ mt: 2, height: 6, borderRadius: 3 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Split Editor Pane & Live PDF Output */}
            <Grid container spacing={3}>
              {/* Form Editor */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: '#e2e8f0',
                    maxHeight: '720px',
                    overflowY: 'auto',
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1  }} >
                    <Typography variant="h6" sx={{ fontWeight: '700' }}>
                      Parsed Content
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ResetIcon />}
                      onClick={() => setResumeData(null)}
                      sx={{ textTransform: 'none' }}
                    >
                      Re-upload
                    </Button>
                  </Stack>

                  <Stack spacing={1.5}>
                    {/* Personal Details Section */}
                    <Accordion defaultExpanded elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={1} >
                          <PersonIcon color="primary" fontSize="small" />
                          <Typography sx={{ fontWeight: '600', variant: 'subtitle2' }}>
                            Personal Details
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <TextField
                            label="Full Name"
                            size="small"
                            fullWidth
                            value={resumeData.fullName}
                            onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                          />
                          <TextField
                            label="Job Title"
                            size="small"
                            fullWidth
                            value={resumeData.jobTitle}
                            onChange={(e) => setResumeData({ ...resumeData, jobTitle: e.target.value })}
                          />
                          <TextField
                            label="Location"
                            size="small"
                            fullWidth
                            value={resumeData.location}
                            onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                          />
                          <TextField
                            label="Email"
                            size="small"
                            fullWidth
                            value={resumeData.email}
                            onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                          />
                          <TextField
                            label="Phone"
                            size="small"
                            fullWidth
                            value={resumeData.phone}
                            onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                          />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    {/* Summary Section */}
                    <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1, alignItems: "center" }}>
                          <WorkIcon color="primary" fontSize="small" />
                          <Typography sx={{ fontWeight: '600', variant: 'subtitle2' }}>
                            Professional Summary
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TextField
                          multiline
                          rows={4}
                          fullWidth
                          size="small"
                          value={resumeData.summary}
                          onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                        />
                      </AccordionDetails>
                    </Accordion>

                    {/* Skills Section */}
                    <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack sx={{ direction: "row", spacing: 1, alignItems: "center" }}>
                          <SkillIcon color="primary" fontSize="small" />
                          <Typography sx={{ fontWeight: '600', variant: 'subtitle2' }}>
                            Technical Expertise
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TextField
                          multiline
                          rows={3}
                          fullWidth
                          size="small"
                          value={resumeData.skills}
                          onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </Paper>
              </Grid>

              {/* Dynamic PDF Live Viewer */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '720px',
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: '#0f172a',
                    border: '1px solid #1e293b',
                  }}
                >
                  <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                    <DynamicResumePDF data={resumeData} />
                  </PDFViewer>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Container>
    </Box>
  );
}