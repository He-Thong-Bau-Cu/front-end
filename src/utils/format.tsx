import moment from 'moment-timezone';

export const getTimeAgo = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').fromNow();
}

export const formatDate = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
}

export const formatDateOfBirth = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').format('DD-HH-YYYY');
}
