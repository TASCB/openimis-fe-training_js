import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Tooltip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  PublishedComponent, TextInput, useModulesManager, useTranslations, journalize,
} from '@openimis/fe-core';
import { userDisplayName } from '../utils/users';
import {
  fetchTrainingAssignments, saveTrainingAssignment, deleteTrainingAssignment,
} from '../actions';
import TrainerPicker from '../pickers/TrainerPicker';
import { AssignmentRolePicker, AssignmentStatusPicker } from '../pickers/ConstantPickers';

const EMPTY = {
  trainer: null,
  staffUser: null,
  role: 'LEAD_TRAINER',
  status: 'ASSIGNED',
  notes: '',
};

function TrainingAssignmentsPanel({
  trainingId, assignmentReadOnly: readOnly, trainingAssignments, submittingMutation, mutation,
  fetchTrainingAssignments, saveTrainingAssignment, deleteTrainingAssignment, journalize, onTrainerIdsChange,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [row, setRow] = useState(EMPTY);
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

  // An assignee is either a trainer profile or a system user — never both, so picking
  // one clears the other.
  const pickTrainer = (v) => setRow({ ...row, trainer: v ?? null, staffUser: null });
  const pickStaffUser = (v) => setRow({ ...row, staffUser: v ?? null, trainer: null });

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

  const remove = (a) => deleteTrainingAssignment(a, formatMessage('training.assignment.delete.mutationLabel'));

  return (
    <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('training.assignment.trainer')}</TableCell>
            <TableCell>{formatMessage('training.assignment.staffUser')}</TableCell>
            <TableCell>{formatMessage('training.assignment.role')}</TableCell>
            <TableCell>{formatMessage('training.assignment.status')}</TableCell>
            <TableCell>{formatMessage('training.assignment.notes')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(trainingAssignments ?? []).map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.trainer ? `${a.trainer.fullName} (${a.trainer.code})` : ''}</TableCell>
              <TableCell>{userDisplayName(a.staffUser)}</TableCell>
              <TableCell>{formatMessage(`training.role.${a.role}`)}</TableCell>
              <TableCell>{formatMessage(`training.assignmentStatus.${a.status}`)}</TableCell>
              <TableCell>{a.notes}</TableCell>
              <TableCell>
                {!readOnly && (
                  <Tooltip title={formatMessage('deleteButton.tooltip')}>
                    <IconButton size="small" onClick={() => remove(a)}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
          {!readOnly && (
            <TableRow>
              <TableCell>
                <TrainerPicker withLabel value={row.trainer} onChange={pickTrainer} />
              </TableCell>
              <TableCell>
                <PublishedComponent
                  pubRef="admin.UserPicker"
                  module="training"
                  value={row.staffUser}
                  onChange={pickStaffUser}
                />
              </TableCell>
              <TableCell>
                <AssignmentRolePicker value={row.role} onChange={(v) => setRow({ ...row, role: v })} />
              </TableCell>
              <TableCell>
                <AssignmentStatusPicker value={row.status} onChange={(v) => setRow({ ...row, status: v })} />
              </TableCell>
              <TableCell>
                <TextInput module="training" value={row.notes} onChange={(v) => setRow({ ...row, notes: v })} />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={add}
                  disabled={!row.trainer && !row.staffUser}
                >
                  {formatMessage('addButton')}
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
  );
}

const mapStateToProps = (state) => ({
  trainingAssignments: state.training.trainingAssignments,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingAssignments, saveTrainingAssignment, deleteTrainingAssignment, journalize,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingAssignmentsPanel);
