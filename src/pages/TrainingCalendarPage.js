import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Helmet, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import ModuleCalendar from '../components/ModuleCalendar';
import {
  MODULE_NAME, STATUS_COLORS, TRAINING_STATUS_LIST,
  TRAINING_ROUTE_TRAINING, RIGHT_TRAINING_CREATE,
} from '../constants';
import { fetchTrainingCalendar } from '../actions';
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
        onOpenEvent={(e) => history.push(`/${detailRef}/${e.id}`)}
        onCreate={rights.includes(RIGHT_TRAINING_CREATE) ? () => history.push(`/${detailRef}`) : null}
        title={formatMessage('training.calendar.page.title')}
        subtitle={formatMessage('training.calendar.subtitle')}
      />
    </div>
  );
}

export default TrainingCalendarPage;
