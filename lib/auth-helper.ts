'use server';

import { NextRequest } from 'next/server';
import { getSessionCookie } from './cookies';
import { getUserByUserId } from './auth';

export async function getCurrentUser() {
  try {
    const sessionUserId = await getSessionCookie();
    // console.log("sessionToken", sessionToken)
    if (!sessionUserId) return null;

    const user = await getUserByUserId(sessionUserId);
    // console.log("user", user)
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}


// export async function getSessionUser(request: NextRequest) {
//   try {
//     // const sessionToken = request.cookies.get('auth_session')?.value;
//     const sessionToken = await getSessionCookie();
//     if (!sessionToken) return null;

//     const session = await getSessionByToken(sessionToken);
//     // console.log("session", session)
//     if (!session) {
//       return null;
//     }

//     const user = await getUserById(session.user_id);
//     return user;
//   } catch (error) {
//     console.error('Error getting session user:', error);
//     return null;
//   }
// }

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
