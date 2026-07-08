import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { PICKER_LIMIT } from '../constants';

function TrainerPicker({
  multiple, required, readOnly, value, onChange, label, withLabel = false, filterSelectedOptions,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [filters, setFilters] = useState({ first: PICKER_LIMIT, isActive: true });

  const { isLoading, data, error } = useGraphqlQuery(
    `query TrainerPicker($search: String, $first: Int, $isActive: Boolean) {
      trainerProfile(fullName_Icontains: $search, first: $first, isActive: $isActive) {
        edges { node { id code fullName trainerType } }
      }
    }`,
    filters,
  );

  const trainers = data?.trainerProfile?.edges?.map((e) => e.node) ?? [];

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={trainers}
      isLoading={isLoading}
      value={value}
      label={label || formatMessage('training.trainerPicker')}
      withLabel={withLabel}
      required={required}
      getOptionLabel={(o) => `${o.fullName} (${o.code})`}
      onChange={(v) => onChange(v, v ? `${v.fullName} (${v?.code ?? ''})` : null)}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ first: PICKER_LIMIT, isActive: true, search })}
      renderInput={(inputProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...inputProps} required={required} label={label || formatMessage('training.trainerPicker')} />
      )}
    />
  );
}

export default TrainerPicker;
