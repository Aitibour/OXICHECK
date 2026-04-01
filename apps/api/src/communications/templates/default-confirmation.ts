/**
 * Default confirmation template — EN/FR
 * Available variables: {{guestFirstName}}, {{guestLastName}}, {{hotelName}},
 * {{checkInDate}}, {{checkOutDate}}, {{roomType}}, {{confirmationNumber}}
 */

export const DEFAULT_CONFIRMATION_EMAIL = {
  subjectEn: 'Your pre-check-in is complete!',
  subjectFr: 'Votre pré-enregistrement est terminé !',
  bodyEn: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#27ae60;">All Set, {{guestFirstName}}!</h2>
  <p>Your pre-check-in for <strong>{{hotelName}}</strong> is now complete. Here's a summary of your stay:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;color:#666;">Confirmation #</td><td style="padding:8px;"><strong>{{confirmationNumber}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Check-in</td><td style="padding:8px;"><strong>{{checkInDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Check-out</td><td style="padding:8px;"><strong>{{checkOutDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Room Type</td><td style="padding:8px;"><strong>{{roomType}}</strong></td></tr>
  </table>
  <p>When you arrive, simply head to the express check-in counter with your ID. We look forward to welcoming you!</p>
  <p style="color:#999;font-size:13px;">If you need to make changes, please contact the hotel directly.</p>
</div>`,
  bodyFr: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#27ae60;">Tout est prêt, {{guestFirstName}} !</h2>
  <p>Votre pré-enregistrement pour le <strong>{{hotelName}}</strong> est maintenant complété. Voici un résumé de votre séjour :</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;color:#666;">N° de confirmation</td><td style="padding:8px;"><strong>{{confirmationNumber}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Arrivée</td><td style="padding:8px;"><strong>{{checkInDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Départ</td><td style="padding:8px;"><strong>{{checkOutDate}}</strong></td></tr>
    <tr><td style="padding:8px;color:#666;">Type de chambre</td><td style="padding:8px;"><strong>{{roomType}}</strong></td></tr>
  </table>
  <p>À votre arrivée, présentez-vous simplement au comptoir d'enregistrement express avec votre pièce d'identité. Au plaisir de vous accueillir !</p>
  <p style="color:#999;font-size:13px;">Pour toute modification, veuillez contacter l'hôtel directement.</p>
</div>`,
};

export const DEFAULT_CONFIRMATION_SMS = {
  bodyEn:
    '{{hotelName}}: Your pre-check-in is complete! Show your ID at the express counter on {{checkInDate}}. See you soon!',
  bodyFr:
    '{{hotelName}}: Votre pré-enregistrement est complété ! Présentez votre pièce d\'identité au comptoir express le {{checkInDate}}. À bientôt !',
};
