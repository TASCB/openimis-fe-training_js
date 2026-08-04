// admin.UserPicker yields { id, username, iUser { id otherNames lastName } }, where `id`
// is the core User's relay global id — decId() it before sending to a graphene.UUID arg.
// eslint-disable-next-line import/prefer-default-export
export function userDisplayName(user) {
  if (!user) return '';
  const { otherNames, lastName } = user.iUser ?? {};
  return [otherNames, lastName].filter(Boolean).join(' ') || user.username || '';
}
