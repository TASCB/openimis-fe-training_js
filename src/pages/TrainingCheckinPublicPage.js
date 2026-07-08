// Public (unauthenticated) training self check-in — shares the Access Request page layout.
// Self-contained: talks directly to /api/training/checkin/:token, no redux/auth.
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import ArrowForward from '@material-ui/icons/ArrowForward';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import EventBusy from '@material-ui/icons/EventBusy';
import PersonOutline from '@material-ui/icons/PersonOutline';
import WcOutlined from '@material-ui/icons/Wc';
import MailOutline from '@material-ui/icons/MailOutline';
import BusinessOutlined from '@material-ui/icons/BusinessOutlined';
import WorkOutline from '@material-ui/icons/WorkOutline';
import ExpandMore from '@material-ui/icons/ExpandMore';
import EventOutlined from '@material-ui/icons/EventOutlined';
import PlaceOutlined from '@material-ui/icons/PlaceOutlined';
import ConfirmationNumberOutlined from '@material-ui/icons/ConfirmationNumberOutlined';
import DoneIcon from '@material-ui/icons/Done';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';

const LOGO = '/front/tasaf-logo.png';

const T = {
  forest: '#013B33',
  primary: '#00695C',
  primaryDk: '#00544a',
  accent: '#7ad0c2',
  paper: '#DCEEE9',
  ink: '#14312c',
  muted: '#5b7671',
  border: '#cfe2dd',
  white: '#fff',
  body: "'DM Sans', system-ui, sans-serif",
};

