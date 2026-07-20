import React from 'react';
import { injectIntl } from 'react-intl';
import { Divider, Grid, Typography } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  FormattedMessage, FormPanel, TextInput, withModulesManager,
} from '@openimis/fe-core';
import { TrainerTypePicker } from '../pickers/ConstantPickers';
import TrainerProfileCard from './TrainerProfileCard';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
});

class TrainerHeadPanel extends FormPanel {
  render() {
    const { edited, classes, readOnly } = this.props;
    const t = { ...edited };
    const isNew = !edited?.id; // code is server-assigned on create, so hide it until it exists
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
          <Grid item xs={5} className={classes.item}>
            <TextInput
              module="training" label="training.trainer.fullName" required readOnly={readOnly}
              value={t?.fullName} onChange={(v) => this.updateAttribute('fullName', v)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TrainerTypePicker
              readOnly={readOnly} value={t?.trainerType}
              onChange={(v) => this.updateAttribute('trainerType', v)}
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
            <TextInput
              module="training" label="training.trainer.organization" readOnly={readOnly}
              value={t?.organization} onChange={(v) => this.updateAttribute('organization', v)}
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
