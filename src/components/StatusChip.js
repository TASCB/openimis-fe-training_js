import React from 'react';
import { Chip } from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { STATUS_COLORS } from '../constants';

function StatusChip({ status }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  if (!status) return null;
  const label = formatMessage(`training.status.${status}`);
  return (
    <Chip
      size="small"
      label={label}
      style={{ backgroundColor: STATUS_COLORS[status] || '#9e9e9e', color: '#fff' }}
    />
  );
}

export default StatusChip;
