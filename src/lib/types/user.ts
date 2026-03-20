/**
 * 사용자 관련 타입 정의
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
}
