const axios = require('axios').default;

const NTU_DOMAIN = 'https://wish.wis.ntu.edu.sg';
const NTU_URL = '/webexe/owa/AUS_SCHEDULE.main_display1';

const ntuAxiosInstance = axios.create({
  baseURL: NTU_DOMAIN,
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
});

module.exports = { ntuAxiosInstance, NTU_URL };
