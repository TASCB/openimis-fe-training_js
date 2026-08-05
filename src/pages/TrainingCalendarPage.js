import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Helmet, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import { ModuleCalendar } from '@openimis/fe-tasaf_common';
import {
  MODULE_NAME, STATUS_COLORS, TRAINING_STATUS_LIST, CALENDAR_SOURCE_COLORS,
  TRAINING_ROUTE_TRAINING, RIGHT_TRAINING_CREATE, RIGHT_UNIFIED_CALENDAR_VIEW,
} from '../constants';
import { fetchTrainingCalendar, fetchUnifiedCalendar } from '../actions';
import { toISO } from '../utils/dates';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function TrainingCalendarPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const events = useSelector((s) => s.training.trainingCalendar);
  const fetching = useSelector((s) => s.training.fetchingCalendar);
  const error = useSelector((s) => s.training.errorCalendar);
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const canSeeUnified = rights.includes(RIGHT_UNIFIED_CALENDAR_VIEW);

  const detailRef = modulesManager.getRef(TRAINING_ROUTE_TRAINING);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('training.calendar.page.title')} />
      <ModuleCalendar
        moduleName={MODULE_NAME}
        events={events}
        fetching={fetching}
        error={error}
        onFetchRange={(from, to) => dispatch(fetchTrainingCalendar({ dateFrom: toISO(from), dateTo: toISO(to, true) }))}
        statusColors={STATUS_COLORS}
        statusList={TRAINING_STATUS_LIST}
        onFetchUnifiedRange={canSeeUnified
          ? (from, to) => dispatch(fetchUnifiedCalendar({ dateFrom: toISO(from), dateTo: toISO(to, true) }))
          : null}
        sourceColors={CALENDAR_SOURCE_COLORS}
        ownSource="TRAINING"
        onOpenEvent={(e) => (e.source && e.source !== 'TRAINING' ? null : history.push(`/${detailRef}/${e.id}`))}
        onCreate={rights.includes(RIGHT_TRAINING_CREATE) ? () => history.push(`/${detailRef}`) : null}
        title={formatMessage('training.calendar.page.title')}
        subtitle={formatMessage('training.calendar.subtitle')}
      />
    </div>
  );
}

export default TrainingCalendarPage;
