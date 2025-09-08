export async function notifyNewLead(lead:any) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ text: `New lead: ${lead.name} | ${lead.interest || '-'} | score ${lead.score} | bucket ${lead.bucket}` })
  });
}
