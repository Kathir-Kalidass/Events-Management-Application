import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  Paper,
  Divider,
  Slider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  Preview,
  Download,
  Settings,
  Palette,
  TextFields,
  ViewModule,
  Add,
  Delete,
  Refresh,
  Save,
  RestoreFromTrash
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  generateAdvancedBrochure,
  BrochureTemplates,
  BrochureOrientations,
  BrochureColorSchemes,
  BrochureFontSizes,
  BrochurePresets
} from '../services/advancedBrochureGenerator';

const AdvancedBrochureGenerator = ({ 
  open, 
  onClose, 
  event, 
  onGenerate,
  initialConfig = {} 
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState({
    orientation: 'portrait',
    template: 'modern',
    colorScheme: 'anna-university',
    fontSize: 'medium',
    includeImages: true,
    includeBranding: true,
    sections: {
      header: true,
      eventDetails: true,
      description: true,
      objectives: true,
      outcomes: true,
      coordinators: true,
      organizingCommittee: true,
      registrationInfo: true,
      paymentDetails: true,
      schedule: true,
      venue: true,
      contact: true,
      footer: true
    },
    customSections: [],
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    },
    ...initialConfig
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState([]);

  useEffect(() => {
    // Load saved configurations from localStorage
    const saved = localStorage.getItem('brochure-configs');
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved configs:', error);
      }
    }
  }, []);

  const handleConfigChange = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSectionToggle = (section) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section]
      }
    }));
  };

  const handleAddCustomSection = () => {
    const newSection = {
      id: Date.now(),
      title: 'Custom Section',
      content: 'Add your custom content here...',
      height: 30
    };
    
    setConfig(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }));
  };

  const handleRemoveCustomSection = (id) => {
    setConfig(prev => ({
      ...prev,
      customSections: prev.customSections.filter(section => section.id !== id)
    }));
  };

  const handleCustomSectionChange = (id, field, value) => {
    setConfig(prev => ({
      ...prev,
      customSections: prev.customSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const handlePresetLoad = (presetName) => {
    const preset = BrochurePresets[presetName];
    if (preset) {
      setConfig({ ...preset });
      enqueueSnackbar(`Loaded ${presetName} preset`, { variant: 'success' });
    }
  };

  const handleSaveConfig = () => {
    const configName = prompt('Enter a name for this configuration:');
    if (configName) {
      const newSavedConfig = {
        id: Date.now(),
        name: configName,
        config: { ...config },
        createdAt: new Date().toISOString()
      };
      
      const updatedConfigs = [...savedConfigs, newSavedConfig];
      setSavedConfigs(updatedConfigs);
      localStorage.setItem('brochure-configs', JSON.stringify(updatedConfigs));
      enqueueSnackbar('Configuration saved successfully', { variant: 'success' });
    }
  };

  const handleLoadSavedConfig = (savedConfig) => {
    setConfig({ ...savedConfig.config });
    enqueueSnackbar(`Loaded configuration: ${savedConfig.name}`, { variant: 'success' });
  };

  const handleDeleteSavedConfig = (id) => {
    const updatedConfigs = savedConfigs.filter(config => config.id !== id);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('brochure-configs', JSON.stringify(updatedConfigs));
    enqueueSnackbar('Configuration deleted', { variant: 'info' });
  };

  const handleGenerate = async () => {
    if (!event) {
      enqueueSnackbar('No event data available', { variant: 'error' });
      return;
    }

    setGenerating(true);
    try {
      const doc = await generateAdvancedBrochure(event, config);
      
      // Generate filename
      const eventTitle = event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event';
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${eventTitle}_brochure_${timestamp}.pdf`;
      
      // Download PDF
      doc.save(filename);
      
      enqueueSnackbar('Brochure generated successfully!', { variant: 'success' });
      
      if (onGenerate) {
        onGenerate(doc, config);
      }
      
    } catch (error) {
      console.error('Error generating brochure:', error);
      enqueueSnackbar('Failed to generate brochure', { variant: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!event) {
      enqueueSnackbar('No event data available', { variant: 'error' });
      return;
    }

    try {
      const doc = await generateAdvancedBrochure(event, config);
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      // Clean up URL after some time
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
      
    } catch (error) {
      console.error('Error generating preview:', error);
      enqueueSnackbar('Failed to generate preview', { variant: 'error' });
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`brochure-tabpanel-${index}`}
      aria-labelledby={`brochure-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Advanced Brochure Generator</Typography>
          <Box>
            <Tooltip title="Preview">
              <IconButton onClick={handlePreview} color="primary">
                <Preview />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save Configuration">
              <IconButton onClick={handleSaveConfig} color="secondary">
                <Save />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Layout" icon={<ViewModule />} />
            <Tab label="Styling" icon={<Palette />} />
            <Tab label="Content" icon={<TextFields />} />
            <Tab label="Advanced" icon={<Settings />} />
          </Tabs>
        </Box>

        {/* Layout Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Quick Presets */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Quick Presets</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.keys(BrochurePresets).map(preset => (
                  <Chip
                    key={preset}
                    label={preset.replace(/_/g, ' ')}
                    onClick={() => handlePresetLoad(preset)}
                    color="primary"
                    variant="outlined"
                    clickable
                  />
                ))}
              </Box>
            </Grid>

            {/* Orientation */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Orientation</InputLabel>
                <Select
                  value={config.orientation}
                  label="Orientation"
                  onChange={(e) => handleConfigChange('orientation', e.target.value)}
                >
                  <MenuItem value={BrochureOrientations.PORTRAIT}>Portrait</MenuItem>
                  <MenuItem value={BrochureOrientations.LANDSCAPE}>Landscape</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Template */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={config.template}
                  label="Template"
                  onChange={(e) => handleConfigChange('template', e.target.value)}
                >
                  <MenuItem value={BrochureTemplates.MODERN}>Modern</MenuItem>
                  <MenuItem value={BrochureTemplates.CLASSIC}>Classic</MenuItem>
                  <MenuItem value={BrochureTemplates.MINIMAL}>Minimal</MenuItem>
                  <MenuItem value={BrochureTemplates.ACADEMIC}>Academic</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Margins */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Margins (mm)</Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField
                    label="Top"
                    type="number"
                    value={config.margins.top}
                    onChange={(e) => handleConfigChange('margins.top', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Bottom"
                    type="number"
                    value={config.margins.bottom}
                    onChange={(e) => handleConfigChange('margins.bottom', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Left"
                    type="number"
                    value={config.margins.left}
                    onChange={(e) => handleConfigChange('margins.left', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Right"
                    type="number"
                    value={config.margins.right}
                    onChange={(e) => handleConfigChange('margins.right', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Styling Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* Color Scheme */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Color Scheme</InputLabel>
                <Select
                  value={config.colorScheme}
                  label="Color Scheme"
                  onChange={(e) => handleConfigChange('colorScheme', e.target.value)}
                >
                  <MenuItem value={BrochureColorSchemes.ANNA_UNIVERSITY}>Anna University</MenuItem>
                  <MenuItem value={BrochureColorSchemes.BLUE}>Blue</MenuItem>
                  <MenuItem value={BrochureColorSchemes.GREEN}>Green</MenuItem>
                  <MenuItem value={BrochureColorSchemes.PURPLE}>Purple</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Font Size */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={config.fontSize}
                  label="Font Size"
                  onChange={(e) => handleConfigChange('fontSize', e.target.value)}
                >
                  <MenuItem value={BrochureFontSizes.SMALL}>Small</MenuItem>
                  <MenuItem value={BrochureFontSizes.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={BrochureFontSizes.LARGE}>Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Visual Options */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Visual Options</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.includeImages}
                    onChange={(e) => handleConfigChange('includeImages', e.target.checked)}
                  />
                }
                label="Include Images"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.includeBranding}
                    onChange={(e) => handleConfigChange('includeBranding', e.target.checked)}
                  />
                }
                label="Include University Branding"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Content Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {/* Section Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Sections to Include</Typography>
              <Grid container spacing={1}>
                {Object.entries(config.sections).map(([section, enabled]) => (
                  <Grid item xs={12} sm={6} md={4} key={section}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabled}
                          onChange={() => handleSectionToggle(section)}
                        />
                      }
                      label={section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Custom Sections */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Custom Sections</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddCustomSection}
                  variant="outlined"
                  size="small"
                >
                  Add Section
                </Button>
              </Box>
              
              {config.customSections.map((section, index) => (
                <Card key={section.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                      <TextField
                        label="Section Title"
                        value={section.title}
                        onChange={(e) => handleCustomSectionChange(section.id, 'title', e.target.value)}
                        size="small"
                        sx={{ mr: 2, flexGrow: 1 }}
                      />
                      <TextField
                        label="Height (mm)"
                        type="number"
                        value={section.height}
                        onChange={(e) => handleCustomSectionChange(section.id, 'height', parseInt(e.target.value))}
                        size="small"
                        sx={{ width: 100, mr: 2 }}
                      />
                      <IconButton
                        onClick={() => handleRemoveCustomSection(section.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    <TextField
                      label="Content"
                      multiline
                      rows={3}
                      value={section.content}
                      onChange={(e) => handleCustomSectionChange(section.id, 'content', e.target.value)}
                      fullWidth
                    />
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Advanced Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            {/* Saved Configurations */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Saved Configurations</Typography>
              {savedConfigs.length === 0 ? (
                <Alert severity="info">No saved configurations found.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {savedConfigs.map((savedConfig) => (
                    <Grid item xs={12} sm={6} md={4} key={savedConfig.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {savedConfig.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(savedConfig.createdAt).toLocaleDateString()}
                          </Typography>
                          <Box mt={2} display="flex" gap={1}>
                            <Button
                              size="small"
                              onClick={() => handleLoadSavedConfig(savedConfig)}
                              variant="outlined"
                            >
                              Load
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSavedConfig(savedConfig.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Configuration Export/Import */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Configuration Export/Import</Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const configJson = JSON.stringify(config, null, 2);
                    const blob = new Blob([configJson], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'brochure-config.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Config
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Import Config
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const importedConfig = JSON.parse(event.target.result);
                            setConfig(importedConfig);
                            enqueueSnackbar('Configuration imported successfully', { variant: 'success' });
                          } catch (error) {
                            enqueueSnackbar('Invalid configuration file', { variant: 'error' });
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </Button>
              </Box>
            </Grid>

            {/* Reset Configuration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestoreFromTrash />}
                onClick={() => {
                  setConfig(BrochurePresets.DEFAULT);
                  enqueueSnackbar('Configuration reset to default', { variant: 'info' });
                }}
              >
                Reset to Default
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handlePreview}
          variant="outlined"
          startIcon={<Preview />}
        >
          Preview
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          startIcon={generating ? <CircularProgress size={20} /> : <Download />}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate & Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedBrochureGenerator;