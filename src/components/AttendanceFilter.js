import React from 'react';
import { injectIntl } from 'react-intl';
import {
  PublishedComponent, TextInput, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { defaultFilterStyles } from '../utils/styles';
import { DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, CONTAINS_LOOKUP } from '../constants';
import { AttendanceStatusPicker, ParticipantTypePicker } from '../pickers/ConstantPickers';

function AttendanceFilter({ classes, filters, onChangeFilters }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const debounced = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const filterValue = (k) => filters?.[k]?.value;
  const filterText = (k) => filters?.[k]?.value ?? EMPTY_STRING;
  const onText = (name, lookup) => (value) => debounced([{
    id: name, value, filter: `${name}_${lookup}: "${value}"`,
  }]);

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="training"
          label="training.attendance.trainingCode"
          value={filterText('trainingCode')}
          onChange={(v) => debounced([{ id: 'trainingCode', value: v, filter: v ? `training_Code_Icontains: "${v}"` : '' }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="training"
          label="training.attendance.trainingName"
          value={filterText('trainingName')}
          onChange={(v) => debounced([{ id: 'trainingName', value: v, filter: v ? `training_Title_Icontains: "${v}"` : '' }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="training"
          label="training.participant.fullName"
          value={filterText('fullName')}
          onChange={onText('fullName', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <AttendanceStatusPicker
          withNull
          label="training.participant.attendance"
          value={filterValue('attendanceStatus')}
          onChange={(v) => onChangeFilters([{
            id: 'attendanceStatus', value: v, filter: v ? `attendanceStatus: "${v}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <ParticipantTypePicker
          withNull
          label="training.participant.type"
          value={filterValue('participantType')}
          onChange={(v) => onChangeFilters([{
            id: 'participantType', value: v, filter: v ? `participantType: "${v}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={!!filterValue('showDeleted')}
              onChange={(e) => onChangeFilters([{
                id: 'showDeleted', value: e.target.checked, filter: e.target.checked ? 'showDeleted: true' : '',
              }])}
            />
          )}
          label={formatMessage('training.attendance.showDeleted')}
        />
      </Grid>
      <Grid item xs={12} className={classes.item}>
        <PublishedComponent
          pubRef="location.DetailedLocationFilter"
          withNull
          anchor="parentLocation"
          filters={filters}
          onChangeFilters={onChangeFilters}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(AttendanceFilter)));
