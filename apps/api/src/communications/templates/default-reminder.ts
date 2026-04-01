/**
 * Default reminder template — EN/FR
 * Available variables: {{guestFirstName}}, {{guestLastName}}, {{hotelName}},
 * {{checkInDate}}, {{preCheckUrl}}, {{confirmationNumber}}
 */

export const DEFAULT_REMINDER_EMAIL = {
  subjectEn: 'Reminder: Complete your pre-check-in before arrival',
  subjectFr: 'Rappel : Complétez votre pré-enregistrement avant votre arrivée',
  bodyEn: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#e67e22;">Friendly Reminder, {{guestFirstName}}</h2>
  <p>Your check-in at <strong>{{hotelName}}</strong> is <strong>tomorrow</strong> ({{checkInDate}}), and your pre-check-in is not yet complete.</p>
  <p>Completing your pre-check-in now will help you skip the front desk line and head straight to your room.</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{preCheckUrl}}" style="background-color:#e67e22;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Complete Pre-Check-In Now</a>
  </p>
  <p style="color:#999;font-size:13px;">Confirmation #{{confirmationNumber}}. If you've already completed pre-check-in, please disregard this message.</p>
</div>`,
  bodyFr: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#e67e22;">Rappel amical, {{guestFirstName}}</h2>
  <p>Votre arrivée au <strong>{{hotelName}}</strong> est <strong>demain</strong> ({{checkInDate}}), et votre pré-enregistrement n'est pas encore complété.</p>
  <p>En complétant votre pré-enregistrement maintenant, vous pourrez éviter la file d'attente à la réception et accéder directement à votre chambre.</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{preCheckUrl}}" style="background-color:#e67e22;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Compléter le pré-enregistrement</a>
  </p>
  <p style="color:#999;font-size:13px;">Confirmation n°{{confirmationNumber}}. Si vous avez déjà complété votre pré-enregistrement, veuillez ignorer ce message.</p>
</div>`,
};

export const DEFAULT_REMINDER_SMS = {
  bodyEn:
    '{{hotelName}}: Reminder — your check-in is tomorrow! Please complete pre-check-in: {{preCheckUrl}}',
  bodyFr:
    '{{hotelName}}: Rappel — votre arrivée est demain ! Veuillez compléter le pré-enregistrement: {{preCheckUrl}}',
};
