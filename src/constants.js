export const MODULE_NAME = 'training';

export const RIGHT_TRAINING_SEARCH = 210101;
export const RIGHT_TRAINING_CREATE = 210102;
export const RIGHT_TRAINING_UPDATE = 210103;
export const RIGHT_TRAINING_DELETE = 210104;
export const RIGHT_TRAINING_APPROVE = 210110;
export const RIGHT_TRAINER_SEARCH = 210301;
export const RIGHT_TRAINER_MANAGE = 210302;
export const RIGHT_ASSIGNMENT_MANAGE = 210402;
export const RIGHT_MATERIAL_SEARCH = 210501;
export const RIGHT_MATERIAL_UPLOAD = 210502;
export const RIGHT_DASHBOARD_VIEW = 210601;
export const RIGHT_PARTICIPANT_SEARCH = 210701;
export const RIGHT_PARTICIPANT_MANAGE = 210702;
export const RIGHT_EVIDENCE_UPLOAD = 210802;
export const RIGHT_SESSION_SEARCH = 210901;
export const RIGHT_SESSION_CREATE = 210902;
export const RIGHT_SESSION_UPDATE = 210903;
export const RIGHT_SESSION_DELETE = 210904;

export const TRAINING_ROUTE_TRAININGS = 'training.route.trainings';
export const TRAINING_ROUTE_TRAINING = 'training.route.training';
export const TRAINING_ROUTE_TRAINERS = 'training.route.trainers';
export const TRAINING_ROUTE_TRAINER = 'training.route.trainer';
export const TRAINING_ROUTE_CALENDAR = 'training.route.calendar';
export const TRAINING_ROUTE_DASHBOARD = 'training.route.dashboard';
export const TRAINING_ROUTE_ATTENDANCE = 'training.route.attendance';

export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const CONTAINS_LOOKUP = 'Icontains';
export const EMPTY_STRING = '';
export const PICKER_LIMIT = 50;

export const TRAINING_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SCHEDULED: 'SCHEDULED',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
};
export const TRAINING_STATUS_LIST = Object.values(TRAINING_STATUS);

export const STATUS_COLORS = {
  DRAFT: '#9e9e9e',
  SUBMITTED: '#1976d2',
  APPROVED: '#0288d1',
  REJECTED: '#d32f2f',
  SCHEDULED: '#7b1fa2',
  ONGOING: '#ed6c02',
  COMPLETED: '#2e7d32',
  CANCELLED: '#c62828',
  CLOSED: '#455a64',
};

export const TRAINER_TYPE_LIST = ['INTERNAL', 'EXTERNAL'];

export const ASSIGNMENT_ROLE_LIST = [
  'LEAD_TRAINER', 'ASSISTANT_TRAINER', 'FACILITATOR', 'COORDINATOR', 'OBSERVER', 'SUPPORT_STAFF',
];
export const ASSIGNMENT_STATUS_LIST = ['ASSIGNED', 'CONFIRMED', 'DECLINED', 'REPLACED', 'CANCELLED'];

export const PARTICIPANT_TYPE_LIST = [
  'TASAF_STAFF', 'PAA_REP', 'CMC_MEMBER', 'LGA_OFFICER', 'ENUMERATOR',
  'SUPERVISOR', 'COMMUNITY_FACILITATOR', 'TRAINER', 'OTHER',
];
export const ATTENDANCE_STATUS_LIST = ['INVITED', 'CONFIRMED', 'ATTENDED', 'ABSENT', 'REPLACED'];

export const EVIDENCE_TYPE_LIST = [
  'REPORT', 'ATTENDANCE_SHEET', 'PHOTO', 'SIGNED_FORM', 'EVALUATION_SUMMARY', 'TRAINER_REPORT', 'OTHER',
];

export const STATUS_ACTIONS = {
  DRAFT: [{ action: 'submit', right: RIGHT_TRAINING_UPDATE }, { action: 'cancel', right: RIGHT_TRAINING_UPDATE }],
  SUBMITTED: [{ action: 'approve', right: RIGHT_TRAINING_APPROVE }, { action: 'reject', right: RIGHT_TRAINING_APPROVE }],
  REJECTED: [{ action: 'revise', right: RIGHT_TRAINING_UPDATE }],
  APPROVED: [{ action: 'schedule', right: RIGHT_TRAINING_UPDATE }, { action: 'cancel', right: RIGHT_TRAINING_UPDATE }],
  SCHEDULED: [{ action: 'start', right: RIGHT_TRAINING_UPDATE }, { action: 'cancel', right: RIGHT_TRAINING_UPDATE }],
  ONGOING: [{ action: 'complete', right: RIGHT_TRAINING_UPDATE }, { action: 'cancel', right: RIGHT_TRAINING_UPDATE }],
  COMPLETED: [{ action: 'close', right: RIGHT_TRAINING_UPDATE }],
  CANCELLED: [],
  CLOSED: [],
};
