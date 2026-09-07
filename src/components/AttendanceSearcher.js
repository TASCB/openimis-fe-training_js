import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  IconButton, Tooltip, Dialog, DialogContent, DialogActions, Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

// Equal-width searcher columns;
const useSearcherTable = makeStyles(() => ({
  root: {
    '& table': { tableLayout: 'fixed' },
    '& table th': { whiteSpace: 'nowrap' },
    '& table th:last-child, & table td:last-child': {
      width: 56, paddingLeft: 0, paddingRight: 0, textAlign: 'center',
    },
  },
}));

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
    'training.participant.fullName', 'training.gender', 'training.attendance.training',
    'training.participant.category', 'training.participant.organization', 'training.participant.phone',
    'training.participant.attendance', 'training.paaReference', 'emptyLabel',
  ];
  const sorts = () => [
    ['fullName', true], ['gender', true], null, ['category__sequence', true], ['organization', true],
    ['phone', true], ['attendanceStatus', true], null, null,
  ];

  const fetch = (params) => fetchAttendances(modulesManager, params);

  const itemFormatters = () => [
    (p) => p?.fullName,
    (p) => (p?.gender ? formatMessage(`training.gender.${p.gender}`) : ''),
    (p) => (p?.training ? `${p.training.code} - ${p.training.title}` : ''),
    (p) => p?.category?.name ?? '',
    (p) => p?.organization ?? '',
    (p) => p?.phone ?? '',
    (p) => (p?.attendanceStatus ? formatMessage(`training.attendanceStatus.${p.attendanceStatus}`) : ''),
    // District on the mainland, island scope in Zanzibar — the reporting unit, not the
    // raw village/ward the participant happens to be recorded against.
    (p) => p?.paaReference ?? '',
    (p) => (
      <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
        <IconButton onClick={() => setViewed(p)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ),
  ];

  const filterPane = ({ filters, onChangeFilters }) => (
    <AttendanceFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const tableClasses = useSearcherTable();
  return (
    <div className={tableClasses.root}>
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
    </div>
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
