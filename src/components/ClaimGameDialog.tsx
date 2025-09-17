import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

type ClaimGameDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (parent: string, children: string) => void;
};

const ClaimGameDialog = ({
  open,
  onClose,
  onConfirm,
}: ClaimGameDialogProps) => {
  const [parentName, setParentName] = useState('');
  const [childrenNames, setChildrenNames] = useState('');

  const handleConfirm = () => {
    if (parentName.trim() && childrenNames.trim()) {
      onConfirm(parentName.trim(), childrenNames.trim());
      handleClose();
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
