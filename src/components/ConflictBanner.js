import React, { useEffect, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import _debounce from 'lodash/debounce';
import { WarningBox, useModulesManager, useTranslations } from '@openimis/fe-core';
import { fetchTrainingConflicts, clearTrainingConflicts, decId } from '../actions';
import { DEFAULT_DEBOUNCE_TIME } from '../constants';
import { toISO } from '../utils/dates';

function ConflictBanner({
  edited, trainingConflicts, trainingAssignments,
  fetchTrainingConflicts, clearTrainingConflicts,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);

  const trainerIds = useMemo(
    () => (trainingAssignments ?? []).map((a) => decId(a.trainer?.id)).filter(Boolean),
    [trainingAssignments],
  );
  const staffUserIds = useMemo(
    () => (trainingAssignments ?? []).map((a) => decId(a.staffUser?.id)).filter(Boolean),
    [trainingAssignments],
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
        trainingId: edited.id ?? null,
        venue: edited.venue ?? null,
        locationId: (() => { const d = decId(edited.locationId ?? edited.location?.id); return d ? Number(d) : null; })(),
        trainerIds: trainerIds.length ? trainerIds : null,
        staffUserIds: staffUserIds.length ? staffUserIds : null,
      });
    } else {
      clearTrainingConflicts();
    }
  }, [edited?.startDatetime, edited?.endDatetime, edited?.venue, edited?.locationId,
    trainerIds.length, staffUserIds.length]);

  const hard = (trainingConflicts ?? []).filter((c) => c.hard);
  const soft = (trainingConflicts ?? []).filter((c) => !c.hard);
  if (!hard.length && !soft.length) return null;

  const HARD_STYLES = { backgroundColor: '#fdecea', borderLeft: '5px solid #c62828' };

  return (
    <Grid container>
      {hard.length > 0 && (
        <WarningBox
          title={formatMessage('training.conflict.hardTitle')}
          description={hard.map((c) => c.message).join('  •  ')}
          styles={HARD_STYLES}
        />
      )}
      {soft.length > 0 && (
        <WarningBox
          title={formatMessage('training.conflict.softTitle')}
          description={soft.map((c) => c.message).join('  •  ')}
        />
      )}
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
