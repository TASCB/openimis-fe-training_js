import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Helmet, useTranslations, useModulesManager } from '@openimis/fe-core';
import { MODULE_NAME, RIGHT_PARTICIPANT_SEARCH } from '../constants';
import AttendanceSearcher from '../components/AttendanceSearcher';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function AttendancePage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('training.attendance.page.title')} />
      {rights.includes(RIGHT_PARTICIPANT_SEARCH) && <AttendanceSearcher />}
    </div>
  );
}

export default AttendancePage;
