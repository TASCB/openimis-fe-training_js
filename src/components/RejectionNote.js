import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Paper, Typography } from '@material-ui/core';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, TRAINING_STATUS } from '../constants';

const useStyles = makeStyles((theme) => ({
  paper: {
    ...theme.paper.paper,
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'flex-start',
    padding: theme.spacing(1.5, 2),
    borderLeft: `4px solid ${theme.palette.error.main}`,
  },
  icon: { color: theme.palette.error.main, marginTop: 2 },
  title: { fontWeight: 500 },
}));

const rejectReason = (training) => {
  try {
    return training?.jsonExt ? JSON.parse(training.jsonExt)?.reject_reason || null : null;
  } catch (e) {
    return null;
  }
};

function RejectionNote({ edited }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const reason = rejectReason(edited);
  if (!reason || ![TRAINING_STATUS.REJECTED, TRAINING_STATUS.DRAFT].includes(edited?.status)) return null;
  return (
    <Paper className={classes.paper} elevation={0}>
      <ErrorOutline className={classes.icon} />
      <div>
        <Typography variant="body2" className={classes.title}>{formatMessage('training.reject.noteTitle')}</Typography>
        <Typography variant="body2">{reason}</Typography>
      </div>
    </Paper>
  );
}

export default RejectionNote;
