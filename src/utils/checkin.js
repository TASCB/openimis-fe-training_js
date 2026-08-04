// Label the auto-open case distinctly so nobody flips a switch that is already having no effect.
// eslint-disable-next-line import/prefer-default-export
export function qrStateKey(session) {
  if (!session?.checkinOpen) return 'training.session.qr.closed';
  return session.registrationOpen ? 'training.session.qr.open' : 'training.session.qr.openAuto';
}
