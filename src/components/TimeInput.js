import React from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles, alpha } from '@material-ui/core/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';

// fe-core publishes no time picker (only core.DatePicker/Month/Year), so this
// mirrors that picker's brand styling to keep session rows visually consistent.
const useStyles = makeStyles((theme) => ({
  label: {
    color: theme.palette.primary.main,
    fontSize: '0.75rem',
    display: 'block',
    lineHeight: 1.6,
  },
  field: {
    '& .MuiInput-underline:before': {
      borderBottomColor: alpha(theme.palette.primary.main, 0.42),
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: theme.palette.primary.main,
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.primary.main,
    },
    '& input': {
      color: theme.palette.primary.main,
    },
  },
}));

function TimeInput({
  id, module, label, value, onChange, readOnly = false, required = false, width = 96,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(module || MODULE_NAME, modulesManager);
  const inputId = id || `time-${label || 'input'}`;

  const field = (
    <TextField
      id={inputId}
      type="time"
      className={classes.field}
      value={value || ''}
      disabled={readOnly}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      style={{ width }}
    />
  );

  if (!label) return field;
  return (
    <>
      {/* MUI TextField is not a control the a11y rule can see through; htmlFor/id pairs them. */}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className={classes.label} htmlFor={inputId}>
        {formatMessage(label) + (required ? ' *' : '')}
      </label>
      {field}
    </>
  );
}

export default TimeInput;
