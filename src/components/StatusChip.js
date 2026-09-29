import React from 'react';
import { Chip } from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { STATUS_CHIP_COLOR } from '../constants';

function StatusChip({ status }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  if (!status) return null;
  const label = formatMessage(`training.status.${status}`);
  return (
    <Chip
      size="small"
      label={label}
      style={{ backgroundColor: STATUS_CHIP_COLOR, color: '#fff' }}
    />
  );
}

export default StatusChip;
