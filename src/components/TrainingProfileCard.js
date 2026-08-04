import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import School from '@material-ui/icons/School';
import CategoryOutlined from '@material-ui/icons/CategoryOutlined';
import EventOutlined from '@material-ui/icons/EventOutlined';
import EventAvailableOutlined from '@material-ui/icons/EventAvailableOutlined';
import MeetingRoomOutlined from '@material-ui/icons/MeetingRoomOutlined';
import PublicOutlined from '@material-ui/icons/PublicOutlined';
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import Check from '@material-ui/icons/Check';
import { useModulesManager, useTranslations, formatDateFromISO } from '@openimis/fe-core';
import { STATUS_COLORS } from '../constants';

// Region › District › Ward › Village, shown under the PAA it resolves to.
const locationPath = (location) => {
  const names = [];
  for (let node = location; node; node = node.parent) names.unshift(node.name);
  return names.join(' › ');
};

const paaExtra = (t, classes) => {
  const path = locationPath(t.location);
  return path ? <div className={classes.cellSub}>{path}</div> : null;
};

const TEAL = '#00695C';
const TEAL_DK = '#013B33';

const useStyles = makeStyles(() => ({
  '@global': { '.trcard, .trcard *': { fontFamily: "'DM Sans', system-ui, sans-serif" } },
  card: { background: '#fff', borderRadius: 0, overflow: 'hidden' },
  // header
  header: {
    background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DK} 100%)`, color: '#fff',
    padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 18,
  },
  badge: {
    width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.14)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  eyebrow: { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1.5, opacity: 0.8, textTransform: 'uppercase' },
  title: { fontSize: 23, fontWeight: 700, lineHeight: 1.15, marginTop: 2 },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999,
    fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase',
    background: 'rgba(255,255,255,0.16)', flexShrink: 0,
  },
  pillDot: { width: 7, height: 7, borderRadius: '50%' },
  // grid
  body: { padding: '24px 28px 8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#e6efec', border: '1px solid #e6efec', borderRadius: 12, overflow: 'hidden' },
  cell: { background: '#fff', padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' },
  cellIcon: { color: TEAL, marginTop: 1, opacity: 0.85 },
  cellLabel: { fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 1, color: '#9aaaa4', textTransform: 'uppercase' },
  cellVal: { fontSize: 15, fontWeight: 600, color: '#1c322d', marginTop: 3 },
  durChip: { fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: '#7c918b', marginLeft: 8, fontWeight: 500 },
  cellSub: { fontSize: 11.5, fontWeight: 400, color: '#7c918b', marginTop: 2 },
  // overview / sections
  section: { padding: '8px 28px 4px' },
  sectionTitle: { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, color: TEAL, textTransform: 'uppercase', fontWeight: 500, padding: '16px 0 8px', borderBottom: '1px solid #eef3f1', marginBottom: 12 },
  overview: { fontSize: 14, lineHeight: 1.7, color: '#41544e' },
  outcomeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 28px', marginTop: 4 },
  outcome: { display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: '#41544e', lineHeight: 1.5 },
  checkBox: { width: 20, height: 20, borderRadius: 6, background: '#e1f0e6', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  audChip: { fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#3a4f49', background: '#eef4f2', border: '1px solid #e0eae6', borderRadius: 8, padding: '5px 12px' },
  // footer
  footer: {
    marginTop: 18, padding: '16px 28px', background: '#f4f8f6', borderTop: '1px solid #e6efec',
    fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#7c918b', display: 'flex', flexWrap: 'wrap', gap: 18,
  },
  footStrong: { color: '#3a4f49', fontWeight: 500 },
  vchip: { background: '#e3eeea', color: '#4a635c', borderRadius: 6, padding: '2px 8px', letterSpacing: 0.5 },
}));

function TrainingProfileCard({ training }) {
  const classes = useStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const t = training || {};

  useEffect(() => {
    const id = 'tasaf-record-fonts';
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  const fmtDate = (v) => (v ? formatDateFromISO(modulesManager, intl, v) : null);
  const statusLabel = t.status ? formatMessage(`training.status.${t.status}`) : null;
  const statusColor = STATUS_COLORS[t.status] || '#9e9e9e';

  // inclusive duration in days
  let duration = null;
  if (t.startDatetime && t.endDatetime) {
    const d = Math.round((new Date(t.endDatetime) - new Date(t.startDatetime)) / 86400000) + 1;
    if (d > 0) duration = formatMessage('training.record.days').replace('{n}', d);
  }

  const Cell = ({ icon, label, value, extra }) => (
    <div className={classes.cell}>
      <span className={classes.cellIcon}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div className={classes.cellLabel}>{label}</div>
        <div className={classes.cellVal}>{value || '—'}{extra}</div>
      </div>
    </div>
  );

  return (
    <div className={`${classes.card} trcard`}>
      <div className={classes.header}>
        <div className={classes.badge}><School fontSize="medium" /></div>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div className={classes.eyebrow}>{formatMessage('training.record.eyebrow')}{t.code ? ` · ${t.code}` : ''}</div>
          <div className={classes.title}>{t.title}</div>
        </div>
        {statusLabel && (
          <span className={classes.pill}>
            <span className={classes.pillDot} style={{ background: statusColor }} />
            {statusLabel}
          </span>
        )}
      </div>

      <div className={classes.body}>
        <div className={classes.grid}>
          <Cell icon={<CategoryOutlined fontSize="small" />} label={formatMessage('training.category')} value={t.category?.name} />
          <Cell icon={<EventOutlined fontSize="small" />} label={formatMessage('training.record.starts')} value={fmtDate(t.startDatetime)} />
          <Cell icon={<EventAvailableOutlined fontSize="small" />} label={formatMessage('training.record.ends')} value={fmtDate(t.endDatetime)} extra={duration && <span className={classes.durChip}>{duration}</span>} />
          <Cell icon={<MeetingRoomOutlined fontSize="small" />} label={formatMessage('training.venue')} value={t.venue} />
          <Cell icon={<PublicOutlined fontSize="small" />} label={formatMessage('training.paaReference')} value={t.paaReference} extra={paaExtra(t, classes)} />
          <Cell icon={<PeopleOutline fontSize="small" />} label={formatMessage('training.expectedParticipants')} value={t.expectedParticipants} />
        </div>
      </div>

      {t.description && (
        <div className={classes.section}>
          <div className={classes.sectionTitle}>{formatMessage('training.record.overview')}</div>
          <div className={classes.overview}>{t.description}</div>
        </div>
      )}

      {Array.isArray(t.learningOutcomes) && t.learningOutcomes.length > 0 && (
        <div className={classes.section}>
          <div className={classes.sectionTitle}>{formatMessage('training.learningOutcomes')}</div>
          <div className={classes.outcomeGrid}>
            {t.learningOutcomes.map((o, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div className={classes.outcome} key={`o-${i}`}>
                <span className={classes.checkBox}><Check style={{ fontSize: 14 }} /></span>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(t.intendedFor) && t.intendedFor.length > 0 && (
        <div className={classes.section} style={{ paddingBottom: 10 }}>
          <div className={classes.sectionTitle}>{formatMessage('training.intendedFor')}</div>
          <div className={classes.chipRow}>
            {/* eslint-disable-next-line react/no-array-index-key */}
            {t.intendedFor.map((a, i) => <span className={classes.audChip} key={`a-${i}`}>{a}</span>)}
          </div>
        </div>
      )}

      {(t.userCreated || t.userUpdated || t.version != null) && (
        <div className={classes.footer}>
          {t.userCreated?.username && (
            <span>{formatMessage('training.profile.createdBy')} <span className={classes.footStrong}>{t.userCreated.username}</span>{t.dateCreated ? ` · ${fmtDate(t.dateCreated)}` : ''}</span>
          )}
          {t.userUpdated?.username && (
            <span>{formatMessage('training.profile.updatedBy')} <span className={classes.footStrong}>{t.userUpdated.username}</span>{t.dateUpdated ? ` · ${fmtDate(t.dateUpdated)}` : ''}</span>
          )}
          {t.version != null && <span className={classes.vchip}>v{t.version}</span>}
        </div>
      )}
    </div>
  );
}

export default TrainingProfileCard;
