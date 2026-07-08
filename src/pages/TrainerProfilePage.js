import React, { useEffect, useState, useRef } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import _ from 'lodash';
import {
  Helmet, Form, useTranslations, useModulesManager, useHistory, journalize,
} from '@openimis/fe-core';
import {
  MODULE_NAME, EMPTY_STRING, RIGHT_TRAINER_MANAGE, TRAINING_ROUTE_TRAINER,
} from '../constants';
import {
  fetchTrainerProfile, clearTrainerProfile, createTrainerProfile, updateTrainerProfile,
} from '../actions';
import TrainerHeadPanel from '../components/TrainerHeadPanel';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function TrainerProfilePage({ trainerUuid }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const trainerProfile = useSelector((s) => s.training.trainerProfile);
  const mutation = useSelector((s) => s.training.mutation);
  const submittingMutation = useSelector((s) => s.training.submittingMutation);

  const [edited, setEdited] = useState({ trainerType: 'INTERNAL', isActive: true });
  const [resetKey, setResetKey] = useState(0);
  const prev = useRef();
  const isNew = !trainerUuid;
  const canManage = rights.includes(RIGHT_TRAINER_MANAGE);

  useEffect(() => {
    if (trainerUuid) dispatch(fetchTrainerProfile(modulesManager, [`id: "${trainerUuid}"`]));
    return () => dispatch(clearTrainerProfile());
  }, [trainerUuid]);

  useEffect(() => {
    if (trainerProfile) {
      setEdited(trainerProfile);
      setResetKey((k) => k + 1);
      if (isNew && trainerProfile.id) {
        history.replace(`/${modulesManager.getRef(TRAINING_ROUTE_TRAINER)}/${trainerProfile.id}`);
      }
    }
  }, [trainerProfile]);

  useEffect(() => {
    if (prev.current && !submittingMutation) {
      dispatch(journalize(mutation));
      if (mutation?.clientMutationId) {
        dispatch(fetchTrainerProfile(modulesManager, [`clientMutationId: "${mutation.clientMutationId}"`]));
      }
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const titleParams = (t) => ({ name: t?.fullName ?? EMPTY_STRING });
  const back = () => history.goBack();

  const save = (data) => {
    const label = formatMessageWithValues(
      isNew ? 'training.trainer.create.mutationLabel' : 'training.trainer.update.mutationLabel', titleParams(data),
    );
    if (isNew) dispatch(createTrainerProfile(data, label));
    else dispatch(updateTrainerProfile(data, label));
  };

  const canSave = () => canManage && !!edited?.code && !!edited?.fullName && !_.isEqual(trainerProfile, edited);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('training.trainer.page.title')} />
      <Form
        key={resetKey}
        module="training"
        title="training.trainer.page.titleParam"
        titleParams={titleParams(edited)}
        edited={edited}
        edited_id={trainerUuid}
        reset={resetKey}
        openDirty
        onEditedChanged={setEdited}
        back={back}
        save={save}
        canSave={canSave}
        saveTooltip={formatMessage('saveButton.tooltip')}
        HeadPanel={TrainerHeadPanel}
        readOnly={!canManage}
        rights={rights}
      />
    </div>
  );
}

const mapStateToProps = (state, props) => ({ trainerUuid: props.match.params.trainer_uuid });
export default connect(mapStateToProps, null)(TrainerProfilePage);
