import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Switch, FormControlLabel, IconButton, Tooltip, Box,
} from '@material-ui/core';
import FileCopy from '@material-ui/icons/FileCopy';
import Print from '@material-ui/icons/Print';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';
import { fetchSessionCheckinCount } from '../actions';

// Public check-in URL (app is served under /front).
const checkinUrl = (token) => `${window.location.origin}/front/training/checkin/${token}`;

function AttendanceQRDialog({
  session, open, onClose, onToggle, canToggle,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const count = useSelector((s) => s.training.sessionCheckinCount);
  const url = session ? checkinUrl(session.registrationToken) : '';

  useEffect(() => {
    if (open && session?.id) dispatch(fetchSessionCheckinCount(session.id));
  }, [open, session?.id, session?.registrationOpen]);

  const copy = () => navigator.clipboard && navigator.clipboard.writeText(url);

  const print = () => {
    const canvas = document.getElementById('session-qr-canvas');
    const dataUrl = canvas && canvas.toDataURL ? canvas.toDataURL('image/png') : '';
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${session.title}</title></head>`
      + '<body style="text-align:center;font-family:sans-serif;padding:40px">'
      + `<h2>${session.title}</h2>`
      + `<img src="${dataUrl}" style="width:340px;height:340px"/>`
      + `<p style="font-size:12px;word-break:break-all">${url}</p>`
      + '<script>window.onload=function(){window.print();}</script></body></html>');
    w.document.close();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{formatMessage('training.session.qr.title')}{session ? ` — ${session.title}` : ''}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          {session && (
            <QRCodeCanvas id="session-qr-canvas" value={url} size={232} includeMargin level="M" />
          )}
          <Typography variant="caption" style={{ wordBreak: 'break-all', textAlign: 'center', marginTop: 8 }}>{url}</Typography>
          <Box mt={1}>
            <Tooltip title={formatMessage('training.session.qr.copy')}>
              <IconButton onClick={copy} size="small"><FileCopy fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title={formatMessage('training.session.qr.print')}>
              <IconButton onClick={print} size="small"><Print fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
          {canToggle && session && (
            <FormControlLabel
              control={<Switch checked={!!session.registrationOpen} onChange={() => onToggle(session)} color="primary" />}
              label={formatMessage(session.registrationOpen ? 'training.session.qr.open' : 'training.session.qr.closed')}
            />
          )}
          {!session?.registrationOpen && (
            <Typography variant="caption" color="error" style={{ textAlign: 'center' }}>
              {formatMessage('training.session.qr.closedHint')}
            </Typography>
          )}
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            {formatMessage('training.session.qr.count')}: <strong>{count == null ? '–' : count}</strong>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{formatMessage('training.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AttendanceQRDialog;
