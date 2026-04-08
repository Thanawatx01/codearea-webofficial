/** Mask email logic: show3front...show3back@email.com */
export const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 6) {
    return `${local.slice(0, 1)}...${local.slice(-1)}@${domain}`;
  }
  return `${local.slice(0, 3)}...${local.slice(-3)}@${domain}`;
};
