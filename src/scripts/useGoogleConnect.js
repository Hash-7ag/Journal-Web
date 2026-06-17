import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import api from './api';
import { capitalize } from './capitalize';

// хук возвращает { connect, loading, error }
// onSuccess вызывается после успешной привязки (например перезагрузить профиль)
export function useGoogleConnect(role, onSuccess) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        // 1. получить данные пользователя у Google по access_token
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const { email, sub: googleId, picture } = userInfo.data;

        // 2. отправить на бэк (привязать к текущему юзеру)
        await api.patch(`/${role}/updateMyEmailAs${capitalize(role)}`, {
          email,
          googleId,
          picture,
        });

        onSuccess?.();
      } catch (err) {
        setError(err.response?.data?.message || 'Email təsdiqlənə bilmədi');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google ilə əlaqə qurulmadı');
      setLoading(false);
    },
  });

  return { connect: login, loading, error };
}
