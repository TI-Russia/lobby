import $ from 'jquery';

import initChart from './chart';
import { getLayoutVars } from './layout_vars';

$(document).ready(function() {
    if (getLayoutVars().layout === 'default') {
        $('.hero-body').addClass('is-loading');
        initChart();
    }
});