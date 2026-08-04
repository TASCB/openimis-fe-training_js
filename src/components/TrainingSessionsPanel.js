import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Tooltip, Chip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CropFreeIcon from '@material-ui/icons/CropFree';
import { useIntl } from 'react-intl';
import {
  TextInput, PublishedComponent, formatDateFromISO,
  useModulesManager, useTranslations, journalize,
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

const EMPTY = { title: '', sessionDate: '', startTime: '', endTime: '' };

function TrainingSessionsPanel({
  trainingId, sessionsReadOnly: readOnly, trainingSessions, rights,
  submittingMutation, mutation,
  fetchTrainingSessions, saveTrainingSession, deleteTrainingSession, journalize,
}) {
  const modulesManager = useModulesManager();
  const intl = useIntl();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [row, setRow] = useState(EMPTY);
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

  const add = () => {
    if (!row.title) return;
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
  const remove = (s) => deleteTrainingSession(s, formatMessage('training.session.delete.mutationLabel'));

  const qrSession = (trainingSessions ?? []).find((s) => s.id === qrSessionId) || null;

  return (
    <>
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
          {(trainingSessions ?? []).map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.title}</TableCell>
              <TableCell>
                {s.sessionDate ? formatDateFromISO(modulesManager, intl, s.sessionDate) : '—'}
              </TableCell>
              <TableCell>{s.startTime ? `${s.startTime}${s.endTime ? ` – ${s.endTime}` : ''}` : '—'}</TableCell>
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
                    <IconButton size="small" onClick={() => remove(s)}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
          {canCreate && (
            <TableRow>
              <TableCell>
                <TextInput module="training" value={row.title} onChange={(v) => setRow({ ...row, title: v })} />
              </TableCell>
              <TableCell>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  module="training"
                  value={row.sessionDate || null}
                  onChange={(v) => setRow({ ...row, sessionDate: v || '' })}
                />
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: 4 }}>
                  <TimeInput
                    value={row.startTime}
                    onChange={(v) => setRow({ ...row, startTime: v })}
                  />
                  <TimeInput
                    value={row.endTime}
                    onChange={(v) => setRow({ ...row, endTime: v })}
                  />
                </div>
              </TableCell>
              <TableCell colSpan={2} />
              <TableCell>
                <Button variant="contained" size="small" color="primary" onClick={add} disabled={!row.title}>
                  {formatMessage('addButton')}
                </Button>
              </TableCell>
            </TableRow>
          )}
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
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingSessions, saveTrainingSession, deleteTrainingSession, journalize,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingSessionsPanel);
