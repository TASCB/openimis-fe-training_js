import React, { useEffect, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import _debounce from 'lodash/debounce';
import { useModulesManager, useTranslations, useHistory } from '@openimis/fe-core';
import { ConflictPanel } from '@openimis/fe-tasaf_common';
import { fetchTrainingConflicts, clearTrainingConflicts, decId } from '../actions';
import { DEFAULT_DEBOUNCE_TIME, TRAINING_ROUTE_TRAINING } from '../constants';
import { toISO } from '../utils/dates';

function ConflictBanner({
  edited, trainingConflicts, trainingAssignments,
  fetchTrainingConflicts, clearTrainingConflicts,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations('training', modulesManager);

  // trainingAssignments is never cleared, so keep only rows of the training being edited.
  const ownAssignments = useMemo(() => {
    const editedId = decId(edited?.id);
    if (!editedId) return [];
    return (trainingAssignments ?? []).filter((a) => decId(a.training?.id) === editedId);
  }, [trainingAssignments, edited?.id]);

  const trainerIds = useMemo(
    () => ownAssignments.map((a) => decId(a.trainer?.id)).filter(Boolean),
    [ownAssignments],
  );
  const staffUserIds = useMemo(
    () => ownAssignments.map((a) => decId(a.staffUser?.id)).filter(Boolean),
    [ownAssignments],
  );

  const debouncedFetch = useMemo(
    () => _debounce((vars) => fetchTrainingConflicts(vars), DEFAULT_DEBOUNCE_TIME),
    [],
  );

  useEffect(() => {
    if (edited?.startDatetime && edited?.endDatetime) {
      debouncedFetch({
        startDatetime: toISO(edited.startDatetime),
        endDatetime: toISO(edited.endDatetime, true),
        trainingId: decId(edited.id), // relay global id here; $trainingId is a raw UUID
        venue: edited.venue ?? null,
        locationId: (() => { const d = decId(edited.locationId ?? edited.location?.id); return d ? Number(d) : null; })(),
        trainerIds: trainerIds.length ? trainerIds : null,
        staffUserIds: staffUserIds.length ? staffUserIds : null,
      });
    } else {
      clearTrainingConflicts();
    }
  }, [edited?.startDatetime, edited?.endDatetime, edited?.venue, edited?.locationId,
    // the ids themselves, not their count — swapping one trainer for another must re-check
    trainerIds.join(), staffUserIds.join()]);

  if (!(trainingConflicts ?? []).length) return null;
  return (
    <Grid container>
      <ConflictPanel
        conflicts={trainingConflicts}
        hardTitle={formatMessage('training.conflict.hardTitle')}
        softTitle={formatMessage('training.conflict.softTitle')}
        viewLabel={formatMessage('training.conflict.open')}
        hrefFor={(c) => (c.conflictingTrainingId
          ? history.createHref({ pathname: `/${modulesManager.getRef(TRAINING_ROUTE_TRAINING)}/${c.conflictingTrainingId}` })
          : null)}
      />
    </Grid>
  );
}

const mapStateToProps = (state) => ({
  trainingConflicts: state.training.trainingConflicts,
  trainingAssignments: state.training.trainingAssignments,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  { fetchTrainingConflicts, clearTrainingConflicts }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(ConflictBanner);
