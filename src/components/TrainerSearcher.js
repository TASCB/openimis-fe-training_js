import React, { useRef, useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
  Grid, IconButton, Tooltip, Dialog, DialogContent, DialogActions, Button,
} from '@material-ui/core';
import { withTheme, withStyles, makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import _debounce from 'lodash/debounce';
import {
  Searcher, TextInput, useHistory, useModulesManager, useTranslations, journalize, coreConfirm, clearConfirm,
} from '@openimis/fe-core';
import { fetchTrainerProfiles, deleteTrainerProfile } from '../actions';
import {
  DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING,
  RIGHT_TRAINER_SEARCH, RIGHT_TRAINER_MANAGE, TRAINING_ROUTE_TRAINER,
} from '../constants';
import { TrainerTypePicker } from '../pickers/ConstantPickers';
import { defaultFilterStyles } from '../utils/styles';
import TrainerProfileCard from './TrainerProfileCard';

const Filter = injectIntl(withTheme(withStyles(defaultFilterStyles)(({ classes, filters, onChangeFilters }) => {
  const debounced = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const v = (k) => filters?.[k]?.value ?? EMPTY_STRING;
  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="training"
          label="training.trainer.fullName"
          value={v('fullName')}
          onChange={(val) => debounced([{ id: 'fullName', value: val, filter: `fullName_${CONTAINS_LOOKUP}: "${val}"` }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="training"
          label="training.trainer.organization"
          value={v('organization')}
          onChange={(val) => debounced([{ id: 'organization', value: val, filter: `organization_${CONTAINS_LOOKUP}: "${val}"` }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TrainerTypePicker
          withNull
          value={filters?.trainerType?.value}
          onChange={(val) => onChangeFilters([{ id: 'trainerType', value: val, filter: val ? `trainerType: "${val}"` : '' }])}
        />
      </Grid>
    </Grid>
  );
})));

//Fixed layout ( code, Full name,Type ,Organization,Email,Active,View,Edit,delete,trailong spacer)
const useStyles = makeStyles(() => ({
  searcher: {
    '& table': { tableLayout: 'fixed' },
    '& table th': { whiteSpace: 'nowrap' },
    '& table th:nth-child(7), & table td:nth-child(7)': { width: 56 },
    '& table th:nth-child(8), & table td:nth-child(8)': { width: 56 },
    '& table th:nth-child(9), & table td:nth-child(9)': { width: 56 },
    '& table th:last-child, & table td:last-child': { width: 32 },
  },
}));

function TrainerSearcher({
  fetchTrainerProfiles, deleteTrainerProfile, journalize, coreConfirm, clearConfirm, confirmed,
  fetchingTrainers, fetchedTrainers, errorTrainers, trainerProfiles,
  trainerProfilesPageInfo, trainerProfilesTotalCount, submittingMutation, mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('training', modulesManager);
  const classes = useStyles();
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const [toDelete, setToDelete] = useState(null);
  const [viewed, setViewed] = useState(null);
  const [params, setParams] = useState([]);
  const prev = useRef();

  const open = (t) => rights.includes(RIGHT_TRAINER_SEARCH) && history.push(
    `/${modulesManager.getRef(TRAINING_ROUTE_TRAINER)}/${t?.id}`,
  );

  useEffect(() => {
    if (toDelete) {
      coreConfirm(formatMessage('training.trainer.deleteDialog.title'),
        formatMessageWithValues('training.trainer.deleteDialog.message', { name: toDelete.fullName }));
    }
  }, [toDelete]);
  useEffect(() => {
    if (toDelete && confirmed) {
      deleteTrainerProfile(toDelete, formatMessageWithValues('training.trainer.delete.mutationLabel', { name: toDelete.fullName }));
      setToDelete(null);
    }
    if (confirmed !== null) setToDelete(null);
    return () => confirmed !== null && clearConfirm(false);
  }, [confirmed]);
  useEffect(() => {
    if (prev.current && !submittingMutation) { journalize(mutation); fetchTrainerProfiles(modulesManager, params); }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

    const headers = () => {
    const h = [
      'training.trainer.code', 'training.trainer.fullName', 'training.trainer.type',
      'training.trainer.organization', 'training.trainer.email', 'training.trainer.active',
    ];
    h.push('emptyLabel'); // view
    if (rights.includes(RIGHT_TRAINER_MANAGE)) {
      h.push('emptyLabel');
      h.push('emptyLabel'); 
    }
    h.push('emptyLabel'); 
    return h;
  };
  const fetch = (p) => { setParams(p); return fetchTrainerProfiles(modulesManager, p); };
  const itemFormatters = () => {
    const f = [
      (t) => t?.code,
      (t) => t?.fullName,
      (t) => formatMessage(`training.trainerType.${t?.trainerType}`),
      (t) => t?.organization,
      (t) => t?.email,
      (t) => (t?.isActive ? formatMessage('yes') : formatMessage('no')),
    ];
    f.push((t) => (
      <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
        <IconButton onClick={() => setViewed(t)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ));
    if (rights.includes(RIGHT_TRAINER_MANAGE)) {
      f.push((t) => (
        <Tooltip title={formatMessage('editButton.tooltip')}>
          <IconButton onClick={() => open(t)}><EditIcon /></IconButton>
        </Tooltip>
      ));
      f.push((t) => (
        <Tooltip title={formatMessage('deleteButton.tooltip')}>
          <IconButton onClick={() => setToDelete(t)}><DeleteIcon /></IconButton>
        </Tooltip>
      ));
    }
    f.push(() => '');
    return f;
  };

  return (
    <>
      <Dialog open={!!viewed} onClose={() => setViewed(null)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 0 } }}>
        <DialogContent style={{ padding: 0 }}>
          {viewed && <TrainerProfileCard trainer={viewed} />}
        </DialogContent>
        <DialogActions>
          {rights.includes(RIGHT_TRAINER_MANAGE) && (
            <Button color="primary" onClick={() => open(viewed)}>{formatMessage('training.edit')}</Button>
          )}
          <Button onClick={() => setViewed(null)}>{formatMessage('training.close')}</Button>
        </DialogActions>
      </Dialog>
      <div className={classes.searcher}>
        <Searcher
        module="training"
        FilterPane={({ filters, onChangeFilters }) => <Filter filters={filters} onChangeFilters={onChangeFilters} />}
        fetch={fetch}
        items={trainerProfiles}
        itemsPageInfo={trainerProfilesPageInfo}
        fetchedItems={fetchedTrainers}
        fetchingItems={fetchingTrainers}
        errorItems={errorTrainers}
        tableTitle={formatMessageWithValues('training.trainer.searcherResultsTitle', { trainerProfilesTotalCount })}
        headers={headers}
        itemFormatters={itemFormatters}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        rowIdentifier={(t) => t.id}
        onDoubleClick={(t) => setViewed(t)}
        />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  fetchingTrainers: state.training.fetchingTrainers,
  fetchedTrainers: state.training.fetchedTrainers,
  errorTrainers: state.training.errorTrainers,
  trainerProfiles: state.training.trainerProfiles,
  trainerProfilesPageInfo: state.training.trainerProfilesPageInfo,
  trainerProfilesTotalCount: state.training.trainerProfilesTotalCount,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
  confirmed: state.core.confirmed,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  { fetchTrainerProfiles, deleteTrainerProfile, journalize, coreConfirm, clearConfirm }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainerSearcher);
