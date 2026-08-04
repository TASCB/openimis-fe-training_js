/* eslint-disable import/prefer-default-export */
import React from 'react';
import {
  School, CalendarToday, Dashboard, People, AssignmentTurnedIn,
} from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';

import messages_en from './translations/en.json';
import reducer from './reducer';
import {
  RIGHT_TRAINING_SEARCH, RIGHT_TRAINER_SEARCH, RIGHT_DASHBOARD_VIEW, RIGHT_PARTICIPANT_SEARCH,
  TRAINING_ROUTE_TRAININGS, TRAINING_ROUTE_TRAINING, TRAINING_ROUTE_TRAINERS,
  TRAINING_ROUTE_TRAINER, TRAINING_ROUTE_CALENDAR, TRAINING_ROUTE_DASHBOARD, TRAINING_ROUTE_ATTENDANCE,
} from './constants';

import TrainingsPage from './pages/TrainingsPage';
import TrainingPage from './pages/TrainingPage';
import TrainerProfilesPage from './pages/TrainerProfilesPage';
import TrainerProfilePage from './pages/TrainerProfilePage';
import TrainingCalendarPage from './pages/TrainingCalendarPage';
import TrainingDashboardPage from './pages/TrainingDashboardPage';
import AttendancePage from './pages/AttendancePage';
import TrainingCheckinPublicPage from './pages/TrainingCheckinPublicPage';
import TrainerPicker from './pickers/TrainerPicker';
import TrainingCategoryPicker from './pickers/TrainingCategoryPicker';
import ParticipantCategoryPicker from './pickers/ParticipantCategoryPicker';
import JobTitlePicker from './pickers/JobTitlePicker';
import { TrainingStatusPicker } from './pickers/ConstantPickers';
import TimeInput from './components/TimeInput';

const ROUTE_TRAININGS = 'trainings';
const ROUTE_TRAINING = 'trainings/training';
const ROUTE_TRAINERS = 'trainings/trainers';
const ROUTE_TRAINER = 'trainings/trainers/trainer';
const ROUTE_CALENDAR = 'trainings/calendar';
const ROUTE_DASHBOARD = 'trainings/dashboard';
const ROUTE_ATTENDANCE = 'trainings/attendance';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'training', reducer }],
  refs: [
    { key: TRAINING_ROUTE_TRAININGS, ref: ROUTE_TRAININGS },
    { key: TRAINING_ROUTE_TRAINING, ref: ROUTE_TRAINING },
    { key: TRAINING_ROUTE_TRAINERS, ref: ROUTE_TRAINERS },
    { key: TRAINING_ROUTE_TRAINER, ref: ROUTE_TRAINER },
    { key: TRAINING_ROUTE_CALENDAR, ref: ROUTE_CALENDAR },
    { key: TRAINING_ROUTE_DASHBOARD, ref: ROUTE_DASHBOARD },
    { key: TRAINING_ROUTE_ATTENDANCE, ref: ROUTE_ATTENDANCE },
    { key: 'training.TrainerPicker', ref: TrainerPicker },
    { key: 'training.TrainingCategoryPicker', ref: TrainingCategoryPicker },
    { key: 'training.ParticipantCategoryPicker', ref: ParticipantCategoryPicker },
    { key: 'training.JobTitlePicker', ref: JobTitlePicker },
    { key: 'training.TrainingStatusPicker', ref: TrainingStatusPicker },
    { key: 'training.TimeInput', ref: TimeInput },
  ],
  'core.Router': [
    { path: ROUTE_TRAININGS, component: TrainingsPage },
    { path: `${ROUTE_TRAINING}/:training_uuid?`, component: TrainingPage },
    { path: ROUTE_TRAINERS, component: TrainerProfilesPage },
    { path: `${ROUTE_TRAINER}/:trainer_uuid?`, component: TrainerProfilePage },
    { path: ROUTE_CALENDAR, component: TrainingCalendarPage },
    { path: ROUTE_DASHBOARD, component: TrainingDashboardPage },
    { path: ROUTE_ATTENDANCE, component: AttendancePage },
  ],
  // PUBLIC (no login) self check-in page reached by scanning a session QR.
  'core.UnauthenticatedRouter': [
    { path: 'training/checkin/:token', component: TrainingCheckinPublicPage },
  ],
  'training.MainMenu': [
    {
      text: <FormattedMessage module="training" id="menu.trainings" />,
      icon: <School />,
      route: `/${ROUTE_TRAININGS}`,
      filter: (rights) => rights.includes(RIGHT_TRAINING_SEARCH),
      id: 'training.trainings',
    },
    {
      text: <FormattedMessage module="training" id="menu.calendar" />,
      icon: <CalendarToday />,
      route: `/${ROUTE_CALENDAR}`,
      filter: (rights) => rights.includes(RIGHT_DASHBOARD_VIEW),
      id: 'training.calendar',
    },
    {
      text: <FormattedMessage module="training" id="menu.trainers" />,
      icon: <People />,
      route: `/${ROUTE_TRAINERS}`,
      filter: (rights) => rights.includes(RIGHT_TRAINER_SEARCH),
      id: 'training.trainers',
    },
    {
      text: <FormattedMessage module="training" id="menu.attendance" />,
      icon: <AssignmentTurnedIn />,
      route: `/${ROUTE_ATTENDANCE}`,
      filter: (rights) => rights.includes(RIGHT_PARTICIPANT_SEARCH),
      id: 'training.attendance',
    },
    {
      text: <FormattedMessage module="training" id="menu.dashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_DASHBOARD_VIEW),
      id: 'training.dashboard',
    },
  ],
};

export const TrainingModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
