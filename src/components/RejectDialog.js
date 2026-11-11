import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
} from '@material-ui/core';
import { TextInput, useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';

function RejectDialog({ open, onClose, onConfirm }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const [reason, setReason] = useState('');

  useEffect(() => { if (open) setReason(''); }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formatMessage('training.reject.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>{formatMessage('training.reject.help')}</Typography>
        <TextInput
          module={MODULE_NAME}
          label="training.reject.reason"
          value={reason}
          onChange={setReason}
          required
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{formatMessage('training.reject.cancel')}</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!reason.trim()}
          onClick={() => onConfirm(reason.trim())}
        >
          {formatMessage('training.action.reject')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RejectDialog;
