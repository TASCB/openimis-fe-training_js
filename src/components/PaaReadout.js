import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextInput, useModulesManager, useTranslations } from '@openimis/fe-core';
import { fetchPaaForLocation, clearPaaForLocation, decId } from '../actions';
import { locationLevels } from '../utils/paa';

// Which PAA the chosen location belongs to, resolved live by the backend. Read-only by design —
// the PAA is derived from the location, never typed.
function PaaReadout({ location }) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const paa = useSelector((state) => state.training.paaForLocation);

  // A Zanzibar region already names the PAA; mainland needs the district.
  const { R: region, D: district } = locationLevels(location);
  const resolveFrom = decId(district?.id ?? region?.id);

  useEffect(() => {
    if (resolveFrom) dispatch(fetchPaaForLocation(Number(resolveFrom)));
    else dispatch(clearPaaForLocation());
  }, [resolveFrom]);

  return (
    <TextInput
      module="training"
      label="training.paaReference"
      readOnly
      value={paa ?? ''}
      placeholder={formatMessage('training.paa.placeholder')}
    />
  );
}

export default PaaReadout;
