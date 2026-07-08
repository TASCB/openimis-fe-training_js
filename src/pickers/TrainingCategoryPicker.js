import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { PICKER_LIMIT } from '../constants';

function TrainingCategoryPicker({
  multiple, required, readOnly, value, onChange, label, withLabel = false, filterSelectedOptions,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [filters, setFilters] = useState({ first: PICKER_LIMIT, isActive: true });

  const { isLoading, data, error } = useGraphqlQuery(
    `query TrainingCategoryPicker($search: String, $first: Int, $isActive: Boolean) {
      trainingCategory(name_Icontains: $search, first: $first, isActive: $isActive) {
        edges { node { id code name } }
      }
    }`,
    filters,
  );

  const categories = data?.trainingCategory?.edges?.map((e) => e.node) ?? [];

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={categories}
      isLoading={isLoading}
      value={value}
      label={label || formatMessage('training.categoryPicker')}
      withLabel={withLabel}
      required={required}
      getOptionLabel={(o) => `${o.code} - ${o.name}`}
      onChange={(v) => onChange(v, v ? `${v.code} - ${v.name}` : null)}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ first: PICKER_LIMIT, isActive: true, search })}
      renderInput={(inputProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...inputProps} required={required} label={label || formatMessage('training.categoryPicker')} />
      )}
    />
  );
}

export default TrainingCategoryPicker;
