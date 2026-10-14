import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Tooltip, Grid, Typography, Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import {
  PublishedComponent, SelectInput, TextInput, useModulesManager, useTranslations, journalize,
  coreConfirm, clearConfirm,
} from '@openimis/fe-core';
import { userDisplayName } from '../utils/users';
import {
  fetchTrainingParticipants, fetchTrainingSessions, saveTrainingParticipant,
  deleteTrainingParticipant, decId,
} from '../actions';
import { AttendanceStatusPicker, GenderPicker } from '../pickers/ConstantPickers';
import ParticipantCategoryPicker from '../pickers/ParticipantCategoryPicker';

const useStyles = makeStyles((theme) => ({
  form: { padding: theme.spacing(1, 0) },
  item: theme.paper.item,
  formTitle: { color: theme.palette.primary.main, fontWeight: 500 },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  empty: { color: theme.palette.text.secondary, textAlign: 'center', padding: theme.spacing(3) },
}));

const EMPTY = {
  fullName: '',
  sessionId: '',
  internalUser: null,
  gender: null,
  category: null,
  attendanceStatus: 'INVITED',
  organization: '',
  phone: '',
};

function TrainingParticipantsPanel({
  trainingId, participantReadOnly: readOnly, levelCode, trainingParticipants, trainingSessions,
  submittingMutation, mutation, confirmed, fetchTrainingParticipants, fetchTrainingSessions,
  saveTrainingParticipant, deleteTrainingParticipant, journalize, coreConfirm, clearConfirm,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('training', modulesManager);
  const [row, setRow] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const prev = useRef();

  useEffect(() => {
    if (trainingId) {
      fetchTrainingParticipants(trainingId);
      fetchTrainingSessions(trainingId);
    }
  }, [trainingId]);
  useEffect(() => {
    if (prev.current && !submittingMutation) {
      journalize(mutation);
      if (trainingId) fetchTrainingParticipants(trainingId);
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const pickInternalUser = (v) => setRow((r) => ({
    ...r,
    internalUser: v ?? null,
    fullName: r.fullName || userDisplayName(v),
  }));

  const add = () => {
    if (!row.fullName) return;
    saveTrainingParticipant({ ...row, trainingId }, formatMessage('training.participant.add.mutationLabel'));
    setRow(EMPTY);
  };
  const updateField = (p, patch) => saveTrainingParticipant(
    { id: p.id, trainingId, ...patch }, formatMessage('training.participant.update.mutationLabel'),
  );
  useEffect(() => {
    if (toDelete) {
      coreConfirm(
        formatMessage('training.participant.deleteDialog.title'),
        formatMessageWithValues('training.participant.deleteDialog.message', { name: toDelete.fullName }),
      );
    }
  }, [toDelete]);
  useEffect(() => {
    if (toDelete && confirmed) deleteTrainingParticipant(toDelete, formatMessage('training.participant.delete.mutationLabel'));
    if (confirmed !== null) setToDelete(null);
    return () => confirmed !== null && clearConfirm(false);
  }, [confirmed]);
  const items = trainingParticipants ?? [];

  const sessionOptions = [
    { value: '', label: formatMessage('training.participant.wholeTraining') },
    ...(trainingSessions ?? []).map((s) => ({ value: s.id, label: s.title })),
  ];

  return (
    <>
      {!readOnly && (
        <>
          <Grid container className={classes.form}>
            <Grid item xs={12} className={classes.item}>
              <Typography className={classes.formTitle}>{formatMessage('training.participant.formTitle')}</Typography>
            </Grid>
            {sessionOptions.length > 1 && (
              <Grid item xs={12} md={3} className={classes.item}>
                <SelectInput
                  module="training"
                  label="training.participant.addToSession"
                  options={sessionOptions}
                  value={row.sessionId}
                  onChange={(v) => setRow((r) => ({ ...r, sessionId: v ?? '' }))}
                />
              </Grid>
            )}
            <Grid item xs={12} md={3} className={classes.item}>
              <PublishedComponent
                pubRef="admin.UserPicker"
                module="training"
                withLabel
                label={formatMessage('training.participant.internalUser')}
                value={row.internalUser}
                onChange={pickInternalUser}
              />
            </Grid>
            <Grid item xs={12} md={sessionOptions.length > 1 ? 4 : 6} className={classes.item}>
              <TextInput module="training" label="training.participant.fullName" required
                value={row.fullName} onChange={(v) => setRow((r) => ({ ...r, fullName: v }))} />
            </Grid>
            <Grid item xs={6} md={2} className={classes.item}>
              <GenderPicker withLabel withNull value={row.gender} onChange={(v) => setRow((r) => ({ ...r, gender: v || null }))} />
            </Grid>
            <Grid item xs={12} md={3} className={classes.item}>
              <ParticipantCategoryPicker withLabel levelCode={levelCode} value={row.category}
                onChange={(v) => setRow((r) => ({ ...r, category: v }))} />
            </Grid>
            <Grid item xs={12} md={3} className={classes.item}>
              <TextInput module="training" label="training.participant.organization"
                value={row.organization} onChange={(v) => setRow((r) => ({ ...r, organization: v }))} />
            </Grid>
            <Grid item xs={6} md={3} className={classes.item}>
              <TextInput module="training" label="training.participant.phone"
                value={row.phone} onChange={(v) => setRow((r) => ({ ...r, phone: v }))} />
            </Grid>
            <Grid item xs={6} md={3} className={classes.item}>
              <AttendanceStatusPicker withLabel value={row.attendanceStatus}
                onChange={(v) => setRow((r) => ({ ...r, attendanceStatus: v || EMPTY.attendanceStatus }))} />
            </Grid>
            <Grid item xs={12} className={`${classes.item} ${classes.actions}`}>
              <Button variant="contained" color="primary" onClick={add} disabled={!row.fullName}>
                {formatMessage('training.participant.formTitle')}
              </Button>
            </Grid>
          </Grid>
          <Divider />
        </>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('training.participant.fullName')}</TableCell>
            <TableCell>{formatMessage('training.participant.internalUser')}</TableCell>
            <TableCell>{formatMessage('training.session')}</TableCell>
            <TableCell>{formatMessage('training.gender')}</TableCell>
            <TableCell>{formatMessage('training.participant.category')}</TableCell>
            <TableCell>{formatMessage('training.participant.organization')}</TableCell>
            <TableCell>{formatMessage('training.participant.phone')}</TableCell>
            <TableCell>{formatMessage('training.participant.attendance')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {!items.length && (
            <TableRow>
              <TableCell colSpan={9} className={classes.empty}>{formatMessage('training.participant.empty')}</TableCell>
            </TableRow>
          )}
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.fullName}</TableCell>
              <TableCell>{userDisplayName(p.internalUser)}</TableCell>
              <TableCell>{p.session?.title ?? ''}</TableCell>
              <TableCell>
                <GenderPicker withNull readOnly={readOnly} value={p.gender} onChange={(v) => updateField(p, { gender: v })} />
              </TableCell>
              <TableCell>
                <ParticipantCategoryPicker readOnly={readOnly} levelCode={levelCode} value={p.category}
                  onChange={(v) => updateField(p, { categoryId: decId(v?.id) })} />
              </TableCell>
              <TableCell>{p.organization}</TableCell>
              <TableCell>{p.phone}</TableCell>
              <TableCell>
                <AttendanceStatusPicker readOnly={readOnly} value={p.attendanceStatus}
                  onChange={(v) => v && updateField(p, { attendanceStatus: v })} />
              </TableCell>
              <TableCell>
                {!readOnly && (
                  <Tooltip title={formatMessage('deleteButton.tooltip')}>
                    <IconButton size="small" onClick={() => setToDelete(p)}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

const mapStateToProps = (state) => ({
  trainingParticipants: state.training.trainingParticipants,
  trainingSessions: state.training.trainingSessions,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
  confirmed: state.core.confirmed,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingParticipants,
    fetchTrainingSessions,
    saveTrainingParticipant,
    deleteTrainingParticipant,
    journalize,
    coreConfirm,
    clearConfirm,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingParticipantsPanel);
