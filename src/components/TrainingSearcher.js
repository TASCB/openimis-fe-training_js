import React, { useRef, useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import {
  IconButton, Tooltip, Dialog, DialogContent, DialogActions, Button,
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';

import { useIntl } from 'react-intl';
import {
  Searcher, useHistory, useModulesManager, useTranslations, journalize, coreConfirm, clearConfirm,
  formatDateFromISO,
} from '@openimis/fe-core';
import { fetchTrainings, deleteTraining } from '../actions';
import {
  DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, RIGHT_TRAINING_SEARCH, RIGHT_TRAINING_DELETE,
  TRAINING_ROUTE_TRAINING, TRAINING_STATUS,
} from '../constants';
import TrainingFilter from './TrainingFilter';
import StatusChip from './StatusChip';
import TrainingProfileCard from './TrainingProfileCard';

function TrainingSearcher({
  fetchTrainings, deleteTraining, journalize, coreConfirm, clearConfirm, confirmed,
  fetchingTrainings, fetchedTrainings, errorTrainings, trainings,
  trainingsPageInfo, trainingsTotalCount, submittingMutation, mutation,
}) {
  const history = useHistory();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('training', modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const [toDelete, setToDelete] = useState(null);
  const [viewed, setViewed] = useState(null);
  const [queryParams, setQueryParams] = useState([]);
  const prevSubmittingRef = useRef();

  const openTraining = (t) => rights.includes(RIGHT_TRAINING_SEARCH) && history.push(
    `/${modulesManager.getRef(TRAINING_ROUTE_TRAINING)}/${t?.id}`,
  );

  useEffect(() => {
    if (toDelete) {
      coreConfirm(
        formatMessage('training.deleteDialog.title'),
        formatMessageWithValues('training.deleteDialog.message', { code: toDelete.code }),
      );
    }
  }, [toDelete]);

  useEffect(() => {
    if (toDelete && confirmed) {
      deleteTraining(toDelete, formatMessageWithValues('training.delete.mutationLabel', { code: toDelete.code }));
      setToDelete(null);
    }
    if (confirmed !== null) setToDelete(null);
    return () => confirmed !== null && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation) {
      journalize(mutation);
      fetchTrainings(modulesManager, queryParams);
    }
  }, [submittingMutation]);
  useEffect(() => { prevSubmittingRef.current = submittingMutation; });

  const headers = () => [
    'training.code', 'training.title', 'training.category', 'training.status',
    'training.startDatetime', 'training.endDatetime', 'training.venue', 'training.participants', 'emptyLabel',
  ];
  const sorts = () => [
    ['code', true], ['title', true], null, ['status', true],
    ['startDatetime', true], ['endDatetime', true], null, null, null,
  ];

  const fetch = (params) => { setQueryParams(params); return fetchTrainings(modulesManager, params); };

  const itemFormatters = () => [
    (t) => t?.code,
    (t) => t?.title,
    (t) => t?.category?.name ?? '',
    (t) => <StatusChip status={t?.status} />,
    (t) => (t?.startDatetime ? formatDateFromISO(modulesManager, intl, t.startDatetime) : ''),
    (t) => (t?.endDatetime ? formatDateFromISO(modulesManager, intl, t.endDatetime) : ''),
    (t) => t?.venue ?? '',
    (t) => t?.expectedParticipants ?? '',
    (t) => (
      <>
        <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
          <IconButton onClick={() => setViewed(t)}><VisibilityIcon /></IconButton>
        </Tooltip>
        {rights.includes(RIGHT_TRAINING_DELETE)
          && ![TRAINING_STATUS.CLOSED].includes(t?.status) && (
          <Tooltip title={formatMessage('deleteButton.tooltip')}>
            <IconButton onClick={() => setToDelete(t)}><DeleteIcon /></IconButton>
          </Tooltip>
        )}
      </>
    ),
  ];

  const filterPane = ({ filters, onChangeFilters }) => (
    <TrainingFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <>
      <Dialog open={!!viewed} onClose={() => setViewed(null)} maxWidth="md" fullWidth PaperProps={{ style: { borderRadius: 0 } }}>
        <DialogContent style={{ padding: 0 }}>
          {viewed && <TrainingProfileCard training={viewed} />}
        </DialogContent>
        <DialogActions>
          {viewed && rights.includes(RIGHT_TRAINING_SEARCH) && (
            <Button color="primary" onClick={() => openTraining(viewed)}>{formatMessage('training.open')}</Button>
          )}
          <Button onClick={() => setViewed(null)}>{formatMessage('training.close')}</Button>
        </DialogActions>
      </Dialog>
      <Searcher
        module="training"
        FilterPane={filterPane}
      fetch={fetch}
      items={trainings}
      itemsPageInfo={trainingsPageInfo}
      fetchedItems={fetchedTrainings}
      fetchingItems={fetchingTrainings}
      errorItems={errorTrainings}
      tableTitle={formatMessageWithValues('training.searcherResultsTitle', { trainingsTotalCount })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={(t) => t.id}
      onDoubleClick={(t) => setViewed(t)}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  fetchingTrainings: state.training.fetchingTrainings,
  fetchedTrainings: state.training.fetchedTrainings,
  errorTrainings: state.training.errorTrainings,
  trainings: state.training.trainings,
  trainingsPageInfo: state.training.trainingsPageInfo,
  trainingsTotalCount: state.training.trainingsTotalCount,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  { fetchTrainings, deleteTraining, journalize, coreConfirm, clearConfirm }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingSearcher);
