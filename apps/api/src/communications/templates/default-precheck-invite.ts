/**
 * Default pre-check-in invitation template — EN/FR
 * Available variables: {{guestFirstName}}, {{guestLastName}}, {{hotelName}},
 * {{checkInDate}}, {{checkOutDate}}, {{roomType}}, {{preCheckUrl}},
 * {{confirmationNumber}}
 */

export const DEFAULT_PRECHECK_INVITE_EMAIL = {
  subjectEn: 'Complete your pre-check-in for {{hotelName}}',
  subjectFr: 'Complétez votre pré-enregistrement pour {{hotelName}}',
  bodyEn: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#2c3e50;">Welcome, {{guestFirstName}}!</h2>
  <p>Your stay at <strong>{{hotelName}}</strong> is approaching. To ensure a smooth arrival, please complete your pre-check-in online.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;color:#666;">Confirmation #</td><td style="padding:8px;"><strong>{{confirmationNumber}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Check-in</td><td style="padding:8px;"><strong>{{checkInDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Check-out</td><td style="padding:8px;"><strong>{{checkOutDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Room Type</td><td style="padding:8px;"><strong>{{roomType}}</strong></td></tr>
  </table>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{preCheckUrl}}" style="background-color:#2c3e50;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Complete Pre-Check-In</a>
  </p>
  <p style="color:#999;font-size:13px;">This link will expire 24 hours after your check-in date. If you have questions, contact the hotel directly.</p>
</div>`,
  bodyFr: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#2c3e50;">Bienvenue, {{guestFirstName}} !</h2>
  <p>Votre séjour au <strong>{{hotelName}}</strong> approche. Pour assurer une arrivée fluide, veuillez compléter votre pré-enregistrement en ligne.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;color:#666;">N° de confirmation</td><td style="padding:8px;"><strong>{{confirmationNumber}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Arrivée</td><td style="padding:8px;"><strong>{{checkInDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Départ</td><td style="padding:8px;"><strong>{{checkOutDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Type de chambre</td><td style="padding:8px;"><strong>{{roomType}}</strong></td></tr>
  </table>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{preCheckUrl}}" style="background-color:#2c3e50;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Compléter le pré-enregistrement</a>
  </p>
  <p style="color:#999;font-size:13px;">Ce lien expirera 24 heures après votre date d'arrivée. Pour toute question, contactez l'hôtel directement.</p>
</div>`,
};

export const DEFAULT_PRECHECK_INVITE_SMS = {
  bodyEn:
    '{{hotelName}}: Hi {{guestFirstName}}, your stay on {{checkInDate}} is coming up! Complete pre-check-in here: {{preCheckUrl}}',
  bodyFr:
    '{{hotelName}}: Bonjour {{guestFirstName}}, votre séjour du {{checkInDate}} approche ! Complétez le pré-enregistrement ici: {{preCheckUrl}}',
};
