import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography,
} from '@material-ui/core';
import {
  PublishedComponent, TextInput, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';

// json_ext arrives as a JSON string; the reschedule log is appended by the backend.
function rescheduleLog(training) {
  try {
    const parsed = training?.jsonExt ? JSON.parse(training.jsonExt) : null;
    return Array.isArray(parsed?.reschedule_log) ? parsed.reschedule_log : [];
  } catch (e) {
    return [];
  }
}

// Trainings are scheduled by day; only the audit stamp carries a time.
const shortDate = (v) => (v ? String(v).slice(0, 10) : '?');
const shortStamp = (v) => (v ? String(v).slice(0, 16).replace('T', ' ') : '?');

const sessionNote = (h, formatMessageWithValues) => {
  const parts = [];
  if (h.sessions_shifted) {
    parts.push(formatMessageWithValues('training.reschedule.sessionsMoved', { count: h.sessions_shifted }));
  }
  if (h.sessions_outside_window) {
    const count = h.sessions_outside_window;
    parts.push(formatMessageWithValues('training.reschedule.sessionsOutside', { count }));
  }
  return parts.join(' · ');
};

function RescheduleDialog({
  training, open, onClose, onConfirm,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const [startDatetime, setStart] = useState(null);
  const [endDatetime, setEnd] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setStart(training?.startDatetime ?? null);
      setEnd(training?.endDatetime ?? null);
      setReason('');
    }
  }, [open, training?.id]);

  const unchanged = startDatetime === training?.startDatetime && endDatetime === training?.endDatetime;
  const canConfirm = !!startDatetime && !!endDatetime && !unchanged;
  const history = rescheduleLog(training);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formatMessage('training.reschedule.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {formatMessage('training.reschedule.hint')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="training"
              label="training.startDatetime"
              required
              value={startDatetime}
              onChange={setStart}
            />
          </Grid>
          <Grid item xs={6}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="training"
              label="training.endDatetime"
              required
              value={endDatetime}
              onChange={setEnd}
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              module="training"
              label="training.reschedule.reason"
              value={reason}
              onChange={setReason}
            />
          </Grid>
        </Grid>
        {!!history.length && (
          <>
            <Typography variant="subtitle2" style={{ marginTop: 16 }}>
              {formatMessage('training.reschedule.history')}
            </Typography>
            {history.slice().reverse().map((h) => (
              <Typography key={`${h.at}-${h.to_start}`} variant="caption" display="block" color="textSecondary">
                {`${shortDate(h.from_start)} → ${shortDate(h.to_start)} · ${h.by || '?'} · ${shortStamp(h.at)}`}
                {h.reason ? ` · ${h.reason}` : ''}
                {sessionNote(h, formatMessageWithValues) ? ` · ${sessionNote(h, formatMessageWithValues)}` : ''}
              </Typography>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{formatMessage('training.reschedule.dismiss')}</Button>
        <Button
          color="primary"
          variant="contained"
          disabled={!canConfirm}
          onClick={() => onConfirm({ startDatetime, endDatetime, reason })}
        >
          {formatMessage('training.action.reschedule')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RescheduleDialog;
