/* Maurice Mailing — export an approved mail proposal as an unsent RFC 5322 .eml draft. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return path.resolve(value);
};
const foldBase64 = (buffer) => buffer.toString('base64').match(/.{1,76}/g).join('\r\n');
const encodeHeader = (value) => `=?UTF-8?B?${Buffer.from(String(value), 'utf8').toString('base64')}?=`;
const addressList = (people) => people.map((person) => `${encodeHeader(person.name)} <${person.email}>`).join(', ');
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

const proposalPath = required('MAIL_PROPOSAL_JSON');
const outputPath = required('MAIL_DRAFT_EML');
const proposal = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));
if (proposal.status !== 'ready_for_approval' || proposal.mailWritesMade !== 0) {
  throw new Error('Mail proposal is not an unsent ready-for-approval proposal');
}
const imagePath = path.resolve(proposal.inlineImage.path);
const image = fs.readFileSync(imagePath);
if (sha256(image) !== proposal.inlineImage.sha256) throw new Error('Inline image SHA-256 differs from the proposal');

const mixedBoundary = `----=_MauriceMixed_${crypto.randomBytes(16).toString('hex')}`;
const relatedBoundary = `----=_MauriceRelated_${crypto.randomBytes(16).toString('hex')}`;
const lines = [
  `From: ${encodeHeader(proposal.sender?.name || 'Lieven Verdonck')} <${proposal.sender?.email || 'lieven.verdonck@microsoft.com'}>`,
  `To: ${addressList(proposal.recipients.to)}`,
  `Cc: ${addressList(proposal.recipients.cc)}`,
  `Subject: ${encodeHeader(proposal.subject)}`,
  'Date: Sun, 31 Aug 2026 08:00:00 +0200',
  'MIME-Version: 1.0',
  'X-Unsent: 1',
  `X-Maurice-Send-Hash: ${proposal.sendHash}`,
  `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
  '',
  `--${mixedBoundary}`,
  `Content-Type: multipart/related; boundary="${relatedBoundary}"; type="text/html"`,
  '',
  `--${relatedBoundary}`,
  'Content-Type: text/html; charset="utf-8"',
  'Content-Transfer-Encoding: base64',
  '',
  foldBase64(Buffer.from(proposal.bodyHtml, 'utf8')),
  `--${relatedBoundary}`,
  `Content-Type: ${proposal.inlineImage.contentType}; name="${proposal.inlineImage.fileName}"`,
  'Content-Transfer-Encoding: base64',
  `Content-Disposition: inline; filename="${proposal.inlineImage.fileName}"`,
  `Content-ID: <${proposal.inlineImage.contentId}>`,
  `Content-Location: ${proposal.inlineImage.fileName}`,
  '',
  foldBase64(image),
  `--${relatedBoundary}--`,
  `--${mixedBoundary}--`,
  '',
];
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join('\r\n'), 'utf8');
console.log(`WROTE ${outputPath}`);
console.log(`BYTES ${fs.statSync(outputPath).size} SEND_HASH ${proposal.sendHash} INLINE_IMAGE_SHA256 ${proposal.inlineImage.sha256}`);
