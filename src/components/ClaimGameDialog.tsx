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

type ClaimGameDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (parent: string, children: string) => void;
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

  console.log('🔍 ClaimGameDialog state:', { parentName, childrenNames, disabled: !parentName.trim() || !childrenNames.trim() });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      console.log('🔄 Dialog opened - resetting form state');
      setParentName('');
      setChildrenNames('');
    }
  }, [open]);

  const handleConfirm = () => {
    console.log('🚀 ClaimGameDialog handleConfirm called with:', { parentName, childrenNames });
    if (parentName.trim() && childrenNames.trim()) {
      console.log('📞 Calling onConfirm with:', { parent: parentName.trim(), children: childrenNames.trim() });
      onConfirm(parentName.trim(), childrenNames.trim());
      // Don't automatically close - let App.tsx handle closing on success
    } else {
      console.log('⚠️ Form validation failed - missing parent or children name');
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
          />
          <TextField
            label="Nom de l'enfant"
            fullWidth
            variant="outlined"
            value={childrenNames}
            onChange={(e) => setChildrenNames(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!parentName.trim() || !childrenNames.trim()}
        >
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClaimGameDialog;
