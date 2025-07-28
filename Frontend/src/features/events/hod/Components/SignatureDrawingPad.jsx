import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider
} from '@mui/material';
import {
  Edit,
  Clear,
  Save,
  Undo,
  Redo,
  Palette,
  LineWeight,
  Close,
  Preview,
  Download,
  Upload
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const SignatureDrawingPad = ({ onSignatureSaved, existingSignature = null }) => {
  const { enqueueSnackbar } = useSnackbar();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Canvas dimensions optimized for signature
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 150;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      
      // Set initial canvas style
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      
      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Save initial state
      saveCanvasState();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
    }
  }, [strokeColor, strokeWidth]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      const newHistory = canvasHistory.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      setCanvasHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    saveCanvasState();
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(canvasHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(canvasHistory[newIndex]);
    }
  };

  const restoreCanvasState = (imageData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(img, 0, 0);
    };
    
    img.src = imageData;
  };

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Check if all pixels are white (empty canvas)
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] !== 255 || imageData.data[i + 1] !== 255 || imageData.data[i + 2] !== 255) {
        return false;
      }
    }
    return true;
  };

  const saveSignature = async () => {
    if (isCanvasEmpty()) {
      enqueueSnackbar('Please draw your signature first', { variant: 'warning' });
      return;
    }

    try {
      setSaving(true);
      
      const canvas = canvasRef.current;
      const signatureDataURL = canvas.toDataURL('image/png');
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/signature/upload`,
        {
          imageData: signatureDataURL,
          fileName: `signature-${Date.now()}.png`,
          signatureType: 'drawn'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        enqueueSnackbar('Signature saved successfully', { variant: 'success' });
        if (onSignatureSaved) {
          onSignatureSaved(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      enqueueSnackbar('Failed to save signature', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const downloadSignature = () => {
    if (isCanvasEmpty()) {
      enqueueSnackbar('Please draw your signature first', { variant: 'warning' });
      return;
    }

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `signature-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const previewSignature = () => {
    if (isCanvasEmpty()) {
      enqueueSnackbar('Please draw your signature first', { variant: 'warning' });
      return;
    }
    setPreviewOpen(true);
  };

  const PreviewDialog = () => (
    <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Signature Preview</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box textAlign="center" p={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            How your signature will appear on certificates:
          </Typography>
          
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              display: 'inline-block',
              backgroundColor: '#f9f9f9',
              border: '2px dashed #ddd',
              mb: 2
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Paper>
          
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {(() => {
                const userName = JSON.parse(localStorage.getItem('userInfo') || '{}').name || 'Department Head';
                return userName.toLowerCase().startsWith('dr.') ? userName : `Dr. ${userName}`;
              })()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              HEAD OF DEPARTMENT
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              Department of CSE
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={saveSignature}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Signature'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Draw Your Signature
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Use your mouse or touch to draw your signature in the area below. This will be used on all certificates.
        </Typography>

        {/* Drawing Controls */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Pen Width: {strokeWidth}px
            </Typography>
            <Slider
              value={strokeWidth}
              onChange={(e, value) => setStrokeWidth(value)}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="auto"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth>
              <InputLabel>Pen Color</InputLabel>
              <Select
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                label="Pen Color"
              >
                <MenuItem value="#000000">Black</MenuItem>
                <MenuItem value="#0000FF">Blue</MenuItem>
                <MenuItem value="#000080">Navy Blue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Canvas */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Paper 
            elevation={2}
            sx={{ 
              p: 2,
              backgroundColor: '#fafafa',
              border: '2px dashed #ccc'
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                border: '2px solid #ddd',
                borderRadius: '4px',
                cursor: 'crosshair',
                backgroundColor: '#ffffff',
                display: 'block',
                touchAction: 'none'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              Draw your signature above
            </Typography>
          </Paper>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
          <Tooltip title="Undo">
            <IconButton 
              onClick={undo} 
              disabled={historyIndex <= 0}
              size="small"
            >
              <Undo />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Redo">
            <IconButton 
              onClick={redo} 
              disabled={historyIndex >= canvasHistory.length - 1}
              size="small"
            >
              <Redo />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Clear">
            <IconButton 
              onClick={clearCanvas}
              size="small"
              color="error"
            >
              <Clear />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Preview">
            <IconButton 
              onClick={previewSignature}
              size="small"
              color="primary"
            >
              <Preview />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Download">
            <IconButton 
              onClick={downloadSignature}
              size="small"
            >
              <Download />
            </IconButton>
          </Tooltip>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Tips:</strong>
            <br />• Use a steady hand for best results
            <br />• Keep your signature simple and clear
            <br />• You can adjust pen width and color before drawing
            <br />• Use undo/redo to make corrections
          </Typography>
        </Alert>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button
          startIcon={<Clear />}
          onClick={clearCanvas}
          color="error"
          variant="outlined"
        >
          Clear All
        </Button>
        
        <Button
          startIcon={<Save />}
          onClick={saveSignature}
          disabled={saving}
          variant="contained"
          color="primary"
        >
          {saving ? 'Saving...' : 'Save Signature'}
        </Button>
      </CardActions>

      <PreviewDialog />
    </Card>
  );
};

export default SignatureDrawingPad;