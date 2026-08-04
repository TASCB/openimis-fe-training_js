import React from 'react';
import { injectIntl } from 'react-intl';
import { Divider, Grid, Typography } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  FormattedMessage, FormPanel, PublishedComponent, TextInput, withModulesManager, formatMessage,
} from '@openimis/fe-core';
import { TrainerTypePicker, GenderPicker } from '../pickers/ConstantPickers';
import { INTERNAL_ORGANIZATION, TRAINER_TYPE_INTERNAL } from '../constants';
import JobTitlePicker from '../pickers/JobTitlePicker';
import { userDisplayName } from '../utils/users';
import TrainerProfileCard from './TrainerProfileCard';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
});

class TrainerHeadPanel extends FormPanel {
  // Clears the fields belonging to the mode being left, so a profile cannot keep a
  // stale system account or organization.
  onTypeChange = (trainerType) => {
    if (trainerType === TRAINER_TYPE_INTERNAL) {
      this.updateAttributes({ trainerType, organization: INTERNAL_ORGANIZATION });
    } else {
      this.updateAttributes({ trainerType, staffUser: null, organization: null });
    }
  };

  // The picker is the name field for internal trainers; full_name stays the stored name.
  onStaffUserChange = (staffUser) => this.updateAttributes({
    staffUser: staffUser ?? null,
    fullName: userDisplayName(staffUser),
    organization: INTERNAL_ORGANIZATION,
  });

  render() {
    const {
      edited, classes, readOnly, intl,
    } = this.props;
    const t = { ...edited };
    const isNew = !edited?.id; // code is server-assigned on create, so hide it until it exists
    const isInternal = (t?.trainerType ?? TRAINER_TYPE_INTERNAL) === TRAINER_TYPE_INTERNAL;
    if (readOnly) return <TrainerProfileCard trainer={edited} />;
    return (
      <>
        <Grid container className={classes.tableTitle}>
          <Grid item>
            <Typography>
              <FormattedMessage module="training" id="training.trainer.headPanel.title" />
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        <Grid container className={classes.item}>
          {!isNew && (
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module="training" label="training.trainer.code" readOnly
                value={t?.code} onChange={(v) => this.updateAttribute('code', v)}
              />
            </Grid>
          )}
          {/* Type decides how name and organization are captured. */}
          <Grid item xs={4} className={classes.item}>
            <TrainerTypePicker
              readOnly={readOnly} value={t?.trainerType ?? TRAINER_TYPE_INTERNAL}
              onChange={this.onTypeChange}
            />
          </Grid>
          <Grid item xs={5} className={classes.item}>
            {isInternal ? (
              <PublishedComponent
                pubRef="admin.UserPicker"
                module="training"
                label={formatMessage(intl, 'training', 'training.trainer.fullName')}
                required
                readOnly={readOnly}
                value={t?.staffUser}
                onChange={this.onStaffUserChange}
              />
            ) : (
              <TextInput
                module="training" label="training.trainer.fullName" required readOnly={readOnly}
                value={t?.fullName} onChange={(v) => this.updateAttribute('fullName', v)}
              />
            )}
          </Grid>
          <Grid item xs={3} className={classes.item}>
            {/* No label override: ConstantBasedPicker builds option keys from `label`. */}
            <GenderPicker
              withNull readOnly={readOnly}
              value={t?.gender} onChange={(v) => this.updateAttribute('gender', v)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            {/* From the RBAC catalogue, not typed, so titles stay comparable. */}
            <JobTitlePicker
              withLabel readOnly={readOnly}
              label={formatMessage(intl, 'training', 'training.trainer.position')}
              value={t?.position} onChange={(v) => this.updateAttribute('position', v)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="training" label="training.trainer.email" readOnly={readOnly}
              value={t?.email} onChange={(v) => this.updateAttribute('email', v)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="training" label="training.trainer.phone" readOnly={readOnly}
              value={t?.phone} onChange={(v) => this.updateAttribute('phone', v)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            {/* Internal trainers share one organization, so it is filled and locked. */}
            <TextInput
              module="training" label="training.trainer.organization"
              readOnly={readOnly || isInternal}
              value={isInternal ? INTERNAL_ORGANIZATION : (t?.organization ?? '')}
              onChange={(v) => this.updateAttribute('organization', v)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TextInput
              module="training" label="training.trainer.specialization" readOnly={readOnly}
              value={t?.specialization} onChange={(v) => this.updateAttribute('specialization', v)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TextInput
              module="training" label="training.trainer.bio" readOnly={readOnly}
              value={t?.bio} onChange={(v) => this.updateAttribute('bio', v)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(TrainerHeadPanel))));
