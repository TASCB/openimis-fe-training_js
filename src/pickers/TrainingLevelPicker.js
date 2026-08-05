import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { PICKER_LIMIT } from '../constants';

function TrainingLevelPicker({
  multiple, required, readOnly, value, onChange, label, withLabel = false, filterSelectedOptions,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [filters, setFilters] = useState({ first: PICKER_LIMIT, isActive: true });

  const { isLoading, data, error } = useGraphqlQuery(
    `query TrainingLevelPicker($search: String, $first: Int, $isActive: Boolean) {
      trainingLevel(name_Icontains: $search, first: $first, isActive: $isActive, orderBy: "sequence") {
        edges { node { id code name implementationLocation reportingApplication } }
      }
    }`,
    filters,
  );

  const levels = data?.trainingLevel?.edges?.map((e) => e.node) ?? [];
  const pickerLabel = label || formatMessage('training.levelPicker');

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={levels}
      isLoading={isLoading}
      value={value}
      label={pickerLabel}
      withLabel={withLabel}
      required={required}
      getOptionLabel={(o) => (o.code ? `${o.code} — ${o.name}` : o.name)}
      onChange={(v) => onChange(v, v ? `${v.code} — ${v.name}` : null)}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ first: PICKER_LIMIT, isActive: true, search })}
      renderInput={(inputProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...inputProps} required={required} label={pickerLabel} />
      )}
    />
  );
}

export default TrainingLevelPicker;
