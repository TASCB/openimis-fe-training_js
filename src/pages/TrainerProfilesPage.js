import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {
  Helmet, useTranslations, useModulesManager, useHistory, withTooltip,
} from '@openimis/fe-core';
import {
  MODULE_NAME, RIGHT_TRAINER_SEARCH, RIGHT_TRAINER_MANAGE, TRAINING_ROUTE_TRAINER,
} from '../constants';
import TrainerSearcher from '../components/TrainerSearcher';

const useStyles = makeStyles((theme) => ({ page: theme.page, fab: theme.fab }));

function TrainerProfilesPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const onCreate = () => history.push(`/${modulesManager.getRef(TRAINING_ROUTE_TRAINER)}`);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('training.trainers.page.title')} />
      {rights.includes(RIGHT_TRAINER_SEARCH) && <TrainerSearcher />}
      {rights.includes(RIGHT_TRAINER_MANAGE) && withTooltip(
        <div className={classes.fab}><Fab color="primary" onClick={onCreate}><AddIcon /></Fab></div>,
        formatMessage('createButton.tooltip'),
      )}
    </div>
  );
}

export default TrainerProfilesPage;
