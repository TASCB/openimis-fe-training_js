import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Paper, Grid, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { RIGHT_MATERIAL_SEARCH, RIGHT_SESSION_SEARCH } from '../constants';
import TrainingAssignmentsPanel from './TrainingAssignmentsPanel';
import TrainingParticipantsPanel from './TrainingParticipantsPanel';
import TrainingSessionsPanel from './TrainingSessionsPanel';
import TrainingFilesPanel from './TrainingFilesPanel';


const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  tabs: { display: 'flex', alignItems: 'center' },
  selectedTab: { borderBottom: '4px solid white' },
  unselectedTab: { borderBottom: '4px solid transparent' },
  content: { padding: theme.spacing(1) },
}));


function TrainingTabs({
  trainingId, assignmentReadOnly, participantReadOnly, filesReadOnly, edited,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);

  const tabs = useMemo(() => [
    {
      key: 'assignments',
      label: 'training.assignments.title',
      render: () => (
        <TrainingAssignmentsPanel trainingId={trainingId} assignmentReadOnly={assignmentReadOnly} />
      ),
    },
    {
      key: 'participants',
      label: 'training.participants.title',
      render: () => (
        <TrainingParticipantsPanel
          trainingId={trainingId}
          participantReadOnly={participantReadOnly}
          levelCode={edited?.level?.code}
        />
      ),
    },
    ...(rights.includes(RIGHT_SESSION_SEARCH) ? [{
      key: 'sessions',
      label: 'training.sessions.title',
      render: () => (
        <TrainingSessionsPanel trainingId={trainingId} sessionsReadOnly={participantReadOnly} />
      ),
    }] : []),
    ...(rights.includes(RIGHT_MATERIAL_SEARCH) ? [{
      key: 'materials',
      label: 'training.materials.title',
      render: () => (
        <TrainingFilesPanel trainingId={trainingId} kind="material" filesReadOnly={filesReadOnly} />
      ),
    }] : []),
    {
      key: 'evidence',
      label: 'training.evidence.title',
      render: () => (
        <TrainingFilesPanel trainingId={trainingId} kind="evidence" filesReadOnly={filesReadOnly} />
      ),
    },
  ], [trainingId, rights, assignmentReadOnly, participantReadOnly, filesReadOnly]);

  const [active, setActive] = useState(0);
  const index = Math.min(active, tabs.length - 1);
  const current = tabs[index];

  return (
    <Paper className={classes.paper} style={{ marginTop: 8 }}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        {tabs.map((t, i) => (
          <Tab
            key={t.key}
            onClick={() => setActive(i)}
            selected={i === index}
            className={i === index ? classes.selectedTab : classes.unselectedTab}
            label={formatMessage(t.label)}
          />
        ))}
      </Grid>
      <div className={classes.content}>
        {current && current.render()}
      </div>
    </Paper>
  );
}

export default TrainingTabs;
