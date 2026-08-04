import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import {
  TRAINING_STATUS_LIST, TRAINER_TYPE_LIST, ASSIGNMENT_ROLE_LIST, ASSIGNMENT_STATUS_LIST,
  ATTENDANCE_STATUS_LIST, EVIDENCE_TYPE_LIST, GENDER_LIST,
} from '../constants';

function makePicker(pickerLabel, constants) {
  function Picker({
    required, withNull, readOnly, onChange, value, nullLabel, withLabel, label,
  }) {
    return (
      <ConstantBasedPicker
        module="training"
        label={label || pickerLabel}
        constants={constants}
        required={required}
        withNull={withNull}
        readOnly={readOnly}
        onChange={onChange}
        value={value}
        nullLabel={nullLabel}
        withLabel={withLabel}
      />
    );
  }
  return Picker;
}

export const TrainingStatusPicker = makePicker('training.status', TRAINING_STATUS_LIST);
export const TrainerTypePicker = makePicker('training.trainerType', TRAINER_TYPE_LIST);
export const AssignmentRolePicker = makePicker('training.role', ASSIGNMENT_ROLE_LIST);
export const AssignmentStatusPicker = makePicker('training.assignmentStatus', ASSIGNMENT_STATUS_LIST);
export const AttendanceStatusPicker = makePicker('training.attendanceStatus', ATTENDANCE_STATUS_LIST);
export const EvidenceTypePicker = makePicker('training.evidenceType', EVIDENCE_TYPE_LIST);
export const GenderPicker = makePicker('training.gender', GENDER_LIST);
