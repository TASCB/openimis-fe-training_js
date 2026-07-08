import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Grid, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Tooltip, Link,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useIntl } from 'react-intl';
import {
  TextInput, useModulesManager, useTranslations, journalize, baseApiUrl, formatDateTimeFromISO,
} from '@openimis/fe-core';
import {
  fetchTrainingMaterials, fetchTrainingEvidence,
  deleteTrainingMaterial, deleteTrainingEvidence,
  uploadTrainingMaterial, uploadTrainingEvidence,
} from '../actions';
import { EvidenceTypePicker } from '../pickers/ConstantPickers';

function TrainingFilesPanel({
  trainingId, kind, filesReadOnly: readOnly, materials, evidence, submittingMutation, mutation,
  fetchTrainingMaterials, fetchTrainingEvidence, deleteTrainingMaterial, deleteTrainingEvidence, journalize,
}) {
  const isEvidence = kind === 'evidence';
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState('REPORT');
  const [busy, setBusy] = useState(false);
  const items = isEvidence ? evidence : materials;
  const prev = useRef();

  const refetch = () => (isEvidence ? fetchTrainingEvidence(trainingId) : fetchTrainingMaterials(trainingId));

  useEffect(() => { if (trainingId) refetch(); }, [trainingId]);
  useEffect(() => {
    if (prev.current && !submittingMutation) { journalize(mutation); if (trainingId) refetch(); }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    const fn = isEvidence ? uploadTrainingEvidence : uploadTrainingMaterial;
    await fn({ trainingId, file, description, evidenceType: isEvidence ? evidenceType : undefined });
    setBusy(false);
    setFile(null);
    setDescription('');
    refetch();
  };

  const remove = (item) => (isEvidence
    ? deleteTrainingEvidence(item, formatMessage('training.evidence.delete.mutationLabel'))
    : deleteTrainingMaterial(item, formatMessage('training.material.delete.mutationLabel')));

  const downloadUrl = (item) => `${baseApiUrl}/training/${isEvidence ? 'evidence' : 'materials'}/${item.id}/download/`;

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('training.file.name')}</TableCell>
            {isEvidence && <TableCell>{formatMessage('training.file.evidenceType')}</TableCell>}
            <TableCell>{formatMessage('training.file.description')}</TableCell>
            <TableCell>{formatMessage('training.file.uploadedBy')}</TableCell>
            <TableCell>{formatMessage('training.file.uploadedDate')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(items ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell><Link href={downloadUrl(item)} target="_blank" rel="noopener">{item.fileName}</Link></TableCell>
              {isEvidence && <TableCell>{formatMessage(`training.evidenceType.${item.evidenceType}`)}</TableCell>}
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.userCreated?.username}</TableCell>
              <TableCell>{item.dateCreated ? formatDateTimeFromISO(modulesManager, intl, item.dateCreated) : ''}</TableCell>
              <TableCell>
                {!readOnly && (
                  <Tooltip title={formatMessage('deleteButton.tooltip')}>
                    <IconButton size="small" onClick={() => remove(item)}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!readOnly && (
        <Grid container alignItems="center" spacing={2} style={{ padding: 12 }}>
          <Grid item><input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Grid>
          {isEvidence && (
            <Grid item style={{ minWidth: 180 }}>
              <EvidenceTypePicker value={evidenceType} onChange={setEvidenceType} />
            </Grid>
          )}
          <Grid item style={{ minWidth: 220 }}>
            <TextInput module="training" label="training.file.description" value={description} onChange={setDescription} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={upload} disabled={!file || busy}>
              {formatMessage('training.file.upload')}
            </Button>
          </Grid>
        </Grid>
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  materials: state.training.trainingMaterials,
  evidence: state.training.trainingEvidence,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingMaterials, fetchTrainingEvidence, deleteTrainingMaterial, deleteTrainingEvidence, journalize,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingFilesPanel);
