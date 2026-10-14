import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Tooltip, Chip, Grid, Typography, Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import CropFreeIcon from '@material-ui/icons/CropFree';
import { useIntl } from 'react-intl';
import {
  TextInput, PublishedComponent, formatDateFromISO,
  useModulesManager, useTranslations, journalize, coreConfirm, clearConfirm,
} from '@openimis/fe-core';
import {
  fetchTrainingSessions, saveTrainingSession, deleteTrainingSession,
} from '../actions';
import {
  RIGHT_SESSION_CREATE, RIGHT_SESSION_UPDATE, RIGHT_SESSION_DELETE,
} from '../constants';
import AttendanceQRDialog from './AttendanceQRDialog';
import TimeInput from './TimeInput';
import { qrStateKey } from '../utils/checkin';

const useStyles = makeStyles((theme) => ({
  form: { padding: theme.spacing(1, 0) },
  item: theme.paper.item,
  formTitle: { color: theme.palette.primary.main, fontWeight: 500 },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: theme.spacing(2) },
  hint: { color: theme.palette.error.main, fontSize: 13 },
  empty: { color: theme.palette.text.secondary, textAlign: 'center', padding: theme.spacing(3) },
}));

const EMPTY = { title: '', sessionDate: '', startTime: '', endTime: '' };

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

function TrainingSessionsPanel({
  trainingId, sessionsReadOnly: readOnly, trainingSessions, rights,
  submittingMutation, mutation, confirmed,
  fetchTrainingSessions, saveTrainingSession, deleteTrainingSession, journalize, coreConfirm, clearConfirm,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const intl = useIntl();
  const { formatMessage, formatMessageWithValues } = useTranslations('training', modulesManager);
  const [row, setRow] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [qrSessionId, setQrSessionId] = useState(null);
  const prev = useRef();

  const canCreate = !readOnly && rights.includes(RIGHT_SESSION_CREATE);
  const canUpdate = !readOnly && rights.includes(RIGHT_SESSION_UPDATE);
  const canDelete = !readOnly && rights.includes(RIGHT_SESSION_DELETE);

  useEffect(() => { if (trainingId) fetchTrainingSessions(trainingId); }, [trainingId]);
  useEffect(() => {
    if (prev.current && !submittingMutation) {
      journalize(mutation);
      if (trainingId) fetchTrainingSessions(trainingId);
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const endBeforeStart = !!(row.startTime && row.endTime && row.endTime <= row.startTime);
  const add = () => {
    if (!row.title || endBeforeStart) return;
    saveTrainingSession(
      {
        trainingId,
        title: row.title,
        sessionDate: row.sessionDate || undefined,
        startTime: row.startTime || undefined,
        endTime: row.endTime || undefined,
        sequence: (trainingSessions?.length ?? 0) + 1,
      },
      formatMessage('training.session.add.mutationLabel'),
    );
    setRow(EMPTY);
  };
  const toggle = (s) => saveTrainingSession(
    { id: s.id, trainingId, registrationOpen: !s.registrationOpen },
    formatMessage('training.session.toggle.mutationLabel'),
  );
  useEffect(() => {
    if (toDelete) {
      coreConfirm(
        formatMessage('training.session.deleteDialog.title'),
        formatMessageWithValues('training.session.deleteDialog.message', { name: toDelete.title }),
      );
    }
  }, [toDelete]);
  useEffect(() => {
    if (toDelete && confirmed) deleteTrainingSession(toDelete, formatMessage('training.session.delete.mutationLabel'));
    if (confirmed !== null) setToDelete(null);
    return () => confirmed !== null && clearConfirm(false);
  }, [confirmed]);
  const items = trainingSessions ?? [];

  const qrSession = (trainingSessions ?? []).find((s) => s.id === qrSessionId) || null;

  return (
    <>
      {canCreate && (
        <>
          <Grid container className={classes.form} alignItems="flex-end">
            <Grid item xs={12} className={classes.item}>
              <Typography className={classes.formTitle}>{formatMessage('training.session.formTitle')}</Typography>
            </Grid>
            <Grid item xs={12} md={5} className={classes.item}>
              <TextInput module="training" label="training.session.title" required
                value={row.title} onChange={(v) => setRow((r) => ({ ...r, title: v }))} />
            </Grid>
            <Grid item xs={12} md={3} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                module="training"
                label="training.session.date"
                value={row.sessionDate || null}
                onChange={(v) => setRow((r) => ({ ...r, sessionDate: v || '' }))}
              />
            </Grid>
            <Grid item xs={6} md={2} className={classes.item}>
              <TimeInput label="training.session.startTime" value={row.startTime}
                onChange={(v) => setRow((r) => ({ ...r, startTime: v }))} />
            </Grid>
            <Grid item xs={6} md={2} className={classes.item}>
              <TimeInput label="training.session.endTime" value={row.endTime}
                onChange={(v) => setRow((r) => ({ ...r, endTime: v }))} />
            </Grid>
            <Grid item xs={12} className={`${classes.item} ${classes.actions}`}>
              {endBeforeStart && <span className={classes.hint}>{formatMessage('training.session.endBeforeStart')}</span>}
              <Button variant="contained" color="primary" onClick={add} disabled={!row.title || endBeforeStart}>
                {formatMessage('training.session.formTitle')}
              </Button>
            </Grid>
          </Grid>
          <Divider />
        </>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('training.session.title')}</TableCell>
            <TableCell>{formatMessage('training.session.date')}</TableCell>
            <TableCell>{formatMessage('training.session.time')}</TableCell>
            <TableCell>{formatMessage('training.session.registration')}</TableCell>
            <TableCell align="center">{formatMessage('training.session.qrAction')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {!items.length && (
            <TableRow>
              <TableCell colSpan={6} className={classes.empty}>{formatMessage('training.session.empty')}</TableCell>
            </TableRow>
          )}
          {items.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.title}</TableCell>
              <TableCell>
                {s.sessionDate ? formatDateFromISO(modulesManager, intl, s.sessionDate) : '—'}
              </TableCell>
              <TableCell>{s.startTime ? `${hhmm(s.startTime)}${s.endTime ? ` – ${hhmm(s.endTime)}` : ''}` : '—'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={s.checkinOpen ? 'primary' : 'default'}
                  label={formatMessage(qrStateKey(s))}
                />
              </TableCell>
              <TableCell align="center">
                <Tooltip title={formatMessage('training.session.qrAction')}>
                  <IconButton size="small" color="primary" onClick={() => setQrSessionId(s.id)}>
                    <CropFreeIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>
                {canDelete && (
                  <Tooltip title={formatMessage('deleteButton.tooltip')}>
                    <IconButton size="small" onClick={() => setToDelete(s)}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AttendanceQRDialog
        session={qrSession}
        open={Boolean(qrSession)}
        onClose={() => setQrSessionId(null)}
        onToggle={toggle}
        canToggle={canUpdate}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  trainingSessions: state.training.trainingSessions,
  rights: state.core?.user?.i_user?.rights ?? [],
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
  confirmed: state.core.confirmed,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingSessions, saveTrainingSession, deleteTrainingSession, journalize, coreConfirm, clearConfirm,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingSessionsPanel);
