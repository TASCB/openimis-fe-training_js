import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  IconButton, Tooltip, Dialog, DialogContent, DialogActions, Button,
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  Searcher, useHistory, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import { fetchAttendances, decId } from '../actions';
import {
  DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, RIGHT_TRAINING_SEARCH, TRAINING_ROUTE_TRAINING,
} from '../constants';
import AttendanceFilter from './AttendanceFilter';
import AttendanceProfileCard from './AttendanceProfileCard';

function AttendanceSearcher({
  fetchAttendances,
  fetchingAttendances, fetchedAttendances, errorAttendances, attendances,
  attendancesPageInfo, attendancesTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('training', modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const [viewed, setViewed] = useState(null);

  const openTraining = (p) => p?.training?.id && rights.includes(RIGHT_TRAINING_SEARCH) && history.push(
    `/${modulesManager.getRef(TRAINING_ROUTE_TRAINING)}/${decId(p.training.id)}`,
  );

  const headers = () => [
    'training.participant.fullName', 'training.attendance.training', 'training.participant.type',
    'training.participant.organization', 'training.participant.phone',
    'training.participant.attendance', 'training.participant.location', 'emptyLabel',
  ];
  const sorts = () => [
    ['fullName', true], null, ['participantType', true], ['organization', true],
    ['phone', true], ['attendanceStatus', true], null, null,
  ];

  const fetch = (params) => fetchAttendances(modulesManager, params);

  const itemFormatters = () => [
    (p) => p?.fullName,
    (p) => (p?.training ? `${p.training.code} - ${p.training.title}` : ''),
    (p) => (p?.participantType ? formatMessage(`training.participantType.${p.participantType}`) : ''),
    (p) => p?.organization ?? '',
    (p) => p?.phone ?? '',
    (p) => (p?.attendanceStatus ? formatMessage(`training.attendanceStatus.${p.attendanceStatus}`) : ''),
    (p) => p?.location?.name ?? '',
    (p) => (
      <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
        <IconButton onClick={() => setViewed(p)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ),
  ];

  const filterPane = ({ filters, onChangeFilters }) => (
    <AttendanceFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <>
      <Dialog open={!!viewed} onClose={() => setViewed(null)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 0 } }}>
        <DialogContent style={{ padding: 0 }}>
          {viewed && <AttendanceProfileCard attendance={viewed} />}
        </DialogContent>
        <DialogActions>
          {viewed?.training?.id && rights.includes(RIGHT_TRAINING_SEARCH) && (
            <Button color="primary" onClick={() => openTraining(viewed)}>
              {formatMessage('training.attendance.viewTraining')}
            </Button>
          )}
          <Button onClick={() => setViewed(null)}>{formatMessage('close')}</Button>
        </DialogActions>
      </Dialog>
      <Searcher
      module="training"
      FilterPane={filterPane}
      fetch={fetch}
      items={attendances}
      itemsPageInfo={attendancesPageInfo}
      fetchedItems={fetchedAttendances}
      fetchingItems={fetchingAttendances}
      errorItems={errorAttendances}
      tableTitle={formatMessageWithValues('training.attendance.searcherResultsTitle', { attendancesTotalCount })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={(p) => p.id}
      onDoubleClick={(p) => setViewed(p)}
    />
    </>
  );
}

const mapStateToProps = (state) => ({
  fetchingAttendances: state.training.fetchingAttendances,
  fetchedAttendances: state.training.fetchedAttendances,
  errorAttendances: state.training.errorAttendances,
  attendances: state.training.attendances,
  attendancesPageInfo: state.training.attendancesPageInfo,
  attendancesTotalCount: state.training.attendancesTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchAttendances }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AttendanceSearcher);
