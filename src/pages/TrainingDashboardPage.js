import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Grid, Box } from '@material-ui/core';
import {
  Helmet, useTranslations, useModulesManager, ProgressOrError,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';
import { fetchTrainingSummary } from '../actions';
import {
  DashboardHeader, StatCard, SectionCard, Breakdown, RankedList,
} from '../components/DashboardKit';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function TrainingDashboardPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const summary = useSelector((s) => s.training.trainingSummary);
  const fetching = useSelector((s) => s.training.fetchingSummary);
  const error = useSelector((s) => s.training.errorSummary);
  const [refreshedAt, setRefreshedAt] = useState(null);

  const refresh = () => { dispatch(fetchTrainingSummary({})); setRefreshedAt(new Date()); };
  useEffect(() => { refresh(); }, []);

  const t = (k) => formatMessage(k);
  const empty = t('training.dashboard.empty');

  const primary = [
    ['training.dashboard.total', summary?.totalTrainings],
    ['training.dashboard.thisWeek', summary?.trainingsThisWeek],
    ['training.dashboard.upcoming', summary?.upcomingTrainings],
    ['training.dashboard.ongoing', summary?.ongoingTrainings],
  ];
  const secondary = [
    ['training.dashboard.completed', summary?.completedTrainings],
    ['training.dashboard.cancelled', summary?.cancelledTrainings],
    ['training.dashboard.activeTrainers', summary?.activeTrainers],
  ];

  const byStatus = (summary?.byStatus ?? []).map((r) => ({
    key: r.status, label: t(`training.status.${r.status}`), value: r.count,
  }));
  const byCategory = (summary?.byCategory ?? []).map((r) => ({
    key: r.categoryId ?? 'none', label: r.categoryName ?? t('training.dashboard.noCategory'), value: r.count,
  }));

  return (
    <div className={classes.page}>
      <Helmet title={t('training.dashboard.page.title')} />
      <DashboardHeader
        title={t('training.dashboard.page.title')}
        subtitle={t('training.dashboard.subtitle')}
        refreshedLabel={refreshedAt ? `${t('training.dashboard.lastRefreshed')} · ${refreshedAt.toLocaleString([], { hour: '2-digit', minute: '2-digit' })}` : null}
        onRefresh={refresh}
        refreshing={fetching}
        refreshTooltip={t('training.dashboard.refresh')}
      />

      <ProgressOrError progress={fetching && !summary} error={error} />

      {!error && (
        <>
          <Grid container spacing={3}>
            {primary.map(([l, v]) => (
              <Grid item xs={6} md={3} key={l}>
                <StatCard primary label={t(l)} value={v} />
              </Grid>
            ))}
          </Grid>

          <Box mt={2}>
            <Grid container spacing={2}>
              {secondary.map(([l, v]) => (
                <Grid item xs={6} sm={4} key={l}>
                  <StatCard label={t(l)} value={v} />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SectionCard title={t('training.dashboard.byStatus')}>
                  <Breakdown items={byStatus} emptyText={empty} />
                </SectionCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SectionCard title={t('training.dashboard.byCategory')}>
                  <RankedList items={byCategory} emptyText={empty} />
                </SectionCard>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </div>
  );
}

export default TrainingDashboardPage;
