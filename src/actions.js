import {
  graphql, formatMutation, formatPageQueryWithCount, graphqlWithVariables, baseApiUrl,
  decodeId,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';
import { ACTION_TYPE } from './reducer';
import { toISO } from './utils/dates';

// Mirrors admin.UserPicker's own projection, so a stored link renders in the picker
// instead of coming back blank.
const USER_PROJECTION = 'id username iUser { id otherNames lastName }';

// FlatProjection: the PAA cascade needs the location's ancestors, not just `{ id code name }`.
const TRAINING_LIST_PROJECTION = (mm) => [
  'id', 'code', 'title', 'status', 'startDatetime', 'endDatetime', 'venue',
  'expectedParticipants', 'paaReference', 'description',
  'learningOutcomes', 'intendedFor',
  'category { id code name }', `location${mm.getProjection('location.Location.FlatProjection')}`,
  'dateCreated', 'dateUpdated', 'userCreated { username }', 'userUpdated { username }', 'version',
];

const TRAINING_FULL_PROJECTION = (mm) => [
  ...TRAINING_LIST_PROJECTION(mm),
  'jsonExt',
];

const TRAINER_PROJECTION = () => [
  'id', 'code', 'fullName', 'gender', 'position { id code name userGroup { id code name } }',
  'email', 'phone', 'organization', 'trainerType',
  'specialization', 'bio', 'isActive', `staffUser { ${USER_PROJECTION} }`, 'version',
];

const CATEGORY_PROJECTION = () => ['id', 'code', 'name', 'description', 'isActive'];

const ASSIGNMENT_PROJECTION = () => [
  'id', 'role', 'status', 'notes', 'training { id }',
  'trainer { id code fullName }', `staffUser { ${USER_PROJECTION} }`,
];

const PARTICIPANT_PROJECTION = () => [
  'id', 'fullName', 'gender', 'phone', 'email', 'organization', 'title',
  'category { id code name }', 'attendanceStatus', 'attendanceRemarks', 'session { id title }',
  'location { id name }', 'paaReference', `internalUser { ${USER_PROJECTION} }`,
];

const ATTENDANCE_PROJECTION = () => [
  'id', 'fullName', 'gender', 'phone', 'organization', 'category { id code name }',
  'attendanceStatus', 'attendanceRemarks', 'location { id name }', 'paaReference',
  'training { id code title startDatetime }',
];

const FILE_PROJECTION = () => [
  'id', 'fileName', 'fileType', 'description', 'fileUrl', 'dateCreated', 'userCreated { username }',
];

// JSON.stringify (not fe-core formatGQLString, which double-escapes `"` and
// truncates the query).
const str = (k, v) => (v !== undefined && v !== null && v !== '' ? `${k}: ${JSON.stringify(String(v))}` : '');
const raw = (k, v) => (v !== undefined && v !== null && v !== '' ? `${k}: ${v}` : '');
const list = (k, v) => (Array.isArray(v) && v.length ? `${k}: [${v.map((x) => `"${x}"`).join(',')}]` : '');
// like list() but emits `[]` for empty arrays so the field can be cleared on update
const strList = (k, v) => (Array.isArray(v) ? `${k}: [${v.map((x) => JSON.stringify(String(x))).join(',')}]` : '');

// Pickers/nested objects expose ids as relay global ids (base64 "Type:pk").
// MUTATION inputs (graphene UUID/Int) need the raw pk → decode.
export const decId = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v);
  if (/^\d+$/.test(s)) return s; // plain integer pk (e.g. Location)
  if (/^[0-9a-f-]{36}$/i.test(s)) return s; // plain UUID
  try { return decodeId(s); } catch (e) { return s; }
};

// Connection-field FK FILTERS are graphene-django GlobalIDFilters → they need the
// encoded relay global id. Encode a raw uuid; pass through if already encoded.
export const encId = (typeName, v) => {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v);
  if (/^[0-9a-f-]{36}$/i.test(s)) return btoa(`${typeName}:${s}`);
  return s; // already a relay global id
};

export function fetchTrainings(modulesManager, params) {
  const payload = formatPageQueryWithCount('training', params, TRAINING_LIST_PROJECTION(modulesManager));
  return graphql(payload, ACTION_TYPE.SEARCH_TRAININGS);
}

export function fetchTraining(modulesManager, params) {
  const payload = formatPageQueryWithCount('training', params, TRAINING_FULL_PROJECTION(modulesManager));
  return graphql(payload, ACTION_TYPE.GET_TRAINING);
}

export const clearTraining = () => (dispatch) => dispatch({ type: CLEAR(ACTION_TYPE.GET_TRAINING) });

