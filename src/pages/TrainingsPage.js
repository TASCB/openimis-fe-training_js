import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {
  Helmet, useTranslations, useModulesManager, useHistory, withTooltip,
} from '@openimis/fe-core';
import {
  MODULE_NAME, RIGHT_TRAINING_SEARCH, RIGHT_TRAINING_CREATE, TRAINING_ROUTE_TRAINING,
} from '../constants';
import TrainingSearcher from '../components/TrainingSearcher';

const useStyles = makeStyles((theme) => ({ page: theme.page, fab: theme.fab }));

function TrainingsPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const onCreate = () => history.push(`/${modulesManager.getRef(TRAINING_ROUTE_TRAINING)}`);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('training.trainings.page.title')} />
      {rights.includes(RIGHT_TRAINING_SEARCH) && <TrainingSearcher />}
      {rights.includes(RIGHT_TRAINING_CREATE) && withTooltip(
        <div className={classes.fab}>
          <Fab color="primary" onClick={onCreate}><AddIcon /></Fab>
        </div>,
        formatMessage('createButton.tooltip'),
      )}
    </div>
  );
}

export default TrainingsPage;
