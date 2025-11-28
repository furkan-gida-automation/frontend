import Vue from 'vue'
import { 
    formatNumber,
    formatCount,
    formatDate,
    formatDateWithClock,
    formatThreeNumber
} from '@/util/helpers';

Vue.filter('formatNumber', formatNumber);
Vue.filter('formatThreeNumber', formatThreeNumber);
Vue.filter('formatCount', formatCount);
Vue.filter('formatDate', formatDate);
Vue.filter('formatDateWithClock', formatDateWithClock);
