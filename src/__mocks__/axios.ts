import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

export const axiosMock = new AxiosMockAdapter(axios, { delayResponse: 100 });

export default axios;