const useStyles = makeStyles({
  '@global': {
    '.tcheckin, .tcheckin *': { boxSizing: 'border-box', fontFamily: T.body },
    '@media (prefers-reduced-motion: reduce)': {
      '.tcheckin *': { transition: 'none !important', animation: 'none !important', scrollBehavior: 'auto !important' },
    },
  },
  page: { minHeight: '100vh', background: T.paper, color: T.ink, display: 'flex', flexDirection: 'column' },

  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '10px 24px', background: T.white, borderBottom: `1px solid ${T.border}`,
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { height: 34, width: 'auto', display: 'block' },
  wordmark: { fontWeight: 800, fontSize: 16, letterSpacing: 0.4, color: T.forest },
  wordmarkSub: { color: T.muted, fontWeight: 600, fontSize: 12, marginLeft: 8, letterSpacing: 0.3 },
  topbarRight: { color: T.muted, fontSize: 13, fontWeight: 600 },

  hero: {
    position: 'relative', overflow: 'hidden', color: T.white,
    background: `radial-gradient(1200px 400px at 78% -10%, rgba(122,208,194,.14), transparent 60%), linear-gradient(155deg, ${T.forest} 0%, #015043 60%, ${T.primary} 100%)`,
    padding: '56px 24px 64px',
  },
  heroInner: { maxWidth: 1120, margin: '0 auto' },
  h1: { fontSize: 46, lineHeight: 1.06, fontWeight: 800, margin: '0 0 14px', maxWidth: 640, letterSpacing: -0.5 },
  h1accent: { color: T.accent },
  heroSub: { fontSize: 17, lineHeight: 1.55, color: '#d7e6dd', maxWidth: 560, margin: 0 },
  ctaRow: { display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    background: T.white, color: T.primary, border: 0, borderRadius: 10, padding: '13px 20px',
    fontFamily: T.body, fontSize: 15, fontWeight: 700, transition: 'background .15s, transform .05s',
    '&:hover': { background: '#eef6f4' },
    '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: 'none', boxShadow: '0 0 0 3px rgba(255,255,255,.55)' },
  },

  main: { flex: 1, padding: '0 24px' },
  cols: {
    maxWidth: 1120, margin: '48px auto 0', display: 'grid', gap: 40,
    gridTemplateColumns: '1fr 1.05fr', alignItems: 'start', paddingBottom: 64,
    '@media (max-width: 900px)': { gridTemplateColumns: '1fr', margin: '36px auto 0', gap: 28 },
  },
  solo: { maxWidth: 620, margin: '48px auto 0', paddingBottom: 64 },

  info: { paddingTop: 4, '@media (max-width: 900px)': { paddingTop: 0 } },
  infoEyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: T.primary },
  infoTitle: { fontSize: 24, fontWeight: 800, color: T.ink, margin: '8px 0 8px' },
  infoLead: { fontSize: 14.5, lineHeight: 1.55, color: T.muted, maxWidth: 380, margin: '0 0 22px' },
  detailRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: `1px solid ${T.border}` },
  detailIcon: { fontSize: 20, color: T.primary, flexShrink: 0, marginTop: 1 },
  detailLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: T.muted, marginBottom: 2 },
  detailVal: { fontSize: 15, fontWeight: 700, color: T.ink },
  detailChip: { fontSize: 11.5, fontWeight: 600, color: T.primary, marginLeft: 8, letterSpacing: 0.5 },
  desc: { color: T.muted, fontSize: 13.5, lineHeight: 1.6, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  descFull: { color: T.muted, fontSize: 13.5, lineHeight: 1.6, marginTop: 4 },
  readMore: { fontSize: 12.5, fontWeight: 700, color: T.primary, cursor: 'pointer', display: 'inline-block', marginTop: 6 },

  card: {
    background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28,
    boxShadow: '0 18px 40px rgba(6,56,31,.08)',
    '@media (max-width: 430px)': { padding: 18 },
  },
  cardTitle: { fontSize: 20, fontWeight: 800, color: T.ink, margin: '0 0 4px' },
  cardHint: { fontSize: 13, color: T.muted, margin: '0 0 18px' },

  field: { marginBottom: 14, '&:last-child': { marginBottom: 0 } },
  label: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 6 },
  req: { color: T.primary },
  opt: { color: T.muted, fontWeight: 500, fontSize: 11.5 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 11, fontSize: 18, color: T.muted, pointerEvents: 'none' },
  input: {
    width: '100%', padding: '11px 12px 11px 36px', borderRadius: 9, border: `1px solid ${T.border}`,
    fontFamily: T.body, fontSize: 14.5, color: T.ink, background: T.white, transition: 'border-color .15s, box-shadow .15s',
    '&::placeholder': { color: '#9aa8a0' },
    '&:hover': { borderColor: '#c9d4cd' },
    '&:focus': { outline: 'none', borderColor: T.primary, boxShadow: '0 0 0 3px rgba(0,105,92,.18)' },
  },
  phoneBox: {
    display: 'flex', alignItems: 'center', borderRadius: 9, border: `1px solid ${T.border}`, background: T.white,
    transition: 'border-color .15s, box-shadow .15s',
    '&:focus-within': { borderColor: T.primary, boxShadow: '0 0 0 3px rgba(0,105,92,.18)' },
  },
  phonePrefix: { fontWeight: 700, color: T.primary, fontSize: 14, padding: '0 10px 0 12px', borderRight: `1px solid ${T.border}` },
  phoneInput: {
    flex: 1, border: 'none', background: 'none', outline: 'none', padding: '11px 12px', borderRadius: 9,
    fontFamily: T.body, fontSize: 14.5, color: T.ink, '&::placeholder': { color: '#9aa8a0' },
  },
  selectBox: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px 11px 36px', position: 'relative',
    borderRadius: 9, border: `1px solid ${T.border}`, background: T.white, cursor: 'pointer', fontSize: 14.5,
    '&:focus-visible': { outline: 'none', borderColor: T.primary, boxShadow: '0 0 0 3px rgba(0,105,92,.18)' },
  },
  selectVal: { flex: 1, color: T.ink },
  selectPlaceholder: { flex: 1, color: '#9aa8a0' },
  menuWrap: { position: 'relative' },
  backdrop: { position: 'fixed', inset: 0, zIndex: 40 },
  menu: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
    background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden',
    boxShadow: '0 12px 30px rgba(6,56,31,.16)', padding: 4,
  },
  menuItem: {
    padding: '10px 12px', fontSize: 14.5, color: T.ink, cursor: 'pointer', borderRadius: 7, transition: 'background .12s, color .12s',
    '&:hover': { background: 'rgba(0,105,92,.08)' },
  },
  menuItemSel: { background: T.primary, color: T.white, '&:hover': { background: T.primary } },

  hp: { position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' },
  errText: { display: 'flex', alignItems: 'center', gap: 5, color: '#c0392b', fontSize: 12.5, fontWeight: 600, marginTop: 10 },

  submit: {
    width: '100%', marginTop: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    background: T.primary, color: T.white, border: 0, borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
    fontFamily: T.body, fontSize: 15.5, fontWeight: 700, transition: 'background .15s',
    '&:hover': { background: T.primaryDk },
    '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: 'none', boxShadow: '0 0 0 3px rgba(0,105,92,.38)' },
    '&:disabled': { opacity: 0.85, cursor: 'default' },
  },

  state: { textAlign: 'center', padding: '32px 18px' },
  stateTitle: { fontSize: 19, fontWeight: 800, color: T.ink, marginTop: 10 },
});

