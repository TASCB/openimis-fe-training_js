/* eslint-disable default-param-last */
import {
  dispatchMutationErr,
  dispatchMutationReq,
  dispatchMutationResp,
  formatGraphQLError,
  formatServerError,
  pageInfo,
  parseData,
  decodeId,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

export const ACTION_TYPE = {
  MUTATION: 'TRAINING_MUTATION',
  SEARCH_TRAININGS: 'TRAINING_TRAININGS',
  GET_TRAINING: 'TRAINING_TRAINING',
  SEARCH_TRAINERS: 'TRAINING_TRAINERS',
  GET_TRAINER: 'TRAINING_TRAINER',
  SEARCH_CATEGORIES: 'TRAINING_CATEGORIES',
  SEARCH_ASSIGNMENTS: 'TRAINING_ASSIGNMENTS',
  SEARCH_PARTICIPANTS: 'TRAINING_PARTICIPANTS',
  SEARCH_ATTENDANCES: 'TRAINING_ATTENDANCES',
  SEARCH_MATERIALS: 'TRAINING_MATERIALS',
  SEARCH_EVIDENCE: 'TRAINING_EVIDENCE',
  GET_CONFLICTS: 'TRAINING_CONFLICTS',
  GET_SUMMARY: 'TRAINING_SUMMARY',
  GET_PAA: 'TRAINING_PAA_FOR_LOCATION',
  GET_CALENDAR: 'TRAINING_CALENDAR',
  GET_UNIFIED_CALENDAR: 'TRAINING_UNIFIED_CALENDAR',
  CREATE_TRAINING: 'TRAINING_CREATE_TRAINING',
  UPDATE_TRAINING: 'TRAINING_UPDATE_TRAINING',
  DELETE_TRAINING: 'TRAINING_DELETE_TRAINING',
  TRANSITION_TRAINING: 'TRAINING_TRANSITION_TRAINING',
  RESCHEDULE_TRAINING: 'TRAINING_RESCHEDULE_TRAINING',
  CREATE_TRAINER: 'TRAINING_CREATE_TRAINER',
  UPDATE_TRAINER: 'TRAINING_UPDATE_TRAINER',
  DELETE_TRAINER: 'TRAINING_DELETE_TRAINER',
  MANAGE_ASSIGNMENT: 'TRAINING_MANAGE_ASSIGNMENT',
  MANAGE_PARTICIPANT: 'TRAINING_MANAGE_PARTICIPANT',
  MANAGE_MATERIAL: 'TRAINING_MANAGE_MATERIAL',
  MANAGE_EVIDENCE: 'TRAINING_MANAGE_EVIDENCE',
  SEARCH_SESSIONS: 'TRAINING_SESSIONS',
  MANAGE_SESSION: 'TRAINING_MANAGE_SESSION',
  SESSION_CHECKIN_COUNT: 'TRAINING_SESSION_CHECKIN_COUNT',
};

export const MUTATION_SERVICE = {
  TRAINING: { CREATE: 'createTraining', UPDATE: 'updateTraining', DELETE: 'deleteTraining' },
  TRAINER: { CREATE: 'createTrainerProfile', UPDATE: 'updateTrainerProfile', DELETE: 'deleteTrainerProfile' },
};

const STORE_STATE = {
  submittingMutation: false,
  mutation: {},
  fetchingTrainings: false,
  fetchedTrainings: false,
  errorTrainings: null,
  trainings: [],
  trainingsPageInfo: {},
  trainingsTotalCount: 0,
  fetchingTraining: false,
  fetchedTraining: false,
  training: null,
  errorTraining: null,
  fetchingTrainers: false,
  fetchedTrainers: false,
  errorTrainers: null,
  trainerProfiles: [],
  trainerProfilesPageInfo: {},
  trainerProfilesTotalCount: 0,
  fetchingTrainer: false,
  fetchedTrainer: false,
  trainerProfile: null,
  errorTrainer: null,
  trainingCategories: [],
  fetchingCategories: false,
  fetchedCategories: false,
  trainingAssignments: [],
  fetchingAssignments: false,
  fetchedAssignments: false,
  trainingParticipants: [],
  fetchingParticipants: false,
  fetchedParticipants: false,
  trainingSessions: [],
  fetchingSessions: false,
  fetchedSessions: false,
  sessionCheckinCount: null,
  attendances: [],
  fetchingAttendances: false,
  fetchedAttendances: false,
  errorAttendances: null,
  attendancesPageInfo: {},
  attendancesTotalCount: 0,
  trainingMaterials: [],
  fetchingMaterials: false,
  fetchedMaterials: false,
  trainingEvidence: [],
  fetchingEvidence: false,
  fetchedEvidence: false,
  trainingConflicts: [],
  paaForLocation: null,
  fetchingConflicts: false,
  trainingSummary: null,
  fetchingSummary: false,
  errorSummary: null,
  trainingCalendar: [],
  fetchingCalendar: false,
  errorCalendar: null,
};

const mapList = (payload, key) => parseData(payload.data[key])?.map((x) => ({ ...x, id: decodeId(x.id) }));

function reducer(state = STORE_STATE, action) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.SEARCH_TRAININGS):
      return {
        ...state, fetchingTrainings: true, fetchedTrainings: false, trainings: [], errorTrainings: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_TRAININGS):
      return {
        ...state,
        fetchingTrainings: false,
        fetchedTrainings: true,
        trainings: mapList(action.payload, 'training'),
        trainingsPageInfo: pageInfo(action.payload.data.training),
        trainingsTotalCount: action.payload.data.training?.totalCount ?? 0,
        errorTrainings: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_TRAININGS):
      return { ...state, fetchingTrainings: false, errorTrainings: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_TRAINING):
      return {
        ...state, fetchingTraining: true, fetchedTraining: false, training: null, errorTraining: null,
      };
    case SUCCESS(ACTION_TYPE.GET_TRAINING):
      return {
        ...state,
        fetchingTraining: false,
        fetchedTraining: true,
        training: mapList(action.payload, 'training')?.[0],
        errorTraining: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_TRAINING):
      return { ...state, fetchingTraining: false, errorTraining: formatServerError(action.payload) };
    case CLEAR(ACTION_TYPE.GET_TRAINING):
      return {
        ...state, fetchingTraining: false, fetchedTraining: false, training: null, errorTraining: null,
      };

    case REQUEST(ACTION_TYPE.SEARCH_TRAINERS):
      return {
        ...state, fetchingTrainers: true, fetchedTrainers: false, trainerProfiles: [], errorTrainers: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_TRAINERS):
      return {
        ...state,
        fetchingTrainers: false,
        fetchedTrainers: true,
        trainerProfiles: mapList(action.payload, 'trainerProfile'),
        trainerProfilesPageInfo: pageInfo(action.payload.data.trainerProfile),
        trainerProfilesTotalCount: action.payload.data.trainerProfile?.totalCount ?? 0,
        errorTrainers: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_TRAINERS):
      return { ...state, fetchingTrainers: false, errorTrainers: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_TRAINER):
      return {
        ...state, fetchingTrainer: true, fetchedTrainer: false, trainerProfile: null, errorTrainer: null,
      };
    case SUCCESS(ACTION_TYPE.GET_TRAINER):
      return {
        ...state,
        fetchingTrainer: false,
        fetchedTrainer: true,
        trainerProfile: mapList(action.payload, 'trainerProfile')?.[0],
      };
    case ERROR(ACTION_TYPE.GET_TRAINER):
      return { ...state, fetchingTrainer: false, errorTrainer: formatServerError(action.payload) };
    case CLEAR(ACTION_TYPE.GET_TRAINER):
      return {
        ...state, fetchingTrainer: false, fetchedTrainer: false, trainerProfile: null,
      };

    case REQUEST(ACTION_TYPE.SEARCH_CATEGORIES):
      return { ...state, fetchingCategories: true, fetchedCategories: false };
    case SUCCESS(ACTION_TYPE.SEARCH_CATEGORIES):
      return {
        ...state,
        fetchingCategories: false,
        fetchedCategories: true,
        trainingCategories: mapList(action.payload, 'trainingCategory'),
      };
    case ERROR(ACTION_TYPE.SEARCH_CATEGORIES):
      return { ...state, fetchingCategories: false };

    case REQUEST(ACTION_TYPE.SEARCH_ASSIGNMENTS):
      return { ...state, fetchingAssignments: true, fetchedAssignments: false };
    case SUCCESS(ACTION_TYPE.SEARCH_ASSIGNMENTS):
      return {
        ...state,
        fetchingAssignments: false,
        fetchedAssignments: true,
        trainingAssignments: mapList(action.payload, 'trainingAssignment'),
      };
    case ERROR(ACTION_TYPE.SEARCH_ASSIGNMENTS):
      return { ...state, fetchingAssignments: false };

    case REQUEST(ACTION_TYPE.SEARCH_PARTICIPANTS):
      return { ...state, fetchingParticipants: true, fetchedParticipants: false };
    case SUCCESS(ACTION_TYPE.SEARCH_PARTICIPANTS):
      return {
        ...state,
        fetchingParticipants: false,
        fetchedParticipants: true,
        trainingParticipants: mapList(action.payload, 'trainingParticipant'),
      };
    case ERROR(ACTION_TYPE.SEARCH_PARTICIPANTS):
      return { ...state, fetchingParticipants: false };

    case REQUEST(ACTION_TYPE.SEARCH_SESSIONS):
      return { ...state, fetchingSessions: true, fetchedSessions: false };
    case SUCCESS(ACTION_TYPE.SEARCH_SESSIONS):
      return {
        ...state,
        fetchingSessions: false,
        fetchedSessions: true,
        trainingSessions: mapList(action.payload, 'trainingSession'),
      };
    case ERROR(ACTION_TYPE.SEARCH_SESSIONS):
      return { ...state, fetchingSessions: false };
    case SUCCESS(ACTION_TYPE.SESSION_CHECKIN_COUNT):
      return { ...state, sessionCheckinCount: action.payload.data.trainingParticipant?.totalCount ?? 0 };

    case REQUEST(ACTION_TYPE.SEARCH_ATTENDANCES):
      return {
        ...state, fetchingAttendances: true, fetchedAttendances: false, attendances: [], errorAttendances: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_ATTENDANCES):
      return {
        ...state,
        fetchingAttendances: false,
        fetchedAttendances: true,
        attendances: mapList(action.payload, 'trainingParticipant'),
        attendancesPageInfo: pageInfo(action.payload.data.trainingParticipant),
        attendancesTotalCount: action.payload.data.trainingParticipant?.totalCount ?? 0,
        errorAttendances: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_ATTENDANCES):
      return { ...state, fetchingAttendances: false, errorAttendances: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.SEARCH_MATERIALS):
      return { ...state, fetchingMaterials: true, fetchedMaterials: false };
    case SUCCESS(ACTION_TYPE.SEARCH_MATERIALS):
      return {
        ...state,
        fetchingMaterials: false,
        fetchedMaterials: true,
        trainingMaterials: mapList(action.payload, 'trainingMaterial'),
      };
    case ERROR(ACTION_TYPE.SEARCH_MATERIALS):
      return { ...state, fetchingMaterials: false };

    case REQUEST(ACTION_TYPE.SEARCH_EVIDENCE):
      return { ...state, fetchingEvidence: true, fetchedEvidence: false };
    case SUCCESS(ACTION_TYPE.SEARCH_EVIDENCE):
      return {
        ...state,
        fetchingEvidence: false,
        fetchedEvidence: true,
        trainingEvidence: mapList(action.payload, 'trainingEvidence'),
      };
    case ERROR(ACTION_TYPE.SEARCH_EVIDENCE):
      return { ...state, fetchingEvidence: false };

    case REQUEST(ACTION_TYPE.GET_CONFLICTS):
      return { ...state, fetchingConflicts: true };
    case SUCCESS(ACTION_TYPE.GET_CONFLICTS):
      return { ...state, fetchingConflicts: false, trainingConflicts: action.payload.data.trainingConflicts ?? [] };
    case ERROR(ACTION_TYPE.GET_CONFLICTS):
      return { ...state, fetchingConflicts: false, trainingConflicts: [] };
    case CLEAR(ACTION_TYPE.GET_CONFLICTS):
      return { ...state, trainingConflicts: [] };

    case REQUEST(ACTION_TYPE.GET_PAA):
      return { ...state, fetchingPaa: true };
    case SUCCESS(ACTION_TYPE.GET_PAA):
      return { ...state, fetchingPaa: false, paaForLocation: action.payload.data.paaForLocation ?? null };
    case ERROR(ACTION_TYPE.GET_PAA):
      return { ...state, fetchingPaa: false, paaForLocation: null };
    case CLEAR(ACTION_TYPE.GET_PAA):
      return { ...state, paaForLocation: null };

    case REQUEST(ACTION_TYPE.GET_SUMMARY):
      return { ...state, fetchingSummary: true, errorSummary: null };
    case SUCCESS(ACTION_TYPE.GET_SUMMARY):
      return {
        ...state,
        fetchingSummary: false,
        trainingSummary: action.payload.data.trainingSummary,
        errorSummary: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_SUMMARY):
      return { ...state, fetchingSummary: false, errorSummary: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_CALENDAR):
      return { ...state, fetchingCalendar: true, errorCalendar: null };
    case SUCCESS(ACTION_TYPE.GET_CALENDAR):
      return {
        ...state,
        fetchingCalendar: false,
        trainingCalendar: (action.payload.data.trainingCalendar ?? []).map((x) => ({ ...x, id: decodeId(x.id) })),
        errorCalendar: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_CALENDAR):
      return { ...state, fetchingCalendar: false, errorCalendar: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_UNIFIED_CALENDAR):
      return { ...state, fetchingCalendar: true, errorCalendar: null };
    case SUCCESS(ACTION_TYPE.GET_UNIFIED_CALENDAR):
      return {
        ...state,
        fetchingCalendar: false,
        trainingCalendar: action.payload.data.coordinationUnifiedCalendar ?? [],
        errorCalendar: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_UNIFIED_CALENDAR):
      return { ...state, fetchingCalendar: false, errorCalendar: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_TRAINING):
      return dispatchMutationResp(state, MUTATION_SERVICE.TRAINING.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_TRAINING):
      return dispatchMutationResp(state, MUTATION_SERVICE.TRAINING.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_TRAINING):
      return dispatchMutationResp(state, MUTATION_SERVICE.TRAINING.DELETE, action);
    case SUCCESS(ACTION_TYPE.TRANSITION_TRAINING):
      return dispatchMutationResp(state, action.meta?.serviceName ?? 'transition', action);
    case SUCCESS(ACTION_TYPE.RESCHEDULE_TRAINING):
      return dispatchMutationResp(state, 'rescheduleTraining', action);
    case SUCCESS(ACTION_TYPE.CREATE_TRAINER):
      return dispatchMutationResp(state, MUTATION_SERVICE.TRAINER.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_TRAINER):
      return dispatchMutationResp(state, MUTATION_SERVICE.TRAINER.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_TRAINER):
      return dispatchMutationResp(state, MUTATION_SERVICE.TRAINER.DELETE, action);
    case SUCCESS(ACTION_TYPE.MANAGE_ASSIGNMENT):
      return dispatchMutationResp(state, action.meta?.serviceName ?? 'assignment', action);
    case SUCCESS(ACTION_TYPE.MANAGE_PARTICIPANT):
      return dispatchMutationResp(state, action.meta?.serviceName ?? 'participant', action);
    case SUCCESS(ACTION_TYPE.MANAGE_MATERIAL):
      return dispatchMutationResp(state, action.meta?.serviceName ?? 'material', action);
    case SUCCESS(ACTION_TYPE.MANAGE_EVIDENCE):
      return dispatchMutationResp(state, action.meta?.serviceName ?? 'evidence', action);
    default:
      return state;
  }
}

export default reducer;
