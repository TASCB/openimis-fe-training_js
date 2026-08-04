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
import { AttendanceStatusPicker, GenderPicker } from '../pickers/ConstantPickers';
import ParticipantCategoryPicker from '../pickers/ParticipantCategoryPicker';
import { decId } from '../actions';

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
        {/* No label override: ConstantBasedPicker builds option keys from `label`. */}
        <AttendanceStatusPicker
          withNull
          value={filterValue('attendanceStatus')}
          onChange={(v) => onChangeFilters([{
            id: 'attendanceStatus', value: v, filter: v ? `attendanceStatus: "${v}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <ParticipantCategoryPicker
          withLabel
          label="training.participant.category"
          value={filterValue('categoryObj')}
          onChange={(v) => onChangeFilters([{
            // decId: relay global id -> UUID arg.
            id: 'categoryObj', value: v, filter: v ? `categoryId: "${decId(v.id)}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <GenderPicker
          withNull
          label="training.gender"
          value={filterValue('gender')}
          onChange={(v) => onChangeFilters([{
            // graphene_django types this filter from the model choices, so the value is a
            // TrainingParticipantGender enum literal — unquoted, unlike the filters above.
            id: 'gender', value: v, filter: v ? `gender: ${v}` : '',
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
