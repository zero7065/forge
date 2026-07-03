export function calculateRiskScore(
  loginAttempt: { ipAddress: string; timestamp: string },
  userProfile: { lastLoginAvgSecOfDay: number; lastLoginCountry: string | null }
): number {
  let score = 0;

  const attemptTime = new Date(loginAttempt.timestamp);
  const attemptSecOfDay = attemptTime.getHours() * 3600 + attemptTime.getMinutes() * 60 + attemptTime.getSeconds();

  const timeDiff = Math.abs(attemptSecOfDay - userProfile.lastLoginAvgSecOfDay);
  const timeAnomaly = Math.min(timeDiff / 43200, 1);

  const countryChanged = userProfile.lastLoginCountry &&
    loginAttempt.ipAddress !== '0.0.0.0' &&
    userProfile.lastLoginCountry !== getCountryFromIP(loginAttempt.ipAddress);

  const geoChange = countryChanged ? 1 : 0;

  score = Math.min(0.5 * timeAnomaly + 0.5 * geoChange, 1.0);

  return score;
}

export function getCountryFromIP(ip: string): string {
  if (ip === '0.0.0.0' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'LOCAL';
  }
  return 'UNKNOWN';
}