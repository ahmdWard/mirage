export interface SessionData {
  tokenId: string;
  hash: string;
  ip: string;
  browser: string;
  os: string;
  createdAt: number;
  lastUsedAt?: number;
  rotationCount?: number;
}
