import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Tooltip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  PublishedComponent, SelectInput, TextInput, useModulesManager, useTranslations, journalize,
} from '@openimis/fe-core';
import { userDisplayName } from '../utils/users';
import {
  fetchTrainingParticipants, fetchTrainingSessions, saveTrainingParticipant,
  deleteTrainingParticipant, decId,
} from '../actions';
import { AttendanceStatusPicker, GenderPicker } from '../pickers/ConstantPickers';
import ParticipantCategoryPicker from '../pickers/ParticipantCategoryPicker';

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
  submittingMutation, mutation, fetchTrainingParticipants, fetchTrainingSessions,
  saveTrainingParticipant, deleteTrainingParticipant, journalize,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [row, setRow] = useState(EMPTY);
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

  const pickInternalUser = (v) => setRow({
    ...row,
    internalUser: v ?? null,
    fullName: row.fullName || userDisplayName(v),
  });

  const add = () => {
    if (!row.fullName) return;
    saveTrainingParticipant({ ...row, trainingId }, formatMessage('training.participant.add.mutationLabel'));
    setRow(EMPTY);
  };
  // Partial update — the mutation only touches the fields it is given.
  const updateField = (p, patch) => saveTrainingParticipant(
    { id: p.id, trainingId, ...patch }, formatMessage('training.participant.update.mutationLabel'),
  );
  const remove = (p) => deleteTrainingParticipant(p, formatMessage('training.participant.delete.mutationLabel'));

  // Which register a new row lands in. Blank = a whole-training entry, which is what
  // manual entries have always been; a session makes it that day's attendance register.
  const sessionOptions = [
    { value: '', label: formatMessage('training.participant.wholeTraining') },
    ...(trainingSessions ?? []).map((s) => ({ value: s.id, label: s.title })),
  ];

  return (
    <>
      {!readOnly && sessionOptions.length > 1 && (
        <div style={{ maxWidth: 320, padding: '8px 0 4px' }}>
          <SelectInput
            module="training"
            label="training.participant.addToSession"
            options={sessionOptions}
            value={row.sessionId}
            onChange={(v) => setRow({ ...row, sessionId: v ?? '' })}
          />
        </div>
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
          {(trainingParticipants ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.fullName}</TableCell>
              <TableCell>{userDisplayName(p.internalUser)}</TableCell>
              <TableCell>{p.session?.title ?? ''}</TableCell>
              <TableCell>
                {/* Editable inline so historical rows, which all have a null gender, can be filled in. */}
                <GenderPicker
                  withNull
                  readOnly={readOnly}
                  value={p.gender}
                  onChange={(v) => updateField(p, { gender: v })}
                />
              </TableCell>
              <TableCell>
                <ParticipantCategoryPicker
                  readOnly={readOnly}
                  levelCode={levelCode}
                  value={p.category}
                  onChange={(v) => updateField(p, { categoryId: decId(v?.id) })}
                />
              </TableCell>
              <TableCell>{p.organization}</TableCell>
              <TableCell>{p.phone}</TableCell>
              <TableCell>
                <AttendanceStatusPicker
                  readOnly={readOnly}
                  value={p.attendanceStatus}
                  onChange={(v) => updateField(p, { attendanceStatus: v })}
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
                {/* Picking a system user fills the name so staff attendees don't have to be
                    retyped, but never overwrites a name already entered by hand. */}
                <PublishedComponent
                  pubRef="admin.UserPicker"
                  module="training"
                  value={row.internalUser}
                  onChange={pickInternalUser}
                />
              </TableCell>
              <TableCell>
                {sessionOptions.find((o) => o.value === row.sessionId)?.label ?? ''}
              </TableCell>
              <TableCell>
                <GenderPicker withNull value={row.gender} onChange={(v) => setRow({ ...row, gender: v })} />
              </TableCell>
              <TableCell>
                <ParticipantCategoryPicker
                  levelCode={levelCode}
                  value={row.category}
                  onChange={(v) => setRow({ ...row, category: v })}
                />
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
    </>
  );
}

const mapStateToProps = (state) => ({
  trainingParticipants: state.training.trainingParticipants,
  trainingSessions: state.training.trainingSessions,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingParticipants,
    fetchTrainingSessions,
    saveTrainingParticipant,
    deleteTrainingParticipant,
    journalize,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingParticipantsPanel);
