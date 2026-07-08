import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Tooltip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  TextInput, useModulesManager, useTranslations, journalize,
} from '@openimis/fe-core';
import {
  fetchTrainingParticipants, saveTrainingParticipant, deleteTrainingParticipant,
} from '../actions';
import { ParticipantTypePicker, AttendanceStatusPicker } from '../pickers/ConstantPickers';

const EMPTY = { fullName: '', participantType: 'TASAF_STAFF', attendanceStatus: 'INVITED', organization: '', phone: '' };

function TrainingParticipantsPanel({
  trainingId, participantReadOnly: readOnly, trainingParticipants, submittingMutation, mutation,
  fetchTrainingParticipants, saveTrainingParticipant, deleteTrainingParticipant, journalize,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [row, setRow] = useState(EMPTY);
  const prev = useRef();

  useEffect(() => { if (trainingId) fetchTrainingParticipants(trainingId); }, [trainingId]);
  useEffect(() => {
    if (prev.current && !submittingMutation) {
      journalize(mutation);
      if (trainingId) fetchTrainingParticipants(trainingId);
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const add = () => {
    if (!row.fullName) return;
    saveTrainingParticipant({ ...row, trainingId }, formatMessage('training.participant.add.mutationLabel'));
    setRow(EMPTY);
  };
  const updateAttendance = (p, attendanceStatus) => saveTrainingParticipant(
    { id: p.id, trainingId, attendanceStatus }, formatMessage('training.participant.update.mutationLabel'),
  );
  const remove = (p) => deleteTrainingParticipant(p, formatMessage('training.participant.delete.mutationLabel'));

  return (
    <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('training.participant.fullName')}</TableCell>
            <TableCell>{formatMessage('training.participant.type')}</TableCell>
            <TableCell>{formatMessage('training.participant.organization')}</TableCell>
            <TableCell>{formatMessage('training.participant.phone')}</TableCell>
            <TableCell>{formatMessage('training.participant.attendance')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(trainingParticipants ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.fullName}</TableCell>
              <TableCell>{formatMessage(`training.participantType.${p.participantType}`)}</TableCell>
              <TableCell>{p.organization}</TableCell>
              <TableCell>{p.phone}</TableCell>
              <TableCell>
                <AttendanceStatusPicker
                  readOnly={readOnly}
                  value={p.attendanceStatus}
                  onChange={(v) => updateAttendance(p, v)}
                />
              </TableCell>
              <TableCell>
                {!readOnly && (
                  <Tooltip title={formatMessage('deleteButton.tooltip')}>
                    <IconButton size="small" onClick={() => remove(p)}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
          {!readOnly && (
            <TableRow>
              <TableCell>
                <TextInput module="training" value={row.fullName} onChange={(v) => setRow({ ...row, fullName: v })} />
              </TableCell>
              <TableCell>
                <ParticipantTypePicker value={row.participantType} onChange={(v) => setRow({ ...row, participantType: v })} />
              </TableCell>
              <TableCell>
                <TextInput module="training" value={row.organization} onChange={(v) => setRow({ ...row, organization: v })} />
              </TableCell>
              <TableCell>
                <TextInput module="training" value={row.phone} onChange={(v) => setRow({ ...row, phone: v })} />
              </TableCell>
              <TableCell>
                <AttendanceStatusPicker value={row.attendanceStatus} onChange={(v) => setRow({ ...row, attendanceStatus: v })} />
              </TableCell>
              <TableCell>
                <Button variant="contained" size="small" color="primary" onClick={add} disabled={!row.fullName}>
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
  trainingParticipants: state.training.trainingParticipants,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingParticipants, saveTrainingParticipant, deleteTrainingParticipant, journalize,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingParticipantsPanel);
