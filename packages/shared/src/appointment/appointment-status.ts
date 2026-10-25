export type AppointmentAction = 'confirm' | 'reschedule' | 'cancel' | 'complete' | 'noshow';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'noshow';
export type AppointmentActor = 'staff' | 'client' | 'system';

const RULES: Record<AppointmentAction, { from: readonly AppointmentStatus[]; actors: readonly AppointmentActor[] }> = {
  confirm: { from: ['pending'], actors: ['staff', 'system'] }, // TODO system auto-approve when autoconfirm is on
  reschedule: { from: ['pending', 'confirmed'], actors: ['staff', 'client'] },
  cancel: { from: ['pending', 'confirmed'], actors: ['staff', 'client'] },
  complete: { from: ['confirmed'], actors: ['staff', 'system'] },
  noshow: { from: ['confirmed', 'completed'], actors: ['staff'] }, // completed -> noshow can fix automatic auto-complete
};

export function isActionAllowed(
  action: AppointmentAction,
  status: AppointmentStatus,
  actor: AppointmentActor,
): boolean {
  const rule = RULES[action];

  return rule.from.includes(status) && rule.actors.includes(actor);
}
