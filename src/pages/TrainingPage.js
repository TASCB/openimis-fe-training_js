import React, { useEffect, useState, useRef } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';
import {
  Helmet, Form, useTranslations, useModulesManager, useHistory, journalize,
} from '@openimis/fe-core';
import {
  MODULE_NAME, EMPTY_STRING, TRAINING_STATUS, STATUS_ACTIONS,
  RIGHT_TRAINING_UPDATE, RIGHT_TRAINING_CREATE, RIGHT_PARTICIPANT_MANAGE,
  TRAINING_ROUTE_TRAINING,
} from '../constants';
import {
  fetchTraining, clearTraining, createTraining, updateTraining, transitionTraining,
} from '../actions';
import TrainingHeadPanel from '../components/TrainingHeadPanel';
import ConflictBanner from '../components/ConflictBanner';
import TrainingTabs from '../components/TrainingTabs';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function TrainingPage({ trainingUuid }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const training = useSelector((s) => s.training.training);
  const mutation = useSelector((s) => s.training.mutation);
  const submittingMutation = useSelector((s) => s.training.submittingMutation);
  const trainingConflicts = useSelector((s) => s.training.trainingConflicts);

  const [edited, setEdited] = useState({ status: TRAINING_STATUS.DRAFT });
  const [resetKey, setResetKey] = useState(0);
  const prev = useRef();

  const isNew = !trainingUuid;
  const canEditDetails = (isNew && rights.includes(RIGHT_TRAINING_CREATE))
    || (rights.includes(RIGHT_TRAINING_UPDATE)
        && [TRAINING_STATUS.DRAFT, TRAINING_STATUS.REJECTED].includes(edited?.status));

  useEffect(() => {
    if (trainingUuid) dispatch(fetchTraining(modulesManager, [`id: "${trainingUuid}"`]));
    return () => dispatch(clearTraining());
  }, [trainingUuid]);

  useEffect(() => {
    if (training) {
      setEdited(training);
      setResetKey((k) => k + 1);
      if (isNew && training.id) {
        history.replace(`/${modulesManager.getRef(TRAINING_ROUTE_TRAINING)}/${training.id}`);
      }
    }
  }, [training]);

  useEffect(() => {
    if (prev.current && !submittingMutation) {
      dispatch(journalize(mutation));
      if (mutation?.clientMutationId) {
        dispatch(fetchTraining(modulesManager, [`clientMutationId: "${mutation.clientMutationId}"`]));
      }
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const titleParams = (t) => ({ code: t?.code ?? EMPTY_STRING });
  const back = () => history.goBack();

  const save = (data) => {
    const label = formatMessageWithValues(
      isNew ? 'training.create.mutationLabel' : 'training.update.mutationLabel', titleParams(data),
    );
    if (isNew) dispatch(createTraining(data, label));
    else dispatch(updateTraining(data, label));
  };

  const onAction = (action) => dispatch(transitionTraining(
    action, edited, formatMessageWithValues(`training.action.${action}.mutationLabel`, titleParams(edited)),
  ));

  const hasHardConflict = (trainingConflicts ?? []).some((c) => c.hard);
  const mandatoryFilled = edited?.code && edited?.title && edited?.startDatetime && edited?.endDatetime;
  const canSave = () => canEditDetails && mandatoryFilled && !hasHardConflict;

  const actions = (!isNew ? (STATUS_ACTIONS[edited?.status] || []) : [])
    .filter((a) => rights.includes(a.right))
    .map((a) => ({
      onlyIfNotDirty: true,
      tooltip: formatMessage(`training.action.${a.action}`),
      button: (
        <Button variant="contained" color="primary" onClick={() => onAction(a.action)}>
          {formatMessage(`training.action.${a.action}`)}
        </Button>
      ),
    }));

  const getPanels = () => {
    const panels = [ConflictBanner];
    if (!isNew) panels.push(TrainingTabs);
    return panels;
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues('training.TrainingPage.title', titleParams(edited))} />
      <Form
        key={resetKey}
        module="training"
        title="training.TrainingPage.title"
        titleParams={titleParams(edited)}
        edited={edited}
        edited_id={trainingUuid}
        reset={resetKey}
        openDirty
        onEditedChanged={setEdited}
        back={back}
        save={save}
        canSave={canSave}
        saveTooltip={formatMessage('saveButton.tooltip')}
        HeadPanel={TrainingHeadPanel}
        Panels={getPanels()}
        actions={actions}
        readOnly={!canEditDetails}
        trainingId={trainingUuid}
        assignmentReadOnly={!rights.includes(RIGHT_TRAINING_UPDATE)}
        participantReadOnly={!rights.includes(RIGHT_PARTICIPANT_MANAGE)}
        filesReadOnly={!rights.includes(RIGHT_TRAINING_UPDATE)}
        rights={rights}
      />
    </div>
  );
}

const mapStateToProps = (state, props) => ({ trainingUuid: props.match.params.training_uuid });
export default connect(mapStateToProps, null)(TrainingPage);
