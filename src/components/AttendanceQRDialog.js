import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Dialog, DialogTitle, DialogContent, Button, Typography, Box, IconButton,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import FileCopyOutlined from '@material-ui/icons/FileCopyOutlined';
import PrintOutlined from '@material-ui/icons/PrintOutlined';
import {
  useModulesManager, useTranslations, formatDateFromISO,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';
import { fetchSessionCheckinCount } from '../actions';
import { qrStateKey } from '../utils/checkin';

const POLL_MS = 10000;
const checkinUrl = (token) => `${window.location.origin}/front/training/checkin/${token}`;
const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const useStyles = makeStyles((theme) => ({
  when: { color: theme.palette.text.secondary, fontSize: 13, marginTop: theme.spacing(0.5) },
  qrWrap: { position: 'relative', marginTop: theme.spacing(1) },
  qrClosed: { opacity: 0.25 },
  qrBadge: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4, padding: theme.spacing(0.5, 1.5), fontWeight: 600, whiteSpace: 'nowrap',
  },
  status: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginTop: theme.spacing(2), fontWeight: 600,
  },
  dot: { width: 10, height: 10, borderRadius: '50%', background: theme.palette.grey[400] },
  dotOpen: { background: theme.palette.success.main },
  hint: { color: theme.palette.text.secondary, fontSize: 13, textAlign: 'center', marginTop: theme.spacing(0.5) },
  count: { fontSize: 28, fontWeight: 700, color: theme.palette.primary.main, lineHeight: 1.1, marginTop: theme.spacing(2) },
  countLabel: { color: theme.palette.text.secondary, fontSize: 13 },
  buttons: {
    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing(1), margin: theme.spacing(2, 0, 1),
  },
  titleBar: { position: 'relative', paddingRight: theme.spacing(6) },
  close: { position: 'absolute', top: theme.spacing(1.5), right: theme.spacing(1.5) },
}));

function AttendanceQRDialog({
  session, open, onClose, onToggle, canToggle,
}) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const count = useSelector((s) => s.training.sessionCheckinCount);
  const trainingTitle = useSelector((s) => s.training.training?.title);
  const [copied, setCopied] = useState(false);
  const url = session ? checkinUrl(session.registrationToken) : '';
  const isOpen = !!session?.checkinOpen;

  useEffect(() => {
    if (!open || !session?.id) return undefined;
    dispatch(fetchSessionCheckinCount(session.id));
    if (!isOpen) return undefined;
    const timer = setInterval(() => dispatch(fetchSessionCheckinCount(session.id)), POLL_MS);
    return () => clearInterval(timer);
  }, [open, session?.id, session?.registrationOpen, isOpen]);
  useEffect(() => { if (!open) setCopied(false); }, [open]);

  const when = session ? [
    session.sessionDate ? formatDateFromISO(modulesManager, intl, session.sessionDate) : null,
    session.startTime ? `${hhmm(session.startTime)}${session.endTime ? `–${hhmm(session.endTime)}` : ''}` : null,
  ].filter(Boolean).join(' · ') : '';

  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(() => setCopied(true));
  };

  const print = () => {
    const canvas = document.getElementById('session-qr-canvas');
    const dataUrl = canvas && canvas.toDataURL ? canvas.toDataURL('image/png') : '';
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${escapeHtml(session.title)}</title></head>`
      + '<body style="text-align:center;font-family:sans-serif;padding:40px">'
      + (trainingTitle ? `<h1 style="margin:0 0 8px">${escapeHtml(trainingTitle)}</h1>` : '')
      + `<h2 style="margin:0 0 4px;font-weight:500">${escapeHtml(session.title)}</h2>`
      + (when ? `<p style="margin:0 0 24px;color:#555">${escapeHtml(when)}</p>` : '')
      + `<img src="${dataUrl}" style="width:340px;height:340px"/>`
      + `<p style="font-size:18px;margin:24px 0 8px">${escapeHtml(formatMessage('training.session.qr.instruction'))}</p>`
      + `<p style="font-size:11px;color:#777;word-break:break-all">${escapeHtml(url)}</p>`
      + '<script>window.onload=function(){window.print();}</script></body></html>');
    w.document.close();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle disableTypography className={classes.titleBar}>
        <IconButton size="small" className={classes.close} onClick={onClose} aria-label={formatMessage('training.close')}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">{formatMessage('training.session.qr.title')}{session ? ` — ${session.title}` : ''}</Typography>
        {when && <div className={classes.when}>{when}</div>}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          {session && (
            <div className={classes.qrWrap}>
              <div className={isOpen ? undefined : classes.qrClosed}>
                <QRCodeCanvas id="session-qr-canvas" value={url} size={232} includeMargin level="M" />
              </div>
              {!isOpen && <span className={classes.qrBadge}>{formatMessage('training.session.qr.closedBadge')}</span>}
            </div>
          )}

          <div className={classes.status}>
            <span className={`${classes.dot} ${isOpen ? classes.dotOpen : ''}`} />
            {session ? formatMessage(qrStateKey(session)) : ''}
          </div>
          {!isOpen && <div className={classes.hint}>{formatMessage('training.session.qr.closedHint')}</div>}
          {isOpen && !session?.registrationOpen && (
            <div className={classes.hint}>{formatMessage('training.session.qr.openAutoHint')}</div>
          )}

          <div className={classes.count}>{count == null ? '–' : count}</div>
          <div className={classes.countLabel}>{formatMessage('training.session.qr.count')}</div>

          <div className={classes.buttons}>
            <Button variant="outlined" color="primary" size="small" startIcon={<FileCopyOutlined />} onClick={copy}>
              {formatMessage(copied ? 'training.session.qr.copied' : 'training.session.qr.copy')}
            </Button>
            <Button variant="outlined" color="primary" size="small" startIcon={<PrintOutlined />} onClick={print}>
              {formatMessage('training.session.qr.print')}
            </Button>
            {canToggle && session && (
              <Button variant="contained" color="primary" size="small" onClick={() => onToggle(session)}>
                {formatMessage(session.registrationOpen ? 'training.session.qr.closeCheckin' : 'training.session.qr.openCheckin')}
              </Button>
            )}
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default AttendanceQRDialog;
