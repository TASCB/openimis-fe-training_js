import React from 'react';
import { injectIntl } from 'react-intl';
import { PublishedComponent, TextInput } from '@openimis/fe-core';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { defaultFilterStyles } from '../utils/styles';
import { DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, CONTAINS_LOOKUP } from '../constants';
import { TrainingStatusPicker } from '../pickers/ConstantPickers';
import TrainingCategoryPicker from '../pickers/TrainingCategoryPicker';
import TrainerPicker from '../pickers/TrainerPicker';

function TrainingFilter({ classes, filters, onChangeFilters }) {
  const debounced = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const filterValue = (k) => filters?.[k]?.value;
  const filterText = (k) => filters?.[k]?.value ?? EMPTY_STRING;

  const onText = (filterName, lookup) => (value) => debounced([{
    id: filterName, value, filter: `${filterName}_${lookup}: "${value}"`,
  }]);

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="training"
          label="training.code"
          value={filterText('code')}
          onChange={onText('code', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="training"
          label="training.title"
          value={filterText('title')}
          onChange={onText('title', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TrainingStatusPicker
          withNull
          label="training.status"
          value={filterValue('status')}
          onChange={(value) => onChangeFilters([{
            id: 'status', value, filter: value ? `status: "${value}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TrainingCategoryPicker
          withLabel
          value={filterValue('categoryObj')}
          onChange={(v) => onChangeFilters([{
            id: 'category_Id', value: v, filter: v ? `categoryId: "${v.id}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TrainerPicker
          withLabel
          value={filterValue('trainerObj')}
          onChange={(v) => onChangeFilters([{
            id: 'assignments_Trainer_Id', value: v, filter: v ? `assignments_Trainer_Id: "${v.id}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="training"
          label="training.startFrom"
          value={filterValue('startDatetime_Gte')}
          onChange={(v) => onChangeFilters([{
            id: 'startDatetime_Gte', value: v, filter: v ? `startDatetime_Gte: "${v}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="training"
          label="training.startTo"
          value={filterValue('startDatetime_Lte')}
          onChange={(v) => onChangeFilters([{
            id: 'startDatetime_Lte', value: v, filter: v ? `startDatetime_Lte: "${v}"` : '',
          }])}
        />
      </Grid>
      <Grid item xs={12} className={classes.item}>
        <PublishedComponent
          pubRef="location.DetailedLocationFilter"
          withNull
          filters={filters}
          onChangeFilters={onChangeFilters}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(TrainingFilter)));
