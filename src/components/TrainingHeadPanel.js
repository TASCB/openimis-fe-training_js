import React from 'react';
import { injectIntl } from 'react-intl';
import { Divider, Grid, Typography } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  FormattedMessage, FormPanel, PublishedComponent, TextInput, NumberInput, withModulesManager,
  formatMessage,
} from '@openimis/fe-core';
import { TrainingStatusPicker } from '../pickers/ConstantPickers';
import TrainingCategoryPicker from '../pickers/TrainingCategoryPicker';
import TrainingProfileCard from './TrainingProfileCard';
import StringListInput from './StringListInput';
import PaaLocationInput from './PaaLocationInput';
import PaaReadout from './PaaReadout';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: { height: '100%' },
});

class TrainingHeadPanel extends FormPanel {
  render() {
    const {
      edited, classes, readOnly, intl,
    } = this.props;
    const t = { ...edited };
    if (readOnly) return <TrainingProfileCard training={edited} />;
    return (
      <>
        <Grid container className={classes.tableTitle}>
          <Grid item>
            <Typography>
              <FormattedMessage module="training" id="training.headPanel.title" />
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        <Grid container className={classes.item}>
          {t?.code && (
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module="training"
                label="training.code"
                readOnly
                value={t.code}
                onChange={(v) => this.updateAttribute('code', v)}
              />
            </Grid>
          )}
          <Grid item xs={t?.code ? 5 : 6} className={classes.item}>
            <TextInput
              module="training"
              label="training.title"
              required
              readOnly={readOnly}
              value={t?.title}
              onChange={(v) => this.updateAttribute('title', v)}
            />
          </Grid>
          <Grid item xs={t?.code ? 4 : 6} className={classes.item}>
            <TrainingCategoryPicker
              withLabel
              readOnly={readOnly}
              value={t?.category}
              onChange={(v) => this.updateAttributes({ category: v, categoryId: v?.id ?? null })}
            />
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <TextInput
              module="training"
              label="training.description"
              readOnly={readOnly}
              value={t?.description}
              onChange={(v) => this.updateAttribute('description', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="training"
              label="training.startDatetime"
              required
              readOnly={readOnly}
              value={t?.startDatetime}
              onChange={(v) => this.updateAttribute('startDatetime', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="training"
              label="training.endDatetime"
              required
              readOnly={readOnly}
              value={t?.endDatetime}
              onChange={(v) => this.updateAttribute('endDatetime', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="training"
              label="training.venue"
              readOnly={readOnly}
              value={t?.venue}
              onChange={(v) => this.updateAttribute('venue', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <NumberInput
              module="training"
              label="training.expectedParticipants"
              min={0}
              allowDecimals={false}
              readOnly={readOnly}
              value={t?.expectedParticipants}
              onChange={(v) => this.updateAttribute('expectedParticipants', v ?? null)}
            />
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Typography variant="caption" color="textSecondary">
              <FormattedMessage module="training" id="training.paaLocation" />
            </Typography>
            <PaaLocationInput
              readOnly={readOnly}
              value={t?.location}
              onChange={(v) => this.updateAttributes({ location: v, locationId: v?.id ?? null })}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TrainingStatusPicker
              required
              readOnly
              withNull={false}
              label="training.status"
              value={t?.status}
              onChange={(v) => this.updateAttribute('status', v)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <PaaReadout location={t?.location} />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <StringListInput
              label={formatMessage(intl, 'training', 'training.learningOutcomes')}
              placeholder={formatMessage(intl, 'training', 'training.learningOutcomes.placeholder')}
              readOnly={readOnly}
              value={t?.learningOutcomes}
              onChange={(v) => this.updateAttribute('learningOutcomes', v)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <StringListInput
              label={formatMessage(intl, 'training', 'training.intendedFor')}
              placeholder={formatMessage(intl, 'training', 'training.intendedFor.placeholder')}
              readOnly={readOnly}
              value={t?.intendedFor}
              onChange={(v) => this.updateAttribute('intendedFor', v)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(TrainingHeadPanel))));
