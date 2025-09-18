import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { logger } from '../lib/logger';

type ClaimGameDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (parent: string, children: string) => Promise<void>;
  errorMessage?: string;
};

const ClaimGameDialog = ({
  open,
  onClose,
  onConfirm,
  errorMessage,
}: ClaimGameDialogProps) => {
  const [parentName, setParentName] = useState('');
  const [childrenNames, setChildrenNames] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  logger.log('🔍 ClaimGameDialog state:', {
    parentName,
    childrenNames,
    disabled: !parentName.trim() || !childrenNames.trim(),
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      logger.log('🔄 Dialog opened - resetting form state');
      setParentName('');
      setChildrenNames('');
    }
  }, [open]);

  const handleConfirm = async () => {
    logger.log('🚀 ClaimGameDialog handleConfirm called with:', {
      parentName,
      childrenNames,
    });
    if (parentName.trim() && childrenNames.trim()) {
      setIsLoading(true);
      try {
        logger.log('📞 Calling onConfirm with:', {
          parent: parentName.trim(),
          children: childrenNames.trim(),
        });
        await onConfirm(parentName.trim(), childrenNames.trim());
        // Success - dialog will be closed by parent component
      } catch (error) {
        // Error handling is done by parent component via errorMessage prop
        logger.error('❌ Claim failed:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      logger.log('⚠️ Form validation failed - missing parent or children name');
    }
  };

  const handleClose = () => {
    setParentName('');
    setChildrenNames('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Je m'en occupe</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            autoFocus
            label="Nom du parent"
            fullWidth
            variant="outlined"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            label="Nom de l'enfant"
            fullWidth
            variant="outlined"
            value={childrenNames}
            onChange={(e) => setChildrenNames(e.target.value)}
            disabled={isLoading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!parentName.trim() || !childrenNames.trim() || isLoading}
        >
          {isLoading ? 'En cours...' : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClaimGameDialog;
