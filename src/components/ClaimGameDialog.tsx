import { useState, useEffect } from 'react';
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Je m'en occupe</h2>

        <div className="space-y-4">
          {errorMessage && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="parentName"
              className="block text-sm font-medium text-gray-700"
            >
              Nom du parent
            </label>
            <input
              id="parentName"
              type="text"
              autoFocus
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="childrenNames"
              className="block text-sm font-medium text-gray-700"
            >
              Nom de l'enfant
            </label>
            <input
              id="childrenNames"
              type="text"
              value={childrenNames}
              onChange={(e) => setChildrenNames(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parentName.trim() || !childrenNames.trim() || isLoading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'En cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimGameDialog;
