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
  fetchTrainingAssignments, saveTrainingAssignment, deleteTrainingAssignment,
} from '../actions';
import TrainerPicker from '../pickers/TrainerPicker';
import { AssignmentRolePicker, AssignmentStatusPicker } from '../pickers/ConstantPickers';

const ASSIGNEE_TRAINER = 'TRAINER';
const ASSIGNEE_STAFF = 'STAFF';
const ASSIGNEE_TYPES = [ASSIGNEE_TRAINER, ASSIGNEE_STAFF];

const useStyles = makeStyles((theme) => ({
  form: { padding: theme.spacing(1, 0) },
  item: theme.paper.item,
  formTitle: { color: theme.palette.primary.main, fontWeight: 500 },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  empty: { color: theme.palette.text.secondary, textAlign: 'center', padding: theme.spacing(3) },
}));

const EMPTY = {
  assigneeType: ASSIGNEE_TRAINER,
  trainer: null,
  staffUser: null,
  role: 'LEAD_TRAINER',
  status: 'ASSIGNED',
  notes: '',
};

function TrainingAssignmentsPanel({
  trainingId, assignmentReadOnly: readOnly, trainingAssignments, submittingMutation, mutation, confirmed,
  fetchTrainingAssignments, saveTrainingAssignment, deleteTrainingAssignment, journalize, onTrainerIdsChange,
  coreConfirm, clearConfirm,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('training', modulesManager);
  const [row, setRow] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const prev = useRef();

  useEffect(() => { if (trainingId) fetchTrainingAssignments(trainingId); }, [trainingId]);

  useEffect(() => {
    if (prev.current && !submittingMutation) {
      journalize(mutation);
      if (trainingId) fetchTrainingAssignments(trainingId);
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  useEffect(() => {
    if (onTrainerIdsChange) {
      onTrainerIdsChange((trainingAssignments ?? []).map((a) => a.trainer?.id).filter(Boolean));
    }
  }, [trainingAssignments]);

  const setAssigneeType = (v) => setRow((r) => ({
    ...r, assigneeType: v || ASSIGNEE_TRAINER, trainer: null, staffUser: null,
  }));
  const pickAssignee = (v) => setRow((r) => (r.assigneeType === ASSIGNEE_STAFF
    ? { ...r, staffUser: v ?? null, trainer: null }
    : { ...r, trainer: v ?? null, staffUser: null }));

  const add = () => {
    if (!row.trainer && !row.staffUser) return;
    saveTrainingAssignment(
      {
        trainingId,
        trainer: row.trainer,
        staffUser: row.staffUser,
        role: row.role,
        status: row.status,
        notes: row.notes,
      },
      formatMessage('training.assignment.add.mutationLabel'),
    );
    setRow(EMPTY);
  };

  const assigneeName = (a) => (a.trainer ? `${a.trainer.fullName} (${a.trainer.code})` : userDisplayName(a.staffUser));
  useEffect(() => {
    if (toDelete) {
      coreConfirm(
        formatMessage('training.assignment.deleteDialog.title'),
        formatMessageWithValues('training.assignment.deleteDialog.message', { name: assigneeName(toDelete) }),
      );
    }
  }, [toDelete]);
  useEffect(() => {
    if (toDelete && confirmed) deleteTrainingAssignment(toDelete, formatMessage('training.assignment.delete.mutationLabel'));
    if (confirmed !== null) setToDelete(null);
    return () => confirmed !== null && clearConfirm(false);
  }, [confirmed]);
  const items = trainingAssignments ?? [];

  return (
    <>
      {!readOnly && (
        <>
          <Grid container className={classes.form}>
            <Grid item xs={12} className={classes.item}>
              <Typography className={classes.formTitle}>{formatMessage('training.assignment.formTitle')}</Typography>
            </Grid>
            <Grid item xs={12} md={2} className={classes.item}>
              <SelectInput
                module="training"
                label="training.assignment.assigneeType"
                options={ASSIGNEE_TYPES.map((t) => ({ value: t, label: formatMessage(`training.assignment.assigneeType.${t}`) }))}
                value={row.assigneeType}
                onChange={setAssigneeType}
              />
            </Grid>
            <Grid item xs={12} md={4} className={classes.item}>
              {row.assigneeType === ASSIGNEE_STAFF ? (
                <PublishedComponent
                  pubRef="admin.UserPicker"
                  module="training"
                  withLabel
                  label={formatMessage('training.assignment.assignee')}
                  required
                  value={row.staffUser}
                  onChange={pickAssignee}
                />
              ) : (
                <TrainerPicker withLabel required value={row.trainer} onChange={pickAssignee} />
              )}
            </Grid>
            <Grid item xs={6} md={2} className={classes.item}>
              <AssignmentRolePicker withLabel value={row.role} onChange={(v) => setRow((r) => ({ ...r, role: v || EMPTY.role }))} />
            </Grid>
            <Grid item xs={6} md={2} className={classes.item}>
              <AssignmentStatusPicker withLabel value={row.status} onChange={(v) => setRow((r) => ({ ...r, status: v || EMPTY.status }))} />
            </Grid>
            <Grid item xs={12} md={2} className={classes.item}>
              <TextInput module="training" label="training.assignment.notes" value={row.notes}
                onChange={(v) => setRow((r) => ({ ...r, notes: v }))} />
            </Grid>
            <Grid item xs={12} className={`${classes.item} ${classes.actions}`}>
              <Button variant="contained" color="primary" onClick={add} disabled={!row.trainer && !row.staffUser}>
                {formatMessage('training.assignment.formTitle')}
              </Button>
            </Grid>
          </Grid>
          <Divider />
        </>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('training.assignment.assigneeType')}</TableCell>
            <TableCell>{formatMessage('training.assignment.assignee')}</TableCell>
            <TableCell>{formatMessage('training.assignment.role')}</TableCell>
            <TableCell>{formatMessage('training.assignment.status')}</TableCell>
            <TableCell>{formatMessage('training.assignment.notes')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {!items.length && (
            <TableRow>
              <TableCell colSpan={6} className={classes.empty}>{formatMessage('training.assignment.empty')}</TableCell>
            </TableRow>
          )}
          {items.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{formatMessage(`training.assignment.assigneeType.${a.trainer ? 'TRAINER' : 'STAFF'}`)}</TableCell>
              <TableCell>{assigneeName(a)}</TableCell>
              <TableCell>{formatMessage(`training.role.${a.role}`)}</TableCell>
              <TableCell>{formatMessage(`training.assignmentStatus.${a.status}`)}</TableCell>
              <TableCell>{a.notes}</TableCell>
              <TableCell>
                {!readOnly && (
                  <Tooltip title={formatMessage('deleteButton.tooltip')}>
                    <IconButton size="small" onClick={() => setToDelete(a)}><DeleteIcon /></IconButton>
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
  trainingAssignments: state.training.trainingAssignments,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
  confirmed: state.core.confirmed,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingAssignments, saveTrainingAssignment, deleteTrainingAssignment, journalize, coreConfirm, clearConfirm,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingAssignmentsPanel);
