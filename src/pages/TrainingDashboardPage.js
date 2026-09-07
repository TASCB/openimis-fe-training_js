import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Grid, Box } from '@material-ui/core';
import {
  Helmet, useTranslations, useModulesManager, ProgressOrError, useHistory,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';
import { fetchTrainingSummary } from '../actions';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import CategoryIcon from '@material-ui/icons/Category';
import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';
import CheckIcon from '@material-ui/icons/Check';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import EventIcon from '@material-ui/icons/Event';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import BlockIcon from '@material-ui/icons/Block';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import {
  DashboardHeader, StatCard, SectionCard, PipelineFlow, RankedList,
} from '@openimis/fe-tasaf_common';

const STATUS_FLOW = [
  ['DRAFT', <EditIcon />], ['SUBMITTED', <SendIcon />], ['APPROVED', <CheckIcon />],
  ['REJECTED', <HighlightOffIcon />], ['SCHEDULED', <EventIcon />],
  ['ONGOING', <PlayCircleOutlineIcon />], ['COMPLETED', <DoneAllIcon />],
  ['CANCELLED', <BlockIcon />], ['CLOSED', <LockOutlinedIcon />],
];

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

  const history = useHistory();
  const goTrainings = () => history.push('/trainings');
  const goTrainers = () => history.push('/trainings/trainers');

  const cards = [
    ['training.dashboard.total', summary?.totalTrainings, goTrainings],
    ['training.dashboard.thisWeek', summary?.trainingsThisWeek, goTrainings],
    ['training.dashboard.upcoming', summary?.upcomingTrainings, goTrainings],
    ['training.dashboard.ongoing', summary?.ongoingTrainings, goTrainings],
    ['training.dashboard.completed', summary?.completedTrainings, goTrainings],
    ['training.dashboard.cancelled', summary?.cancelledTrainings, goTrainings],
    ['training.dashboard.activeTrainers', summary?.activeTrainers, goTrainers],
  ];

  const counts = Object.fromEntries((summary?.byStatus ?? []).map((r) => [r.status, r.count]));
  const statusStages = STATUS_FLOW.map(([code, icon]) => ({
    key: code, icon, label: t(`training.status.${code}`), value: counts[code] ?? 0,
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
            {cards.map(([l, v, onClick]) => (
              <Grid item xs={12} sm={6} md={3} key={l}>
                <StatCard label={t(l)} value={v} caption={t(`${l}.caption`)} onClick={onClick} />
              </Grid>
            ))}
          </Grid>

          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SectionCard title={t('training.dashboard.byStatus')} icon={<DonutLargeIcon />}>
                  <PipelineFlow stages={statusStages} emptyText={empty} />
                </SectionCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SectionCard title={t('training.dashboard.byCategory')} icon={<CategoryIcon />}>
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