function formatTrainingGQL(t, includeCode = true) {
  return [
    str('id', t?.id),
    includeCode ? str('code', t?.code) : null,
    str('title', t?.title),
    str('description', t?.description),
    str('categoryId', decId(t?.categoryId ?? t?.category?.id)),
    str('startDatetime', toISO(t?.startDatetime)),
    str('endDatetime', toISO(t?.endDatetime, true)),
    str('venue', t?.venue),
    raw('locationId', decId(t?.locationId ?? t?.location?.id)),
    str('paaReference', t?.paaReference),
    raw('status', t?.status),
    raw('expectedParticipants', t?.expectedParticipants),
    strList('learningOutcomes', t?.learningOutcomes),
    strList('intendedFor', t?.intendedFor),
    raw('ignoreConflicts', t?.ignoreConflicts),
    list('conflictTrainerIds', t?.conflictTrainerIds),
    list('conflictStaffUserIds', t?.conflictStaffUserIds),
  ].filter(Boolean).join('\n');
}

export function createTraining(training, clientMutationLabel) {
  const mutation = formatMutation('createTraining', formatTrainingGQL(training, false), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_TRAINING), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function updateTraining(training, clientMutationLabel) {
  const mutation = formatMutation('updateTraining', formatTrainingGQL(training, true), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_TRAINING), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function deleteTraining(training, clientMutationLabel) {
  const mutation = formatMutation('deleteTraining', list('ids', [training.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_TRAINING), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function transitionTraining(action, training, clientMutationLabel, reason = null) {
  const serviceName = `${action}Training`;
  const input = [str('id', training.id), str('reason', reason)].filter(Boolean).join('\n');
  const mutation = formatMutation(serviceName, input, clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.TRANSITION_TRAINING), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName, requestedDateTime: new Date(),
    },
  );
}

export function rescheduleTraining(training, { startDatetime, endDatetime, reason }, clientMutationLabel) {
  const input = [
    str('id', training.id),
    str('startDatetime', toISO(startDatetime)),
    str('endDatetime', toISO(endDatetime, true)),
    str('reason', reason),
  ].filter(Boolean).join('\n');
  const mutation = formatMutation('rescheduleTraining', input, clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.RESCHEDULE_TRAINING), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      serviceName: 'rescheduleTraining',
      requestedDateTime: new Date(),
    },
  );
}

export function fetchTrainerProfiles(modulesManager, params) {
  const payload = formatPageQueryWithCount('trainerProfile', params, TRAINER_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_TRAINERS);
}

export function fetchTrainerProfile(modulesManager, params) {
  const payload = formatPageQueryWithCount('trainerProfile', params, TRAINER_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_TRAINER);
}

export const clearTrainerProfile = () => (dispatch) => dispatch({ type: CLEAR(ACTION_TYPE.GET_TRAINER) });

function formatTrainerGQL(t) {
  return [
    str('id', t?.id),
    str('code', t?.code),
    str('fullName', t?.fullName),
    raw('gender', t?.gender), // GenderInput enum — must go unquoted
    str('positionId', decId(t?.positionId ?? t?.position?.id)),
    str('email', t?.email),
    str('phone', t?.phone),
    str('organization', t?.organization),
    raw('trainerType', t?.trainerType),
    str('specialization', t?.specialization),
    str('bio', t?.bio),
    str('staffUserId', decId(t?.staffUserId ?? t?.staffUser?.id)),
    raw('isActive', t?.isActive),
  ].filter(Boolean).join('\n');
}

export function createTrainerProfile(trainer, clientMutationLabel) {
  const mutation = formatMutation('createTrainerProfile', formatTrainerGQL(trainer), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_TRAINER), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function updateTrainerProfile(trainer, clientMutationLabel) {
  const mutation = formatMutation('updateTrainerProfile', formatTrainerGQL(trainer), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_TRAINER), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function deleteTrainerProfile(trainer, clientMutationLabel) {
  const mutation = formatMutation('deleteTrainerProfile', list('ids', [trainer.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_TRAINER), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function fetchTrainingCategories(modulesManager, params = ['first: 100', 'isActive: true']) {
  const payload = formatPageQueryWithCount('trainingCategory', params, CATEGORY_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_CATEGORIES);
}

export function fetchTrainingAssignments(trainingId) {
  const payload = formatPageQueryWithCount('trainingAssignment', [`trainingId: "${encId('TrainingGQLType', trainingId)}"`, 'first: 100'], ASSIGNMENT_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_ASSIGNMENTS);
}

function formatAssignmentGQL(a) {
  return [
    str('id', a?.id),
    str('trainingId', a?.trainingId),
    str('trainerId', decId(a?.trainerId ?? a?.trainer?.id)),
    str('staffUserId', decId(a?.staffUserId ?? a?.staffUser?.id)),
    raw('role', a?.role),
    raw('status', a?.status),
    str('notes', a?.notes),
  ].filter(Boolean).join('\n');
}

export function saveTrainingAssignment(a, clientMutationLabel) {
  const serviceName = a.id ? 'updateTrainingAssignment' : 'createTrainingAssignment';
  const mutation = formatMutation(serviceName, formatAssignmentGQL(a), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_ASSIGNMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName, requestedDateTime: new Date(),
    },
  );
}

export function deleteTrainingAssignment(a, clientMutationLabel) {
  const mutation = formatMutation('deleteTrainingAssignment', list('ids', [a.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_ASSIGNMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName: 'deleteTrainingAssignment', requestedDateTime: new Date(),
    },
  );
}

export function fetchTrainingParticipants(trainingId) {
  const payload = formatPageQueryWithCount('trainingParticipant', [`trainingId: "${encId('TrainingGQLType', trainingId)}"`, 'first: 100'], PARTICIPANT_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_PARTICIPANTS);
}

// Standalone attendance list (paginated + filterable Searcher).
export function fetchAttendances(modulesManager, params) {
  const payload = formatPageQueryWithCount('trainingParticipant', params, ATTENDANCE_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_ATTENDANCES);
}

function formatParticipantGQL(p) {
  return [
    str('id', p?.id),
    str('trainingId', p?.trainingId),
    str('sessionId', decId(p?.sessionId ?? p?.session?.id)),
    str('fullName', p?.fullName),
    raw('gender', p?.gender), // GenderInput enum — must go unquoted
    str('phone', p?.phone),
    str('email', p?.email),
    str('organization', p?.organization),
    str('title', p?.title),
    str('categoryId', decId(p?.categoryId ?? p?.category?.id)),
    str('internalUserId', decId(p?.internalUserId ?? p?.internalUser?.id)),
    raw('locationId', decId(p?.locationId ?? p?.location?.id)),
    raw('attendanceStatus', p?.attendanceStatus),
    str('attendanceRemarks', p?.attendanceRemarks),
  ].filter(Boolean).join('\n');
}

export function saveTrainingParticipant(p, clientMutationLabel) {
  const serviceName = p.id ? 'updateTrainingParticipant' : 'createTrainingParticipant';
  const mutation = formatMutation(serviceName, formatParticipantGQL(p), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_PARTICIPANT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName, requestedDateTime: new Date(),
    },
  );
}

export function deleteTrainingParticipant(p, clientMutationLabel) {
  const mutation = formatMutation('deleteTrainingParticipant', list('ids', [p.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_PARTICIPANT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName: 'deleteTrainingParticipant', requestedDateTime: new Date(),
    },
  );
}

// ── Training sessions (per-day + QR self check-in) ──
const SESSION_PROJECTION = () => [
  'id', 'title', 'sessionDate', 'startTime', 'endTime', 'sequence', 'venue',
  'registrationToken', 'registrationOpen', 'checkinOpen',
];

function formatSessionGQL(s) {
  return [
    str('id', s?.id),
    str('trainingId', s?.trainingId),
    str('title', s?.title),
    raw('sessionDate', s?.sessionDate ? `"${s.sessionDate}"` : ''),
    raw('startTime', s?.startTime ? `"${s.startTime}"` : ''),
    raw('endTime', s?.endTime ? `"${s.endTime}"` : ''),
    raw('sequence', s?.sequence),
    str('venue', s?.venue),
    raw('registrationOpen', s?.registrationOpen === undefined ? '' : (s.registrationOpen ? 'true' : 'false')),
  ].filter(Boolean).join('\n');
}

export function fetchTrainingSessions(trainingId) {
  const payload = formatPageQueryWithCount('trainingSession', [`trainingId: "${encId('TrainingGQLType', trainingId)}"`, 'first: 100', 'orderBy: "sequence"'], SESSION_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_SESSIONS);
}

export function saveTrainingSession(s, clientMutationLabel) {
  const serviceName = s.id ? 'updateTrainingSession' : 'createTrainingSession';
  const mutation = formatMutation(serviceName, formatSessionGQL(s), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_SESSION), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName, requestedDateTime: new Date(),
    },
  );
}

export function deleteTrainingSession(s, clientMutationLabel) {
  const mutation = formatMutation('deleteTrainingSession', list('ids', [s.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_SESSION), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName: 'deleteTrainingSession', requestedDateTime: new Date(),
    },
  );
}

export function fetchSessionCheckinCount(sessionId) {
  const payload = formatPageQueryWithCount('trainingParticipant', [`sessionId: "${encId('TrainingSessionGQLType', sessionId)}"`, 'first: 1'], ['id']);
  return graphql(payload, ACTION_TYPE.SESSION_CHECKIN_COUNT);
}

export function fetchTrainingMaterials(trainingId) {
  const payload = formatPageQueryWithCount('trainingMaterial', [`trainingId: "${encId('TrainingGQLType', trainingId)}"`, 'first: 100'], FILE_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_MATERIALS);
}

export function fetchTrainingEvidence(trainingId) {
  const payload = formatPageQueryWithCount('trainingEvidence', [`trainingId: "${encId('TrainingGQLType', trainingId)}"`, 'first: 100'], ['evidenceType', ...FILE_PROJECTION()]);
  return graphql(payload, ACTION_TYPE.SEARCH_EVIDENCE);
}

export function deleteTrainingMaterial(m, clientMutationLabel) {
  const mutation = formatMutation('deleteTrainingMaterial', list('ids', [m.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_MATERIAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName: 'deleteTrainingMaterial', requestedDateTime: new Date(),
    },
  );
}

export function deleteTrainingEvidence(e, clientMutationLabel) {
  const mutation = formatMutation('deleteTrainingEvidence', list('ids', [e.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_EVIDENCE), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName: 'deleteTrainingEvidence', requestedDateTime: new Date(),
    },
  );
}

function uploadFile(path, { trainingId, file, description, evidenceType }) {
  const form = new FormData();
  form.append('training_id', trainingId);
  form.append('file', file);
  if (description) form.append('description', description);
  if (evidenceType) form.append('evidence_type', evidenceType);
  return fetch(`${baseApiUrl}${path}`, { method: 'POST', body: form, credentials: 'include' })
    .then((res) => res.json());
}

export const uploadTrainingMaterial = (args) => uploadFile('/training/materials/upload/', args);
export const uploadTrainingEvidence = (args) => uploadFile('/training/evidence/upload/', args);

// Resolved by the backend: the Zanzibar mapping is configurable in api_etl, not duplicated here.
export function fetchPaaForLocation(locationId) {
  return graphqlWithVariables(
    'query ($locationId: Int!) { paaForLocation(locationId: $locationId) }',
    { locationId },
    ACTION_TYPE.GET_PAA,
  );
}

export const clearPaaForLocation = () => (dispatch) => dispatch({ type: CLEAR(ACTION_TYPE.GET_PAA) });

export function fetchTrainingConflicts(variables) {
  return graphqlWithVariables(
    `query ($startDatetime: DateTime!, $endDatetime: DateTime!, $trainingId: UUID, $venue: String,
            $locationId: Int, $trainerIds: [UUID], $staffUserIds: [UUID]) {
      trainingConflicts(startDatetime: $startDatetime, endDatetime: $endDatetime, trainingId: $trainingId,
        venue: $venue, locationId: $locationId, trainerIds: $trainerIds, staffUserIds: $staffUserIds) {
        type hard message conflictingTrainingId conflictingTrainingCode subjectId subjectLabel
      }
    }`,
    variables,
    ACTION_TYPE.GET_CONFLICTS,
  );
}

export const clearTrainingConflicts = () => (dispatch) => dispatch({ type: CLEAR(ACTION_TYPE.GET_CONFLICTS) });

export function fetchTrainingSummary(variables = {}) {
  return graphqlWithVariables(
    `query ($dateFrom: DateTime, $dateTo: DateTime, $locationId: Int) {
      trainingSummary(dateFrom: $dateFrom, dateTo: $dateTo, locationId: $locationId) {
        totalTrainings trainingsThisWeek upcomingTrainings ongoingTrainings
        completedTrainings cancelledTrainings activeTrainers
        byStatus { status count }
        byCategory { categoryId categoryName count }
      }
    }`,
    variables,
    ACTION_TYPE.GET_SUMMARY,
  );
}

export function fetchTrainingCalendar(variables) {
  return graphqlWithVariables(
    `query ($dateFrom: DateTime!, $dateTo: DateTime!, $status: String, $categoryId: UUID,
            $locationId: Int, $trainerId: UUID) {
      trainingCalendar(dateFrom: $dateFrom, dateTo: $dateTo, status: $status, categoryId: $categoryId,
        locationId: $locationId, trainerId: $trainerId) {
        id code title status startDatetime endDatetime venue
      }
    }`,
    variables,
    ACTION_TYPE.GET_CALENDAR,
  );
}
