import React from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import School from '@material-ui/icons/School';
import EventOutlined from '@material-ui/icons/EventOutlined';
import MeetingRoomOutlined from '@material-ui/icons/MeetingRoomOutlined';
import PublicOutlined from '@material-ui/icons/PublicOutlined';
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import Check from '@material-ui/icons/Check';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useModulesManager, useTranslations, formatDateFromISO } from '@openimis/fe-core';
import {
  PreviewDialog, PreviewSection, PreviewText, usePreviewStyles, PREVIEW_BORDER, PREVIEW_INK, PREVIEW_MUTED,
} from '@openimis/fe-tasaf_common';

// Region › District › Ward › Village, shown under the PAA it resolves to.
const locationPath = (location) => {
  const names = [];
  for (let node = location; node; node = node.parent) names.unshift(node.name);
  return names.join(' › ');
};

const useStyles = makeStyles((theme) => {
  const teal = theme.palette.primary.main;
  return {
    tile: {
      width: 46, height: 46, borderRadius: 12, background: teal, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    facts: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
    fact: {
      display: 'flex', gap: 10, alignItems: 'flex-start',
      '& > svg': { fontSize: 18, color: teal, marginTop: 2, flex: '0 0 auto' },
    },
    factValue: { fontSize: 14, color: PREVIEW_INK, fontWeight: 600, wordBreak: 'break-word' },
    factSub: { fontSize: 12, color: PREVIEW_MUTED, marginTop: 1 },
    outcomes: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px 20px' },
    outcome: { display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14, color: PREVIEW_INK, lineHeight: 1.5 },
    check: {
      width: 20, height: 20, borderRadius: 6, background: '#e1f0e6', color: '#2e7d32', flex: '0 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    audience: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    audienceChip: {
      fontSize: 13, color: PREVIEW_INK, background: '#fff', border: `1px solid ${PREVIEW_BORDER}`, borderRadius: 8, padding: '4px 10px',
    },
    none: { color: '#9aa8a0', fontSize: 14 },
  };
});

function Fact({ icon, value, sub, classes }) {
  return (
    <div className={classes.fact}>
      {icon}
      <div style={{ minWidth: 0 }}>
        <div className={classes.factValue}>{value || '—'}</div>
        {sub && <div className={classes.factSub}>{sub}</div>}
      </div>
    </div>
  );
}

function TrainingPreviewDialog({ training, onClose, onOpen }) {
  const p = usePreviewStyles();
  const classes = useStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const t = training || {};

  const fmtDate = (v) => (v ? formatDateFromISO(modulesManager, intl, v) : null);
  let duration = null;
  if (t.startDatetime && t.endDatetime) {
    const d = Math.round((new Date(t.endDatetime) - new Date(t.startDatetime)) / 86400000) + 1;
    if (d > 0) duration = formatMessage('training.record.days').replace('{n}', d);
  }
  const dates = t.startDatetime ? `${fmtDate(t.startDatetime)} → ${fmtDate(t.endDatetime) || '—'}` : null;
  const outcomes = Array.isArray(t.learningOutcomes) ? t.learningOutcomes.filter(Boolean) : [];
  const audience = Array.isArray(t.intendedFor) ? t.intendedFor.filter(Boolean) : [];

  const aside = (
    <>
      <div className={classes.tile}><School /></div>
      <h2 className={p.heading}>{t.title}</h2>
      {t.code && <span className={p.code}>{t.code}</span>}
      <div className={p.tags}>
        {t.status && <span className={p.statusTag}>{formatMessage(`training.status.${t.status}`)}</span>}
        {t.category?.name && <span className={p.tag}>{t.category.name}</span>}
      </div>
      <div className={classes.facts}>
        <Fact classes={classes} icon={<EventOutlined />} value={dates} sub={duration} />
        <Fact classes={classes} icon={<MeetingRoomOutlined />} value={t.venue} />
        <Fact classes={classes} icon={<PublicOutlined />} value={t.paaReference} sub={locationPath(t.location)} />
        <Fact
          classes={classes}
          icon={<PeopleOutline />}
          value={t.expectedParticipants != null
            ? `${t.expectedParticipants} ${formatMessage('training.expectedParticipants').toLowerCase()}`
            : null}
        />
      </div>
    </>
  );

  const meta = (
    <>
      {t.userCreated?.username && (
        <span>
          {`${formatMessage('training.profile.createdBy')} ${t.userCreated.username}`}
          {t.dateCreated ? ` · ${fmtDate(t.dateCreated)}` : ''}
        </span>
      )}
      {t.userUpdated?.username && (
        <span>
          {`${formatMessage('training.profile.updatedBy')} ${t.userUpdated.username}`}
          {t.dateUpdated ? ` · ${fmtDate(t.dateUpdated)}` : ''}
        </span>
      )}
      {t.version != null && <span>{`v${t.version}`}</span>}
    </>
  );

  return (
    <PreviewDialog
      open={!!training}
      onClose={onClose}
      title={formatMessage('training.previewTitle')}
      closeLabel={formatMessage('training.close')}
      aside={aside}
      meta={meta}
      actions={(
        <>
          <Button onClick={onClose} color="primary">{formatMessage('training.close')}</Button>
          {onOpen && (
            <Button onClick={() => onOpen(t)} color="primary" variant="contained" disableElevation startIcon={<OpenInNewIcon />}>
              {formatMessage('training.open')}
            </Button>
          )}
        </>
      )}
    >
      <PreviewSection label={formatMessage('training.record.overview')}>
        {t.description
          ? <PreviewText moreLabel={formatMessage('training.readMore')} lessLabel={formatMessage('training.readLess')}>{t.description}</PreviewText>
          : <div className={classes.none}>{formatMessage('training.preview.noOverview')}</div>}
      </PreviewSection>
      {outcomes.length > 0 && (
        <PreviewSection label={formatMessage('training.learningOutcomes')}>
          <div className={classes.outcomes}>
            {outcomes.map((o, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div className={classes.outcome} key={`o-${i}`}>
                <span className={classes.check}><Check style={{ fontSize: 14 }} /></span>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </PreviewSection>
      )}
      {audience.length > 0 && (
        <PreviewSection label={formatMessage('training.intendedFor')}>
          <div className={classes.audience}>
            {/* eslint-disable-next-line react/no-array-index-key */}
            {audience.map((a, i) => <span className={classes.audienceChip} key={`a-${i}`}>{a}</span>)}
          </div>
        </PreviewSection>
      )}
    </PreviewDialog>
  );
}

export default TrainingPreviewDialog;
