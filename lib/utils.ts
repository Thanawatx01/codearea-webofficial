/** Mask email logic: keep first 5, ***, last 3 before @, then domain */
export const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 8) {
    return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
  }
  return `${local.slice(0, 5)}***${local.slice(-3)}@${domain}`;
};