const initialForm = { full_name: '', gender: '', phone: '', email: '', organization: '', title: '', hp: '' };

// Top-level (stable) field — defining it inside the page would blur inputs each keystroke.
function Field({
  ctx, label, icon, value, onChange, type, placeholder, required, autoComplete,
}) {
  const { classes, fm } = ctx;
  return (
    <div className={classes.field}>
      <span className={classes.label}>
        {label}
        {required ? <span className={classes.req}>*</span> : <span className={classes.opt}>({fm('training.checkin.optional')})</span>}
      </span>
      <span className={classes.inputWrap}>
        {icon}
        <input
          className={classes.input}
          type={type || 'text'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-label={label}
        />
      </span>
    </div>
  );
}

function TrainingCheckinPublicPage(props) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const fm = (id) => formatMessage(id);
  const token = props?.match?.params?.token;

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  useEffect(() => {
    const id = 'tasaf-dmsans-font';
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/training/checkin/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (alive) { setInfo(d); setLoading(false); } })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [token]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    setError(null);
    if (!form.full_name.trim() || !form.phone.trim()) {
      setError(fm('training.checkin.requiredError')); return;
    }
    setSubmitting(true);
    fetch(`/api/training/checkin/${token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
      .then((r) => r.json().then((d) => ({ status: r.status, d })))
      .then(({ status, d }) => {
        setSubmitting(false);
        if (status === 403) { setError(fm('training.checkin.closed')); return; }
        if (status >= 400) { setError(fm('training.checkin.submitError')); return; }
        setDone(d.already ? 'already' : 'ok');
      })
      .catch(() => { setSubmitting(false); setError(fm('training.checkin.submitError')); });
  };

  const s = info?.session || {};
  let dateStr = ''; let chip = '';
  if (s.date) {
    const d = new Date(s.date);
    dateStr = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    chip = d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
    if (s.startTime) chip += ` · ${s.startTime}`;
  }
  const venue = s.venue || info?.training?.venue;
  const ctx = { classes, fm };

  const scrollToForm = () => document.getElementById('tc-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const Shell = ({ children, cta }) => (
    <div className={`${classes.page} tcheckin`}>
      <div className={classes.topbar}>
        <div className={classes.brandRow}>
          <img className={classes.logo} src={LOGO} alt="TASAF" onError={(e) => { e.target.style.display = 'none'; }} />
          <span>
            <span className={classes.wordmark}>TASAF MIS</span>
            <span className={classes.wordmarkSub}>{fm('training.checkin.kicker')}</span>
          </span>
        </div>
        <span className={classes.topbarRight}>{fm('training.checkin.sessionPass')}</span>
      </div>

      <div className={classes.hero}>
        <div className={classes.heroInner}>
          <h1 className={classes.h1}>
            {fm('training.checkin.heroLine1')}
            {' '}
            <span className={classes.h1accent}>{fm('training.checkin.heroBrand')}</span>
            {' '}
            {fm('training.checkin.heroLine2')}
          </h1>
          <p className={classes.heroSub}>{fm('training.checkin.heroSubtitle')}</p>
          {cta && (
            <div className={classes.ctaRow}>
              <button type="button" className={classes.btnPrimary} onClick={scrollToForm}>
                {fm('training.checkin.heroCta')}<ArrowForward style={{ fontSize: 18 }} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={classes.main}>{children}</div>
    </div>
  );

  const SessionDetails = () => (
    <div className={classes.info}>
      <div className={classes.infoEyebrow}>{fm('training.checkin.sessionEyebrow')}</div>
      <h2 className={classes.infoTitle}>{info?.training?.title || fm('training.checkin.sessionHeading')}</h2>
      <p className={classes.infoLead}>{fm('training.checkin.sessionLead')}</p>

      {(dateStr || chip) && (
        <div className={classes.detailRow}>
          <EventOutlined className={classes.detailIcon} />
          <div>
            <div className={classes.detailLabel}>{fm('training.checkin.when')}</div>
            <div className={classes.detailVal}>{dateStr}{chip && <span className={classes.detailChip}>{chip}</span>}</div>
          </div>
        </div>
      )}
      {venue && (
        <div className={classes.detailRow}>
          <PlaceOutlined className={classes.detailIcon} />
          <div>
            <div className={classes.detailLabel}>{fm('training.checkin.where')}</div>
            <div className={classes.detailVal}>{venue}</div>
          </div>
        </div>
      )}
      {s.title && (
        <div className={classes.detailRow}>
          <WorkOutline className={classes.detailIcon} />
          <div>
            <div className={classes.detailLabel}>{fm('training.checkin.track')}</div>
            <div className={classes.detailVal}>{s.title}</div>
          </div>
        </div>
      )}
      {info?.ref && (
        <div className={classes.detailRow}>
          <ConfirmationNumberOutlined className={classes.detailIcon} />
          <div>
            <div className={classes.detailLabel}>{fm('training.checkin.ref')}</div>
            <div className={classes.detailVal}>{info.ref}</div>
          </div>
        </div>
      )}
      {info?.training?.description && (
        <div className={classes.detailRow}>
          <div style={{ width: 20, flexShrink: 0 }} />
          <div>
            <div className={showFullDesc ? classes.descFull : classes.desc}>{info.training.description}</div>
            {info.training.description.length > 130 && (
              <span className={classes.readMore} role="button" tabIndex={0} onClick={() => setShowFullDesc(!showFullDesc)}>
                {fm(showFullDesc ? 'training.checkin.readLess' : 'training.checkin.readMore')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <Shell><div className={classes.solo}><div className={classes.card}><div className={classes.state}><CircularProgress style={{ color: T.primary }} /></div></div></div></Shell>;
  }
  if (notFound) {
    return (
      <Shell>
        <div className={classes.solo}>
          <div className={classes.card}>
            <div className={classes.state}>
              <EventBusy style={{ fontSize: 52, color: T.muted, opacity: 0.6 }} />
              <div className={classes.stateTitle}>{fm('training.checkin.notFound')}</div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const formIsOpen = info?.isOpen && !done;

  return (
    <Shell cta={formIsOpen}>
      <div className={classes.cols}>
        <SessionDetails />

        <div id="tc-form" className={classes.card}>
          {done ? (
            <div className={classes.state}>
              <CheckCircleOutline style={{ fontSize: 60, color: '#2e7d32' }} />
              <div className={classes.stateTitle}>{fm(done === 'already' ? 'training.checkin.already' : 'training.checkin.success')}</div>
            </div>
          ) : !info?.isOpen ? (
            <div className={classes.state}>
              <EventBusy style={{ fontSize: 52, color: T.muted, opacity: 0.6 }} />
              <div className={classes.stateTitle}>{fm('training.checkin.closed')}</div>
            </div>
          ) : (
            <>
              <h2 className={classes.cardTitle}>{fm('training.checkin.formTitle')}</h2>
              <p className={classes.cardHint}>{fm('training.checkin.requiredNote')}</p>

              <Field
                ctx={ctx} required label={fm('training.checkin.fullName')}
                icon={<PersonOutline className={classes.inputIcon} />}
                value={form.full_name} onChange={set('full_name')}
                placeholder={fm('training.checkin.fullNamePh')} autoComplete="name"
              />

              <div className={classes.field}>
                <span className={classes.label}>
                  {fm('training.checkin.phone')}<span className={classes.req}>*</span>
                </span>
                <div className={classes.phoneBox}>
                  <span className={classes.phonePrefix}>+255</span>
                  <input className={classes.phoneInput} type="tel" value={form.phone} onChange={set('phone')} placeholder="712 345 678" autoComplete="tel" aria-label={fm('training.checkin.phone')} />
                </div>
              </div>

              <div className={classes.field}>
                <span className={classes.label}>
                  {fm('training.checkin.gender')}<span className={classes.opt}>({fm('training.checkin.optional')})</span>
                </span>
                <div className={classes.menuWrap}>
                  <div className={classes.selectBox} role="button" tabIndex={0} onClick={() => setGenderOpen((o) => !o)}>
                    <WcOutlined className={classes.inputIcon} style={{ fontSize: 18 }} />
                    {form.gender
                      ? <span className={classes.selectVal}>{fm(`training.checkin.gender.${form.gender}`)}</span>
                      : <span className={classes.selectPlaceholder}>{fm('training.checkin.selectPh')}</span>}
                    <ExpandMore fontSize="small" style={{ color: T.muted, transform: genderOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                  </div>
                  {genderOpen && (
                    <>
                      <div className={classes.backdrop} onClick={() => setGenderOpen(false)} />
                      <div className={classes.menu}>
                        {[['', 'training.checkin.selectPh'], ['M', 'training.checkin.gender.M'], ['F', 'training.checkin.gender.F']].map(([val, key]) => (
                          <div
                            key={val || 'none'}
                            className={`${classes.menuItem} ${form.gender === val ? classes.menuItemSel : ''}`}
                            onClick={() => { setForm({ ...form, gender: val }); setGenderOpen(false); }}
                          >
                            {fm(key)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Field
                ctx={ctx} type="email" label={fm('training.checkin.email')}
                icon={<MailOutline className={classes.inputIcon} />}
                value={form.email} onChange={set('email')} placeholder="name@example.com" autoComplete="email"
              />
              <Field
                ctx={ctx} label={fm('training.checkin.organization')}
                icon={<BusinessOutlined className={classes.inputIcon} />}
                value={form.organization} onChange={set('organization')} placeholder={fm('training.checkin.organizationPh')}
              />
              <Field
                ctx={ctx} label={fm('training.checkin.title')}
                icon={<WorkOutline className={classes.inputIcon} />}
                value={form.title} onChange={set('title')} placeholder={fm('training.checkin.titlePh')}
              />

              <input className={classes.hp} tabIndex={-1} autoComplete="off" value={form.hp} onChange={set('hp')} aria-hidden="true" />
              {error && <div className={classes.errText}>{error}</div>}

              <button type="button" className={classes.submit} disabled={submitting} onClick={submit}>
                {submitting ? <CircularProgress size={20} style={{ color: '#fff' }} /> : <><DoneIcon style={{ fontSize: 18 }} /> {fm('training.checkin.submit')}</>}
              </button>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}

export default TrainingCheckinPublicPage;
